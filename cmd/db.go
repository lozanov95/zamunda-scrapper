package main

import (
	"encoding/json"
	"log"
	"os"
	"sort"
)

type MovieDB struct {
	movies   *[]*Movie
	titles   *[]*string
	movieMap *map[*string][]*Movie
}

func NewMovieDB() *MovieDB {
	// db := MovieDB{}
	movies := []*Movie{}
	movieBytes, err := os.ReadFile("movies.json")
	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(movieBytes, &movies)
	if err != nil {
		log.Fatal(err)
	}

	movieMap := make(map[*string][]*Movie)
	for _, movie := range movies {
		movieMap[&movie.Title] = append(movieMap[&movie.Title], movie)
	}

	titles := []*string{}
	for m := range movieMap {
		titles = append(titles, m)
	}

	return &MovieDB{
		movies:   &movies,
		titles:   &titles,
		movieMap: &movieMap,
	}
}

func (db *MovieDB) GetMovies(start, end int) []*Movie {
	start, end = ValidateIndexes(db.movies, start, end)
	return (*db.movies)[start:end]
}

func (db *MovieDB) GetTitles(start, end int) []*string {
	start, end = ValidateIndexes(db.titles, start, end)
	return (*db.titles)[start:end]
}

func SortByRating(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return movies[i].Rating > movies[j].Rating
	})
}
