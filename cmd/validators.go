package main

import (
	"log"
	"net/url"
	"strconv"
	"strings"
)

// Checks if the movie validates all of the given query conditions
func DoesMovieSatisfiesConditions(params url.Values, movie *Movie) bool {
	return ValidateFromYear(&params, movie) &&
		ValidateTitle(&params, movie) &&
		ValidateMinRating(&params, movie) &&
		ValidateGenres(&params, movie) &&
		ValidateDirectors(&params, movie) &&
		ValidateActors(&params, movie) &&
		ValidateCountries(&params, movie) &&
		ValidateBGAudio(&params, movie) &&
		ValidateBGSubs(&params, movie)
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
