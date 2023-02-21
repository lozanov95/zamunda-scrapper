package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/text/encoding/charmap"
)

func Scrape() {
	start := time.Now()

	cfg := NewConfigFromJSON()
	pages := GetPagesCount()

	pagesChan := make(chan int)
	movieChan := make(chan *Movie, 100)

	for i := 0; i < cfg.Workers; i++ {
		go StartWorker(cfg, pagesChan, movieChan)
	}

	go func(pagesChan chan int, movieChan chan *Movie) {
		for i := 0; i <= pages; i++ {
			pagesChan <- i
		}

		close(pagesChan)
		fmt.Println("Total time:", time.Since(start))
		time.Sleep(10 * time.Second)
		close(movieChan)
	}(pagesChan, movieChan)

	var movies []*Movie
	for m := range movieChan {
		movies = append(movies, m)
	}

	jsonRes, err := json.Marshal(movies)
	if err != nil {
		log.Fatal(err)
	}

	os.WriteFile("movies.json", jsonRes, fs.FileMode(os.O_CREATE))

}

// Loads the variables from a config and them as a Config struct
func NewConfigFromJSON() *Config {
	f, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatalf("Failed to read config %s", err)
	}
	var cfg Config
	err = json.Unmarshal(f, &cfg)
	if err != nil {
		log.Fatalf("Failed to unmarshal data %s", err)
	}
	return &cfg
}

func NewZamundaClient(cfg *Config) *http.Client {
	jar, err := cookiejar.New(nil)
	if err != nil {
		log.Fatal(err)
	}
	client := http.Client{
		Jar: jar,
	}

	loginInfo := url.Values{}
	loginInfo.Set("username", cfg.Username)
	loginInfo.Set("password", cfg.Password)

	_, err = client.PostForm("https://zamunda.net/takelogin.php", loginInfo)
	if err != nil {
		log.Fatal(err)
	}
	return &client
}

// Start a golan worker
func StartWorker(cfg *Config, pages chan int, results chan *Movie) {
	client := NewZamundaClient(cfg)
	for p := range pages {
		ScrapeMoviePage(client, p, results)
		log.Println("scraped page", p)
		time.Sleep(500 * time.Millisecond)
	}
}

// Gets a windows1251 encoded interface and returns a utf8 reader
func DecodeWindows1251(r io.Reader) *bytes.Reader {
	decoder := charmap.Windows1251.NewDecoder()
	reader := decoder.Reader(r)

	utf8, err := io.ReadAll(reader)
	if err != nil {
		log.Fatal(err)
	}

	utf8Reader := bytes.NewReader(utf8)
	return utf8Reader
}

// Gets the first group from the regex submatch results as a string
func GetRegexGroup(re *regexp.Regexp, s string) string {
	match := re.FindStringSubmatch(s)
	if len(match) > 1 {
		return match[1]
	}

	return ""
}

// Parses the movie description for the given selection
func ParseDescription(s *goquery.Selection) *ExtractedMovieDescriptionResult {
	desc := s.Find(MOVIE_DESCRIPTION)
	text := desc.Text()
	director := strings.Split(GetRegexGroup(RX_DIRECTOR, text), ", ")
	actors := strings.Split(GetRegexGroup(RX_ACTORS, text), ", ")
	country := strings.Split(GetRegexGroup(RX_COUNTRY, text), ", ")
	description := GetRegexGroup(RX_DESCRIPTION, text)
	year, _ := strconv.Atoi(GetRegexGroup(RX_YEAR, text))

	return &ExtractedMovieDescriptionResult{
		Director:    director,
		Actors:      actors,
		Country:     country,
		Year:        year,
		Description: description,
	}
}

// Parses the movie genres for the given selection
func ParseGenres(s *goquery.Selection) []string {
	genresNode := s.Find(GENRES_SELECTOR)
	return GetTextFromSelectionNodes(genresNode)
}

// Parses the IMDB rating for the given selection
func ParseIMDBRating(s *goquery.Selection) float64 {
	rating := s.Find(IMDB_RATING)
	result, err := strconv.ParseFloat(rating.Text(), 64)

	if err != nil {
		return 0
	}

	return result
}

// Parses if there are BG audio and/or subs for the given selection
func ParseIconResults(s *goquery.Selection) *IconsResult {
	var ir IconsResult
	icons := s.Find(AUDIO_ICONS)
	icons.Each(func(i int, s *goquery.Selection) {
		src, _ := s.Attr("src")
		if strings.Contains(src, "bgaudio.png") {
			ir.BG_AUDIO = true
		}
		if strings.Contains(src, "bgsub.gif") {
			ir.BG_SUBS = true
		}
	})

	return &ir
}

// Parses the movie title from the selection
func ParseTitle(s *goquery.Selection) string {
	return s.Find(MOVIE_TITLE).First().Text()
}

func GetTextFromSelectionNodes(s *goquery.Selection) []string {
	var resultArr []string
	s.Each(func(i int, innerS *goquery.Selection) {
		resultArr = append(resultArr, innerS.Text())
	})

	return resultArr
}

// Returns the number of movie pages
func GetPagesCount() int {
	client := NewZamundaClient(NewConfigFromJSON())
	resp, err := client.Get("https://zamunda.net/catalogs/movies&t=movie")
	if err != nil {
		log.Fatal(err)
	}

	decodedReader := DecodeWindows1251(resp.Body)

	doc, err := goquery.NewDocumentFromReader(decodedReader)
	if err != nil {
		log.Fatal(err)
	}
	lpa := doc.Find(LAST_PAGE_ANCHOR)
	val, _ := lpa.Attr("href")
	pages, err := strconv.Atoi(GetRegexGroup(RX_LAST_PAGE, val))
	if err != nil {
		log.Fatal(err)
	}

	return pages
}

// Parses the torrent link
func ParseLink(s *goquery.Selection) string {
	linkNode := s.Find(MOVIE_LINK_SELECTOR).First()
	link, _ := linkNode.Attr("href")
	return link
}

func ParseSize(s *goquery.Selection) string {
	return s.Find(SIZE_SELECTOR).First().Text()
}

func ScrapeMoviePage(client *http.Client, page int, movieChan chan *Movie) {
	resp, err := client.Get(fmt.Sprintf("https://zamunda.net/catalogs/movies&t=movie&page=%d", page))
	if err != nil {
		log.Fatal(err)
	}

	decodedReader := DecodeWindows1251(resp.Body)

	doc, err := goquery.NewDocumentFromReader(decodedReader)
	if err != nil {
		log.Fatal(err)
	}

	if doc.Find(MOVIE_DESCRIPTION).Length() == 0 {
		log.Println("retrying page", page)
		time.Sleep(1 * time.Second)
		ScrapeMoviePage(client, page, movieChan)
		return
	}

	catalog_rows := doc.Find(CATALOG_ROWS)

	catalog_rows.Each(func(i int, s *goquery.Selection) {
		title := ParseTitle(s)
		if title == "" {
			return
		}

		desc := ParseDescription(s)
		genres := ParseGenres(s)
		rating := ParseIMDBRating(s)
		ir := ParseIconResults(s)
		link := ParseLink(s)
		size := ParseSize(s)

		movieChan <- &Movie{ExtractedMovieDescriptionResult: desc, Genres: genres, Rating: rating, IconsResult: ir, Title: title, Link: link, Size: size}
	})
}
