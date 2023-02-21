package main

import (
	"fmt"
	"net/http"
	"strings"
)

func ValidateIndexes[C string | Movie](c *[]*C, start, end int) (int, int) {
	if start < 0 {
		start = 0
	}
	if end >= len(*c) {
		end = len(*c) - 1
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
