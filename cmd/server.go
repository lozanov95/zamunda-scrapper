package main

import (
	"compress/gzip"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
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

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func setHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Cache-Control", fmt.Sprintf("max-age=%d, public, must-revalidate, proxy-revalidate", 600))
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			h.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()

		h.ServeHTTP(gzipResponseWriter{Writer: gz, ResponseWriter: w}, r)
	})
}

func middleware(f func(http.ResponseWriter, *http.Request)) http.Handler {
	return setHeaders(http.HandlerFunc(f))
}

func NewServer(port int, cfg *Config) *Server {
	srv := Server{Port: port, mux: http.NewServeMux(), db: NewMovieDB(cfg.PageSize), cfg: cfg}

	srv.mux.Handle("/", setHeaders(http.FileServer(http.Dir("./ui"))))
	srv.mux.Handle("/movies", middleware(srv.handleMovies))
	srv.mux.Handle("/actors", middleware(srv.handleActors))
	srv.mux.Handle("/directors", middleware(srv.handleDirectors))
	srv.mux.Handle("/genres", middleware(srv.handleGenres))

	return &srv
}

func (s *Server) ListenAndServe() {
	log.Println("Serving on port", s.Port)

	err := http.ListenAndServe(fmt.Sprintf(":%d", s.Port), s.mux)
	if err != nil {
		log.Panicln(err)
	}
}
