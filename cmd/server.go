package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

type Server struct {
	mux  *http.ServeMux
	db   *MovieDB
	Port int
	cfg  *Config
}

func NewServer(port int, cfg *Config) *Server {
	srv := Server{Port: port, mux: http.NewServeMux(), db: NewMovieDB(cfg.PageSize), cfg: cfg}

	srv.mux.Handle("/", http.FileServer(http.Dir("./ui")))

	srv.mux.HandleFunc("/movies", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetMovies(query, page))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/actors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetActors(query.Get("contains"), page))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/directors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetDirectors(query.Get("contains"), page))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/movies/top", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetSortedMovies(query, page))
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/genres", func(w http.ResponseWriter, r *http.Request) {
		payload, err := json.Marshal(srv.db.GetGenres())
		if err != nil {
			log.Println(err)
			return
		}
		SendJson(w, payload)
	})

	return &srv
}

func (s *Server) ListenAndServe() {
	log.Println("Serving on port", s.Port)
	http.ListenAndServe(fmt.Sprintf(":%d", s.Port), s.mux)
}
