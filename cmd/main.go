package main

import (
	"flag"
)

type Config struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Workers  int    `json:"workers"`
	PageSize int    `json:"pageSize"`
}

type Movie struct {
	Title  string   `json:"title"`
	Genres []string `json:"genres"`
	*ExtractedMovieDescriptionResult
	PreviewLink string `json:"previewLink"`
	// The IMDB rating of the movie
	Rating   float64   `json:"rating"`
	Torrents []Torrent `json:"torrents"`
}

type Torrent struct {
	Link string `json:"link"`
	Size string `json:"size"`
	*IconsResult
}

type IconsResult struct {
	// Does the movie have a BG AUDIO
	BG_AUDIO bool `json:"bg_audio"`

	// Does the movie have a BG SUBS
	BG_SUBS bool `json:"bg_subs"`
}

var (
	scrape = flag.Bool("scrape", false, "Start scraping the movies")
	serve  = flag.Bool("serve", false, "Serve the backend")
	port   = flag.Int("port", 80, "The port of the server")
)

func main() {
	flag.Parse()
	cfg := NewConfigFromJSON()

	if *scrape {
		Scrape(cfg)
	}
	if *serve {
		srv := NewServer(*port, cfg)
		srv.ListenAndServe()
	}
}
