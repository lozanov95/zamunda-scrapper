package main

import (
	"encoding/json"
	"log"
	"net/url"
	"os"
	"sort"
	"strconv"
	"time"
)

type MovieDB struct {
	movies    *[]*Movie
	actors    *[]string
	directors *[]string
	countries *[]string
	genres    *[]string
	pageSize  int
	MovieCache
}

type SortCriteria int

const (
	// Don't sort the movie
	SortSkip = iota

	// Sort the movies by rating in descending order
	SortRatingDescending
	// Sort the movies by rating in ascending order
	SortRatingAscending

	// Sort the movies by year descending order
	SortYearDescending
	// Sort the movies by year in ascending order
	SortYearAscending
)

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

	sort.Slice(genresList, func(i, j int) bool {
		return genresList[i] < genresList[j]
	})

	return &MovieDB{
		movies:     &movies,
		actors:     &actorsList,
		directors:  &directorsList,
		countries:  &countriesList,
		genres:     &genresList,
		pageSize:   pageSize,
		MovieCache: *NewMovieCache(5*time.Minute, 30*time.Second),
	}
}

func (db *MovieDB) GetMovies(queries url.Values, page int) ([]*Movie, int) {
	movies := []*Movie{}
	for _, movie := range *db.movies {
		if DoesMovieSatisfiesConditions(queries, movie) {
			movies = append(movies, movie)
		}
	}

	SortMovies(&queries, &movies)

	start := page * db.pageSize
	start, end := ValidateIndexes(&movies, start, start+db.pageSize, db.pageSize)
	return movies[start:end], len(movies)
}

func (db *MovieDB) GetMoviesWithCache(queries url.Values, page int) ([]*Movie, int) {
	cached, count := db.MovieCache.Get(queries.Encode())
	if count > 0 {
		start, end := ValidateIndexes(&cached, page*db.pageSize, page*db.pageSize+db.pageSize, db.pageSize)
		return cached[start:end], count
	}

	movies := []*Movie{}
	for _, movie := range *db.movies {
		if DoesMovieSatisfiesConditions(queries, movie) {
			movies = append(movies, movie)
		}
	}

	SortMovies(&queries, &movies)
	db.MovieCache.Add(queries.Encode(), &movies)
	start, end := ValidateIndexes(&movies, page*db.pageSize, page*db.pageSize+db.pageSize, db.pageSize)
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

func SortByRatingAscending(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return float64((movies)[i].Rating) < float64((movies)[j].Rating)
	})
}

func SortByRatingDescending(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return float64((movies)[i].Rating) > float64((movies)[j].Rating)
	})
}

func SortByYearAscending(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return int64((movies)[i].Year) < int64((movies)[j].Year)
	})
}

func SortByYearDescending(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return int64((movies)[i].Year) > int64((movies)[j].Year)
	})
}

func SortMovies(params *url.Values, movies *[]*Movie) {
	sort := params.Get("sort")
	if sort == "" {
		return
	}

	criteria, err := strconv.Atoi(sort)
	if err != nil {
		return
	}

	switch criteria {
	case SortRatingAscending:
		SortByRatingAscending(*movies)

	case SortRatingDescending:
		SortByRatingDescending(*movies)

	case SortYearAscending:
		SortByYearAscending(*movies)

	case SortYearDescending:
		SortByYearDescending(*movies)
	default:
		return
	}
}
