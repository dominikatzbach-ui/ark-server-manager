package api

import (
	"io/fs"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(static fs.FS) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"}, // Vite dev server
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", handleHealth)
		r.Get("/wine/health", handleWineHealth)
		r.Route("/servers", serverRoutes)
	})

	// Serve embedded frontend for all other routes
	r.Handle("/*", http.FileServer(http.FS(static)))

	return r
}
