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

func TestValidateIndexes(t *testing.T) {
	pageSize := 20
	coll := make([]string, 35)

	start, end := ValidateIndexes(&coll, 40, 60, pageSize)
	startExp, endExp := 35, 35
	if start != startExp || end != endExp {
		t.Fatalf("Expected start:%d, end:%d, but got start:%d, end:%d", startExp, endExp, start, end)
	}

	start, end = ValidateIndexes(&coll, -1, 100, pageSize)
	startExp, endExp = 0, 20
	if start != startExp || end != endExp {
		t.Fatalf("Expected start:%d, end:%d, but got start:%d, end:%d", startExp, endExp, start, end)
	}

	start, end = ValidateIndexes(&coll, 20, 200, pageSize)
	startExp, endExp = 20, 35
	if start != startExp || end != endExp {
		t.Fatalf("Expected start:%d, end:%d, but got start:%d, end:%d", startExp, endExp, start, end)
	}
}

func TestTruncateRedundantInfo(t *testing.T) {
	s := "Seven Worlds One Planet: S1 [Uhdremux] Complete Season 1 / Седем Свята Една Планета [2160P] Целият Сезон I (2019)"
	res := TruncateRedundantInfo(s)
	expectedRes := "Seven Worlds One Planet: S1 Complete Season 1 / Седем Свята Една Планета Целият Сезон I"

	if res != expectedRes {
		t.Errorf("Expected \"%s\", got \"%s\" instead", expectedRes, res)
	}
}
