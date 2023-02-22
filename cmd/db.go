package main

import (
	"encoding/json"
	"log"
	"os"
	"sort"
	"strings"
)

type MovieDB struct {
	movies    *[]*Movie
	titles    *map[string][]*Movie
	actors    *map[string][]*Movie
	directors *map[string][]*Movie
	countries *map[string][]*Movie
	movieMap  *map[string][]*Movie
}

func NewMovieDB() *MovieDB {
	movies := []*Movie{}
	movieBytes, err := os.ReadFile("movies.json")
	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(movieBytes, &movies)
	if err != nil {
		log.Fatal(err)
	}

	titles := make(map[string][]*Movie)
	for _, movie := range movies {
		titles[movie.Title] = append(titles[movie.Title], movie)
	}

	actors := make(map[string][]*Movie)
	directors := make(map[string][]*Movie)
	countries := make(map[string][]*Movie)
	genres := make(map[string][]*Movie)
	for _, movies := range titles {
		for _, m := range movies[0].Actors {
			AppendToSliceInMap(&actors, m, movies[0])
		}
		for _, m := range movies[0].Directors {
			AppendToSliceInMap(&directors, m, movies[0])

		}
		for _, m := range movies[0].Countries {
			AppendToSliceInMap(&countries, m, movies[0])
		}
		for _, m := range movies[0].Genres {
			AppendToSliceInMap(&genres, m, movies[0])
		}
	}

	return &MovieDB{
		movies:    &movies,
		movieMap:  &titles,
		actors:    &actors,
		directors: &directors,
		countries: &countries,
	}
}

func (db *MovieDB) GetMovies(start, end int) []*Movie {
	start, end = ValidateIndexes(db.movies, start, end)
	return (*db.movies)[start:end]
}

func (db *MovieDB) GetTitles(start, end int) []*string {
	var titles []*string
	for title := range *db.titles {
		titles = append(titles, &title)
	}
	start, end = ValidateIndexes(&titles, start, end)
	return titles[start:end]
}

func (db *MovieDB) GetMoviesForActor(name string) []*Movie {
	return (*db.actors)[name]
}

func (db *MovieDB) GetActors(contains string, startIndex int) []string {
	var actors []string
	for actor := range *db.actors {
		if strings.Contains(actor, contains) {
			actors = append(actors, actor)
		}
	}

	if startIndex >= len(actors) {
		return actors
	}

	return actors[startIndex:]
}

func SortByRating(movies []*Movie) {
	sort.Slice(movies, func(i, j int) bool {
		return movies[i].Rating > movies[j].Rating
	})
}
