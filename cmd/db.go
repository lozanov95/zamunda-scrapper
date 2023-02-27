package main

import (
	"encoding/json"
	"log"
	"os"
	"sort"
)

type MovieDB struct {
	movies    *[]*Movie
	actors    *map[string][]*Movie
	directors *map[string][]*Movie
	countries *map[string][]*Movie
	genres    *map[string][]*Movie
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
		pageSize:  pageSize,
	}
}

func (db *MovieDB) GetMovies(contains string, page int) []*Movie {
	start := page * db.pageSize
	end := start + db.pageSize

	if contains != "" {
		var movies []*Movie
		for _, movie := range *db.movies {
			if StringContainsInsensitive(movie.Title, contains) {
				movies = append(movies, movie)
			}
		}
		start, end = ValidateIndexes(&movies, start, end)
		return movies[start:end]
	}

	start, end = ValidateIndexes(db.movies, start, end)
	return (*db.movies)[start:end]
}

func (db *MovieDB) GetMoviesForActor(name string, page int) []*Movie {
	return (*db.actors)[name]
}

func (db *MovieDB) GetMoviesForCountry(name string, page int) []*Movie {
	return (*db.countries)[name]
}

func (db *MovieDB) GetMoviesForDirector(name string, page int) []*Movie {
	return (*db.directors)[name]
}

func (db *MovieDB) GetMoviesForGenre(name string, page int) []*Movie {
	name = ConvertToTitleCase(name)
	movies := (*db.genres)[name]
	var mv []*Movie
	for _, m := range movies {
		for _, t := range m.Torrents {
			if t.BG_AUDIO && m.Year > 2010 {
				mv = append(mv, m)
				break
			}
		}
	}

	return mv
}

func (db *MovieDB) GetActors(contains string, page int) []string {
	actors := GetMapKeysContainingSubstring(db.directors, contains)
	start := page * db.pageSize
	end := start + db.pageSize

	start, end = ValidateIndexes(&actors, start, end)
	return actors[start:end]
}

func (db *MovieDB) GetDirectors(contains string, page int) []string {
	directors := GetMapKeysContainingSubstring(db.directors, contains)
	start := page * db.pageSize
	end := start + db.pageSize

	start, end = ValidateIndexes(&directors, start, end)
	return directors[start:end]
}

func (db *MovieDB) GetSortedMovies(contains string, page int) []*Movie {
	movies := db.GetMovies(contains, 0)
	sortedMovies := make([]*Movie, len(movies))
	copy(sortedMovies, movies)
	SortByRating(sortedMovies)

	start := page * db.pageSize
	end := start + db.pageSize

	start, end = ValidateIndexes(&sortedMovies, start, end)
	return sortedMovies[start:end]
}

func (db *MovieDB) GetGenres() []string {
	var genres []string

	for genre, _ := range *db.genres {
		genres = append(genres, genre)
	}

	return genres
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
