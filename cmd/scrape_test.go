package main

import (
	"os"
	"testing"
)

func TestScrape(t *testing.T) {
	if os.Getenv("CI") != "" {
		t.Skip("skipping cloud run")
	}

	cfg := NewConfigFromJSON("config_test.json")
	cfg.Workers = 1

	s := NewScrapper(cfg)
	s.PageURL = "https://zamunda.net/catalogs/movies?search=Zombies+of+Mass+Destruction"
	s.Pages = 0
	s.OutputFileName = "test_movies.json"
	s.Scrape()
}
