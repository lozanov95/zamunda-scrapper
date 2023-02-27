package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func ValidateIndexes[C string | *Movie](c *[]C, start, end int) (int, int) {
	if len(*c) == 0 {
		return 0, 0
	}
	if start < 0 || start > len(*c)-1 {
		start = 0
	}
	if end >= len(*c) || end < 0 {
		end = len(*c)
	}

	return start, end
}

func SendJson(w http.ResponseWriter, data []byte) {
	w.Header().Add("Content-Type", "application/json")
	fmt.Fprint(w, string(data))
}

func IsStringInSlice(collection []string, s string) bool {
	for _, str := range collection {
		if strings.Contains(str, s) {
			return true
		}
	}

	return false
}

func AppendToSliceInMap[T Movie](newM *map[string][]*T, key string, t *T) {
	slice := (*newM)[key]
	slice = append(slice, t)
	(*newM)[key] = slice
}

// Returns if the substring is contained in the string. Ignores case.
func StringContainsInsensitive(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

func ConvertToTitleCase(s string) string {
	caser := cases.Title(language.Bulgarian)
	return caser.String(s)
}

// Checks if the movie validates all of the given query conditions
func DoesMovieSatisfiesConditions(params url.Values, movie *Movie) bool {
	if ValidateFromYear(&params, movie) &&
		ValidateTitle(&params, movie) &&
		ValidateMinRating(&params, movie) {
		return true
	}

	return false
}

func ValidateTitle(params *url.Values, m *Movie) bool {
	contains := params.Get("contains")
	if contains != "" && !StringContainsInsensitive(m.Title, contains) {
		return false
	}

	return true
}

func ValidateFromYear(params *url.Values, m *Movie) bool {
	fromYear := params.Get("fromYear")
	if fromYear != "" {
		year, err := strconv.Atoi(fromYear)
		if err != nil {
			log.Println(err)
			return false
		}
		if m.Year < year {
			return false
		}
	}
	return true
}

func ValidateMinRating(params *url.Values, m *Movie) bool {
	minRating := params.Get("minRating")
	if minRating != "" {
		rating, err := strconv.ParseFloat(minRating, 32)
		if err != nil {
			log.Println(err)
			return false
		}
		if m.Rating < rating {
			return false
		}
	}

	return true
}
