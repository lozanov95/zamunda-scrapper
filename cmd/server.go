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

type GetMoviesResponse struct {
	Value []*Movie `json:"value"`
	Count int      `json:"count"`
}

func NewServer(port int, cfg *Config) *Server {
	srv := Server{Port: port, mux: http.NewServeMux(), db: NewMovieDB(cfg.PageSize), cfg: cfg}

	srv.mux.Handle("/", http.FileServer(http.Dir("./ui")))

	srv.mux.HandleFunc("/movies", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		log.Printf("[%s] %s ", r.RemoteAddr, query)
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}
		query.Del("page")
		movies, count := srv.db.GetMoviesWithCache(query, page)
		res, err := json.Marshal(GetMoviesResponse{Value: movies, Count: count})
		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("Cache-Control", "max-age=3600")
		w.Header().Add("Access-Control-Allow-Origin", "*")
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/actors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetActors(&query, page))
		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("Cache-Control", "max-age=3600")
		w.Header().Add("Access-Control-Allow-Origin", "*")
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/directors", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		page, err := strconv.Atoi(query.Get("page"))
		if err != nil {
			page = 0
		}

		res, err := json.Marshal(srv.db.GetDirectors(&query, page))
		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Cache-Control", "max-age=3600")
		SendJson(w, res)
	})

	srv.mux.HandleFunc("/genres", func(w http.ResponseWriter, r *http.Request) {
		payload, err := json.Marshal(srv.db.GetGenres())
		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Cache-Control", "max-age=3600")
		SendJson(w, payload)
	})

	return &srv
}

func (s *Server) ListenAndServe() {
	log.Println("Serving on port", s.Port)
	err := http.ListenAndServeTLS(fmt.Sprintf(":%d", s.Port), "./tls/server.rsa.crt", "./tls/server.rsa.key", s.mux)
	if err != nil {
		log.Panicln(err)
	}
}
