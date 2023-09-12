package main

import (
	"net/url"
	"testing"
)

func BenchmarkGetMovies(b *testing.B) {
	var db = NewMovieDB(10)
	url_vals := make(url.Values)
	for n := 0; n < b.N; n++ {
		db.GetMovies(url_vals, 0)
		db.GetMovies(url_vals, 1)
		db.GetMovies(url_vals, 2)
	}
}
func BenchmarkGetCachedMovies(b *testing.B) {
	var db = NewMovieDB(10)
	url_vals := make(url.Values)
	for n := 0; n < b.N; n++ {
		db.GetMoviesWithCache(url_vals, 0)
		db.GetMoviesWithCache(url_vals, 1)
		db.GetMoviesWithCache(url_vals, 2)
	}
}
func BenchmarkGetMoviesWithParams(b *testing.B) {
	var db = NewMovieDB(10)
	url_vals := make(url.Values)
	url_vals.Add("fromYear", "2000")
	url_vals.Add("minRating", "5")
	url_vals.Add("genres", "Европейски")
	url_vals.Add("bgaudio", "1")
	for n := 0; n < b.N; n++ {
		db.GetMovies(url_vals, 0)
		db.GetMovies(url_vals, 1)
		db.GetMovies(url_vals, 2)
	}
}
func BenchmarkGetCachedMoviesWithParams(b *testing.B) {
	var db = NewMovieDB(10)
	url_vals := make(url.Values)
	url_vals.Add("fromYear", "2000")
	url_vals.Add("minRating", "5")
	url_vals.Add("genres", "Европейски")
	url_vals.Add("bgaudio", "1")
	for n := 0; n < b.N; n++ {
		db.GetMoviesWithCache(url_vals, 0)
		db.GetMoviesWithCache(url_vals, 1)
		db.GetMoviesWithCache(url_vals, 2)
	}
}
