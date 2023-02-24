package main

import (
	"testing"
)

func TestScrape(t *testing.T) {
	cfg := NewConfigFromJSON("config_test.json")
	cfg.Workers = 1

	s := NewScrapper(cfg)
	s.PageURL = "https://zamunda.net/catalogs/movies?search=Zombies+of+Mass+Destruction"
	s.Pages = 1
	s.OutputFileName = "test_movies.json"
	s.Scrape()
}
