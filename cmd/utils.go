package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func ValidateIndexes[C string | *Movie](c *[]C, start, end, pageSize int) (int, int) {
	if len(*c) == 0 {
		return 0, 0
	}
	if start > len(*c) {
		return len(*c), len(*c)
	}
	if start < 0 {
		start = 0
		end = start + pageSize
	}
	if end > len(*c) {
		if end+pageSize > len(*c) {
			return start, len(*c)
		}

		return start, end + pageSize
	}

	return start, end
}

func SendJson(w http.ResponseWriter, data []byte) {
	w.Header().Add("Content-Type", "application/json")
	fmt.Fprint(w, string(data))
}

func IsStringInSlice(collection []string, s string) bool {
	for _, str := range collection {
		if StringContainsInsensitive(str, s) {
			return true
		}
	}

	return false
}

func AppendToSliceInMap[T Movie](newM *map[string][]*T, key string, t *T) {
	slice := (*newM)[key]
	slice = append(slice, t)
	(*newM)[key] = slice
}

// Returns if the substring is contained in the string. Ignores case.
func StringContainsInsensitive(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

func ConvertToTitleCase(s string) string {
	caser := cases.Title(language.Bulgarian)
	return caser.String(s)
}

// Checks if the movie validates all of the given query conditions
func DoesMovieSatisfiesConditions(params url.Values, movie *Movie) bool {
	if ValidateFromYear(&params, movie) &&
		ValidateTitle(&params, movie) &&
		ValidateMinRating(&params, movie) &&
		ValidateGenres(&params, movie) &&
		ValidateDirectors(&params, movie) &&
		ValidateActors(&params, movie) &&
		ValidateCountries(&params, movie) &&
		ValidateBGAudio(&params, movie) &&
		ValidateBGSubs(&params, movie) {
		return true
	}

	return false
}

func ValidateTitle(params *url.Values, m *Movie) bool {
	contains := params.Get("contains")
	if contains != "" && !StringContainsInsensitive(m.Title, contains) {
		return false
	}

	return true
}

func ValidateFromYear(params *url.Values, m *Movie) bool {
	fromYear := params.Get("fromYear")
	if fromYear == "" {
		return true
	}

	year, err := strconv.Atoi(fromYear)
	if err != nil {
		log.Println(err)
		return false
	}
	if m.Year < year {
		return false
	}

	return true
}

func ValidateMinRating(params *url.Values, m *Movie) bool {
	minRating := params.Get("minRating")
	if minRating == "" {
		return true
	}

	rating, err := strconv.ParseFloat(minRating, 32)
	if err != nil {
		log.Println(err)
		return false
	}
	if m.Rating < rating {
		return false
	}

	return true
}

func ValidateGenres(params *url.Values, m *Movie) bool {
	genres := params.Get("genres")
	if genres == "" {
		return true
	}
	for _, genre := range strings.Split(genres, ",") {
		if !IsStringInSlice(m.Genres, genre) {
			return false
		}
	}
	return true
}

func ValidateActors(params *url.Values, m *Movie) bool {
	actors := params.Get("actors")
	if actors == "" {
		return true
	}
	for _, actor := range strings.Split(actors, ",") {
		if !IsStringInSlice(m.Actors, actor) {
			return false
		}
	}
	return true
}

func ValidateDirectors(params *url.Values, m *Movie) bool {
	directors := params.Get("directors")
	if directors == "" {
		return true
	}
	for _, director := range strings.Split(directors, ",") {
		if !IsStringInSlice(m.Directors, director) {
			return false
		}
	}
	return true
}

func ValidateCountries(params *url.Values, m *Movie) bool {
	countries := params.Get("countries")
	if countries == "" {
		return true
	}
	for _, country := range strings.Split(countries, ",") {
		if !IsStringInSlice(m.Countries, country) {
			return false
		}
	}
	return true
}

func ValidateBGAudio(params *url.Values, m *Movie) bool {
	if params.Get("bgaudio") != "1" {
		return true
	}

	for _, torrent := range m.Torrents {
		if torrent.BG_AUDIO {
			return true
		}
	}

	return false
}

func ValidateBGSubs(params *url.Values, m *Movie) bool {
	if params.Get("bgsubs") != "1" {
		return true
	}

	for _, torrent := range m.Torrents {
		if torrent.BG_SUBS {
			return true
		}
	}

	return false
}
