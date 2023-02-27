package main

import (
	"net/url"
	"testing"
)

func TestConvertToTitleCase(t *testing.T) {
	str1 := "ДЖОН ТРАВОЛТА"
	expStr1 := "Джон Траволта"
	newStr1 := ConvertToTitleCase(str1)

	if newStr1 != expStr1 {
		t.Logf("Expected %s, got %s", expStr1, newStr1)
		t.Fail()
	}
	str2 := "леонардо ди Каприо"
	expStr2 := "Леонардо Ди Каприо"
	newStr2 := ConvertToTitleCase(str2)

	if newStr2 != expStr2 {
		t.Logf("Expected %s, got %s", expStr2, newStr1)
		t.Fail()
	}
}

func TestDoesMovieSatisfiesConditions(t *testing.T) {
	m := Movie{
		Title:                           "Test movie one",
		ExtractedMovieDescriptionResult: &ExtractedMovieDescriptionResult{Year: 2003},
		Rating:                          7,
	}
	m1 := Movie{
		Title:                           "Test movie two",
		ExtractedMovieDescriptionResult: &ExtractedMovieDescriptionResult{Year: 2003},
		Rating:                          7,
	}
	m2 := Movie{
		Title:                           "Test movie one",
		ExtractedMovieDescriptionResult: &ExtractedMovieDescriptionResult{Year: 1999},
		Rating:                          7,
	}
	m3 := Movie{
		Title:                           "Test movie one",
		ExtractedMovieDescriptionResult: &ExtractedMovieDescriptionResult{Year: 2003},
		Rating:                          5,
	}
	params := make(url.Values)
	params.Add("contains", "movie one")
	params.Add("fromYear", "2000")
	params.Add("minRating", "6")

	if !DoesMovieSatisfiesConditions(params, &m) {
		t.Fatal("Expected movie to satisfy the conditions, but it doesn't")
	}
	if DoesMovieSatisfiesConditions(params, &m1) {
		t.Fatal("The movie shouldn't satisfy the contains condition")
	}
	if DoesMovieSatisfiesConditions(params, &m2) {
		t.Fatal("The movie shouldn't satisfy the fromYear condition")
	}
	if DoesMovieSatisfiesConditions(params, &m3) {
		t.Fatal("The movie shouldn't satisfy the rating condition")
	}
}
