package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func serverRoutes(r chi.Router) {
	r.Get("/", listServers)
	r.Post("/", createServer)
	r.Route("/{id}", func(r chi.Router) {
		r.Get("/", getServer)
		r.Delete("/", deleteServer)
		r.Post("/start", startServer)
		r.Post("/stop", stopServer)
		r.Get("/logs", streamLogs)
	})
}

func listServers(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, []any{})
}

func createServer(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "not implemented"})
}

func getServer(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	writeJSON(w, http.StatusNotFound, map[string]string{"id": id, "message": "not found"})
}

func deleteServer(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "not implemented"})
}

func startServer(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "not implemented"})
}

func stopServer(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "not implemented"})
}

func streamLogs(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "not implemented"})
}
