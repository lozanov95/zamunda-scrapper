package main

import (
	"fmt"
	"net/http"
)

func ValidateIndexes[C []*string | []*Movie](c *C, start, end int) (int, int) {
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
