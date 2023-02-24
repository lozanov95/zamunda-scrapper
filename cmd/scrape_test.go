package main

import "testing"

func TestScrape(t *testing.T) {
	cfg := NewConfigFromJSON("config_test.json")
	cfg.Workers = 5

	scrapper := NewScrapper(cfg)
	scrapper.Pages = 1
	scrapper.PageURL = "https://zamunda.net/catalogs/movies?letter=&t=movie&search=inheritance&field=name&comb=yes"
	scrapper.OutputFileName = "test_movies.json"
	scrapper.Scrape()
}
