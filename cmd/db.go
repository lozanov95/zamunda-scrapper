package main

import (
	"encoding/json"
	"log"
	"net/url"
	"os"
	"sort"
)

type MovieDB struct {
	movies    *[]*Movie
	actors    *[]string
	directors *[]string
	countries *[]string
	genres    *[]string
	pageSize  int
}

func NewMovieDB(pageSize int) *MovieDB {
	movieBytes, err := os.ReadFile("movies.json")
	if err != nil {
		log.Fatal(err)
	}

	movies := []*Movie{}
	err = json.Unmarshal(movieBytes, &movies)
	if err != nil {
		log.Fatal(err)
	}
	actors := make(map[string]bool)
	directors := make(map[string]bool)
	countries := make(map[string]bool)
	genres := make(map[string]bool)

	for _, m := range movies {
		for _, actor := range m.Actors {
			actors[actor] = true
		}
		for _, director := range m.Directors {
			directors[director] = true
		}
		for _, country := range m.Countries {
			countries[country] = true
		}
		for _, genre := range m.Genres {
			genres[genre] = true
		}
	}

	actorsList := make([]string, 0)
	directorsList := make([]string, 0)
	countriesList := make([]string, 0)
	genresList := make([]string, 0)

	for k := range actors {
		actorsList = append(actorsList, k)
	}
	for k := range directors {
		directorsList = append(directorsList, k)
	}
	for k := range countries {
		countriesList = append(countriesList, k)
	}
	for k := range genres {
		genresList = append(genresList, k)
	}

	return &MovieDB{
		movies:    &movies,
		actors:    &actorsList,
		directors: &directorsList,
		countries: &countriesList,
		genres:    &genresList,
		pageSize:  pageSize,
	}
}

func (db *MovieDB) GetMovies(queries url.Values, page int) ([]*Movie, int) {
	start := page * db.pageSize
	end := start + db.pageSize

	movies := []*Movie{}
	for _, movie := range *db.movies {
		if DoesMovieSatisfiesConditions(queries, movie) {
			movies = append(movies, movie)
		}
	}
	start, end = ValidateIndexes(&movies, start, end, db.pageSize)
	return movies[start:end], len(movies)
}

func (db *MovieDB) GetActors(params *url.Values, page int) []string {
	start := page * db.pageSize
	end := start + db.pageSize
	contains := params.Get("contains")
	if contains == "" {
		start, end = ValidateIndexes(db.actors, start, end, db.pageSize)
		return (*db.actors)[start:end]
	}

	var actors []string
	for _, actor := range *db.actors {
		if StringContainsInsensitive(actor, contains) {
			actors = append(actors, actor)
		}
	}

	start, end = ValidateIndexes(&actors, start, end, db.pageSize)
	return actors[start:end]
}

func (db *MovieDB) GetDirectors(params *url.Values, page int) []string {
	start := page * db.pageSize
	end := start + db.pageSize

	contains := params.Get("contains")
	if contains == "" {
		start, end = ValidateIndexes(db.directors, start, end, db.pageSize)
		return (*db.directors)[start:end]
	}

	var directors []string
	for _, director := range *db.directors {
		if StringContainsInsensitive(director, contains) {
			directors = append(directors, director)
		}
	}

	start, end = ValidateIndexes(&directors, start, end, db.pageSize)
	return directors[start:end]
}

func (db *MovieDB) GetSortedMovies(queries url.Values, page int) []*Movie {
	movies, _ := db.GetMovies(queries, 0)
	sortedMovies := make([]*Movie, len(movies))
	copy(sortedMovies, movies)
	SortByRating(sortedMovies)

	start := page * db.pageSize
	end := start + db.pageSize

	start, end = ValidateIndexes(&sortedMovies, start, end, db.pageSize)
	return sortedMovies[start:end]
}

func (db *MovieDB) GetGenres() []string {
	return *db.genres
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
