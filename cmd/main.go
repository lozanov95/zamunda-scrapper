package main

import (
	"flag"
	"regexp"
)

type Config struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Workers  int    `json:"workers"`
}

type Movie struct {
	Title  string   `json:"title"`
	Genres []string `json:"genres"`
	*ExtractedMovieDescriptionResult
	*IconsResult

	// The IMDB rating of the movie
	Rating float64 `json:"rating"`
	Size   string  `json:"size"`
	Link   string  `json:"link"`
}

type IconsResult struct {
	// Does the movie have a BG AUDIO
	BG_AUDIO bool `json:"bg_audio"`

	// Does the movie have a BG SUBS
	BG_SUBS bool `json:"bg_subs"`
}

var (
	RX_DIRECTOR    = regexp.MustCompile("Режисьор[: ]+([А-я ,-]+)")
	RX_ACTORS      = regexp.MustCompile("В ролите[: ]+([А-я ,-]+)")
	RX_COUNTRY     = regexp.MustCompile(" Държава[: ]+([А-я ,-]+)")
	RX_YEAR        = regexp.MustCompile(`Година[: ]+(\d{4})`)
	RX_DESCRIPTION = regexp.MustCompile("(?s)Резюме[: ]+([^#]+)")
	RX_LAST_PAGE   = regexp.MustCompile(`page=(\d{1,10})`)
)

var (
	scrape = flag.Bool("scrape", false, "Start scraping the movies")
	serve  = flag.Bool("serve", false, "Serve the backend")
	port   = flag.Int("port", 80, "The port of the server")
)

func main() {
	flag.Parse()
	if *scrape {
		Scrape()
	}
	if *serve {
		srv := NewServer(*port)
		srv.ListenAndServe()
	}
}
