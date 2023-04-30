package main

import (
	"sync"
	"time"
)

type MovieCache struct {
	Timeout time.Duration
	data    map[string]*CacheEntry
	mutex   sync.Mutex
}

type CacheEntry struct {
	data    *[]*Movie
	entries int
	timeout time.Time
}

func NewCacheEntry(timeout time.Duration, movies *[]*Movie) *CacheEntry {
	return &CacheEntry{
		data:    movies,
		timeout: time.Now().Add(timeout),
		entries: len(*movies),
	}
}

func NewMovieCache(timeout, cleanupInterval time.Duration) *MovieCache {
	movieCache := &MovieCache{data: make(map[string]*CacheEntry), Timeout: timeout}

	go func(mc *MovieCache) {
		for {
			time.Sleep(cleanupInterval)
			mc.mutex.Lock()
			for key, entry := range movieCache.data {
				if time.Now().After(entry.timeout) {
					delete(movieCache.data, key)
				}
			}
			mc.mutex.Unlock()
		}
	}(movieCache)

	return movieCache
}

func (mc *MovieCache) Get(key string) ([]*Movie, int) {
	mc.mutex.Lock()
	defer mc.mutex.Unlock()
	val, ok := mc.data[key]
	if ok {
		return *val.data, val.entries
	}

	return []*Movie{}, 0
}

func (mc *MovieCache) Add(key string, movies *[]*Movie) {
	mc.mutex.Lock()
	defer mc.mutex.Unlock()
	mc.data[key] = NewCacheEntry(mc.Timeout, movies)
}
