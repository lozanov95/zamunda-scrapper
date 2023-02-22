package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strconv"
)

type Server struct {
	mux  *http.ServeMux
	db   *MovieDB
	Port int
}

func NewServer(port int) *Server {
	srv := Server{Port: port, mux: http.NewServeMux(), db: NewMovieDB()}

	srv.mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})

	srv.mux.HandleFunc("/movies", func(w http.ResponseWriter, r *http.Request) {
		res, err := json.Marshal(srv.db.GetMovies(0, 100))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/actors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		idx, err := strconv.Atoi(query.Get("start"))
		if err != nil {
			idx = 0
		}

		res, err := json.Marshal(srv.db.GetActors(query.Get("contains"), idx))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/directors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		idx, err := strconv.Atoi(query.Get("start"))
		if err != nil {
			idx = 0
		}

		res, err := json.Marshal(srv.db.GetDirectors(query.Get("contains"), idx))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/movies/top", func(w http.ResponseWriter, r *http.Request) {
		sortedMovies := make([]*Movie, len(*srv.db.movies)-1)
		movies := srv.db.GetMovies(0, math.MaxInt)
		copy(sortedMovies, movies)
		SortByRating(sortedMovies)
		res, err := json.Marshal(sortedMovies[0:100])
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	return &srv
}

func (s *Server) ListenAndServe() {
	log.Println("Serving on port", s.Port)
	http.ListenAndServe(fmt.Sprintf(":%d", s.Port), s.mux)
}
