package main

import (
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func ValidateIndexes[C string | *Movie](c *[]C, start, end, pageSize int) (int, int) {
	if len(*c) == 0 {
		return 0, 0
	}
	if start > len(*c) {
		return len(*c), len(*c)
	}
	if start < 0 {
		start = 0
		end = start + pageSize
	}
	if end > len(*c) {
		if end+pageSize > len(*c) {
			return start, len(*c)
		}

		return start, end + pageSize
	}

	return start, end
}

func SendJson(w http.ResponseWriter, data []byte) {
	w.Header().Add("Content-Type", "application/json")
	fmt.Fprint(w, string(data))
}

func IsStringInSlice(collection []string, s string) bool {
	for _, str := range collection {
		if StringContainsInsensitive(str, s) {
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
