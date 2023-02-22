package main

import (
	"encoding/json"
	"log"
	"os"
	"sort"
)

type MovieDB struct {
	movies    *map[string]*Movie
	actors    *map[string][]*Movie
	directors *map[string][]*Movie
	countries *map[string][]*Movie
	genres    *map[string][]*Movie
}

const (
	PAGE_SIZE = 100
)

func NewMovieDB() *MovieDB {
	movies := make(map[string]*Movie)
	movieBytes, err := os.ReadFile("movies.json")
	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(movieBytes, &movies)
	if err != nil {
		log.Fatal(err)
	}

	actors := make(map[string][]*Movie)
	directors := make(map[string][]*Movie)
	countries := make(map[string][]*Movie)
	genres := make(map[string][]*Movie)
	for _, movie := range movies {
		for _, actor := range movie.Actors {
			AppendToSliceInMap(&actors, actor, movie)
		}
		for _, director := range movie.Directors {
			AppendToSliceInMap(&directors, director, movie)

		}
		for _, country := range movie.Countries {
			AppendToSliceInMap(&countries, country, movie)
		}
		for _, genre := range movie.Genres {
			AppendToSliceInMap(&genres, genre, movie)
		}
	}

	return &MovieDB{
		movies:    &movies,
		actors:    &actors,
		directors: &directors,
		countries: &countries,
		genres:    &genres,
	}
}

func (db *MovieDB) GetMovies(contains string, start int) []*Movie {
	var movies []*Movie
	end := start + PAGE_SIZE

	if contains == "" {
		for _, movie := range *db.movies {
			movies = append(movies, movie)
		}
	} else {
		for _, movie := range *db.movies {
			if StringContainsInsensitive(movie.Title, contains) {
				movies = append(movies, movie)
			}
		}
	}

	start, end = ValidateIndexes(&movies, start, end)
	return movies[start:end]
}

func (db *MovieDB) GetMoviesForActor(name string) []*Movie {
	return (*db.actors)[name]
}

func (db *MovieDB) GetMoviesForCountry(name string) []*Movie {
	return (*db.countries)[name]
}

func (db *MovieDB) GetMoviesForDirector(name string) []*Movie {
	return (*db.directors)[name]
}

func (db *MovieDB) GetMoviesForGenre(name string) []*Movie {
	return (*db.genres)[name]
}

func (db *MovieDB) GetActors(contains string, startIndex int) []string {
	actors := GetMapKeysContainingSubstring(db.directors, contains)
	end := startIndex + PAGE_SIZE
	ValidateIndexes[string](&actors, startIndex, end)
	if startIndex >= len(actors) {
		return actors
	}

	return actors[startIndex:]
}

func (db *MovieDB) GetDirectors(contains string, startIndex int) []string {
	directors := GetMapKeysContainingSubstring(db.directors, contains)
	if startIndex >= len(directors) {
		return directors
	}

	return directors[startIndex:]
}

func (db *MovieDB) GetSortedMovies(contains string, startIndex int) []*Movie {
	movies := db.GetMovies(contains, 0)
	sortedMovies := make([]*Movie, len(movies))
	copy(sortedMovies, movies)
	SortByRating(sortedMovies)

	start, end := ValidateIndexes(&sortedMovies, startIndex, startIndex+PAGE_SIZE)
	return sortedMovies[start:end]
}

func GetMapKeysContainingSubstring(m *map[string][]*Movie, str string) []string {
	var result []string
	for key := range *m {
		if StringContainsInsensitive(key, str) {
			result = append(result, key)
		}
	}

	return result
}

func SortByRating(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return (movies)[i].Rating > (movies)[j].Rating
	})
}
