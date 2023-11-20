package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func (srv *Server) handleMovies(w http.ResponseWriter, r *http.Request) {
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

	SendJson(w, res)
}

func (srv *Server) handleActors(w http.ResponseWriter, r *http.Request) {
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

	SendJson(w, res)
}

func (srv *Server) handleDirectors(w http.ResponseWriter, r *http.Request) {
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

	SendJson(w, res)
}

func (srv *Server) handleGenres(w http.ResponseWriter, r *http.Request) {
	payload, err := json.Marshal(srv.db.GetGenres())
	if err != nil {
		log.Println(err)
		return
	}

	SendJson(w, payload)
}
