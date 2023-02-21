package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"regexp"
)

type Config struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Workers  int    `json:"workers"`
}

type ExtractedMovieDescriptionResult struct {
	Director    []string `json:"director"`
	Actors      []string `json:"actors"`
	Country     []string `json:"country"`
	Year        int      `json:"year"`
	Description string   `json:"description"`
}

type Movie struct {
	Title  string   `json:"title"`
	Genres []string `json:"genres"`
	*ExtractedMovieDescriptionResult
	*IconsResult

	// The IMDB rating of the movie
	Rating float64 `json:"rating"`
	Size   string  `json:"size"`
	Link   string  `json:"link"`
}

type IconsResult struct {
	// Does the movie have a BG AUDIO
	BG_AUDIO bool `json:"bg_audio"`

	// Does the movie have a BG SUBS
	BG_SUBS bool `json:"bg_subs"`
}

const (
	NEXT_PAGE           = ".gotonext"
	CATALOG_ROWS        = "table.test > tbody > tr"
	MOVIE_DESCRIPTION   = "td > #description"
	MOVIE_TITLE         = ".colheadd"
	AUDIO_ICONS         = "center > img"
	GENRES_SELECTOR     = "b > u"
	IMDB_RATING         = ".imdtextrating"
	LAST_PAGE_ANCHOR    = "font.red:nth-child(1) > a:nth-child(13)"
	SIZE_SELECTOR       = "tbody > tr:nth-child(2) > td:nth-child(5)"
	MOVIE_LINK_SELECTOR = ".colheadd > .notranslate"
)

var (
	RX_DIRECTOR    = regexp.MustCompile("Режисьор[: ]+([А-я ,-]+)")
	RX_ACTORS      = regexp.MustCompile("В ролите[: ]+([А-я ,-]+)")
	RX_COUNTRY     = regexp.MustCompile(" Държава[: ]+([А-я ,-]+)")
	RX_YEAR        = regexp.MustCompile(`Година[: ]+(\d{4})`)
	RX_DESCRIPTION = regexp.MustCompile("(?s)Резюме[: ]+([^#]+)")
	RX_LAST_PAGE   = regexp.MustCompile(`page=(\d{1,10})`)
)

var (
	scrape = flag.Bool("scrape", false, "Start scraping the movies")
)

func main() {
	flag.Parse()
	if *scrape {
		Scrape()
	}

	data, err := os.ReadFile("movies.bak.json")
	if err != nil {
		log.Fatal(err)
	}

	var movies []*Movie
	err = json.Unmarshal(data, &movies)
	if err != nil {
		log.Fatal()
	}

	mm := make(map[string][]*Movie)
	for _, movie := range movies {
		mm[movie.Title] = append(mm[movie.Title], movie)
	}
	fmt.Println("All Movies", len(movies))
	fmt.Println("Unique movies:", len(mm))
}
