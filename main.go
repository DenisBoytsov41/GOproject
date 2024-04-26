package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

var apiKey string

type Source struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}

type Article struct {
	Source      Source    `json:"source"`
	Author      string    `json:"author"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	URL         string    `json:"url"`
	URLToImage  string    `json:"urlToImage"`
	PublishedAt time.Time `json:"publishedAt"`
	Content     string    `json:"content"`
}

func (a *Article) FormatPublishedDate() string {
	year, month, day := a.PublishedAt.Date()
	return fmt.Sprintf("%d %v, %d", day, month, year)
}

type Results struct {
	Status       string    `json:"status"`
	TotalResults int       `json:"totalResults"`
	Articles     []Article `json:"articles"`
}

var cache = make(map[string]Results)

type Search struct {
	SearchKey  string
	NextPage   int
	TotalPages int
	Results    Results
}

func (s *Search) IsLastPage() bool {
	return s.NextPage >= s.TotalPages
}

func (s *Search) CurrentPage() int {
	if s.NextPage == 1 {
		return s.NextPage
	}
	return s.NextPage - 1
}

func (s *Search) PreviousPage() int {
	return s.CurrentPage() - 1
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	page := r.URL.Query().Get("page")

	log.Printf("Получен запрос на поиск новостей с запросом: %s, страница: %s\n", q, page)

	if q == "" {
		http.Error(w, "Необходим поисковый запрос", http.StatusBadRequest)
		return
	}

	nextPage, err := strconv.Atoi(page)
	if err != nil || nextPage < 1 {
		nextPage = 1
	}
	cacheKey := fmt.Sprintf("%s:%d", q, nextPage)
	if cachedResults, ok := cache[cacheKey]; ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		json.NewEncoder(w).Encode(cachedResults)
		return
	}

	pageSize := 20

	endpoint := fmt.Sprintf("https://newsapi.org/v2/everything?q=%s&pageSize=%d&page=%d&apiKey=%s&sortBy=publishedAt&language=ru",
		url.QueryEscape(q), pageSize, nextPage, apiKey)
	resp, err := http.Get(endpoint)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Не удалось получить данные: %s", resp.Status), http.StatusInternalServerError)
		return
	}

	var searchResults Results
	if err := json.NewDecoder(resp.Body).Decode(&searchResults); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalPages := int(math.Ceil(float64(searchResults.TotalResults) / float64(pageSize)))

	search := Search{
		SearchKey:  q,
		NextPage:   nextPage,
		TotalPages: totalPages,
		Results:    searchResults,
	}
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if nextPage > totalPages {
		search.NextPage = totalPages
	}
	if nextPage < 1 {
		search.NextPage = 1
	}

	cache[cacheKey] = search.Results

	json.NewEncoder(w).Encode(search)
}

func main() {
	apiKey = os.Getenv("NEWS_API_KEY")
	if apiKey == "" {
		log.Fatal("Необходимо указать ключ доступа к Newsapi.org в переменной окружения NEWS_API_KEY")
	}

	host := os.Getenv("APP_HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "5000"
	}

	addr := "localhost" + ":" + port

	mux := http.NewServeMux()
	mux.HandleFunc("/search", searchHandler)

	log.Printf("Сервер запущен на адресе: %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
