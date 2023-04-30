package main

import (
	"testing"
	"time"
)

func TestAdd(t *testing.T) {
	c := NewMovieCache(150*time.Millisecond, 150*time.Millisecond)
	movies := &[]*Movie{{Title: "test"}}
	c.Add("test", movies)
	t.Log(c.Get("test"))
	_, count := c.Get("test")
	if count != 1 {
		t.Errorf("Expected 1 item in the data, got %d items instead", count)
	}
	time.Sleep(200 * time.Millisecond)
	_, count = c.Get("test")
	if count != 0 {
		t.Errorf("Expected 0 items in the data, got %d items instead", count)
	}
}

func TestGet(t *testing.T) {
	c := NewMovieCache(5*time.Minute, 30*time.Second)
	movies := &[]*Movie{{Title: "test"}, {Title: "test 1"}}
	c.Add("test", movies)
	cached, count := c.Get("test")
	if count != 2 {
		t.Errorf("Expected %d count, got %d instead", 2, count)
	}
	if len(cached) != 2 {
		t.Errorf("Expected %d movies, got %d instead", 2, len(cached))
	}
}
