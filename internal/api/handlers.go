package api

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/ave-dev/ark-server-manager/internal/wine"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleWineHealth(w http.ResponseWriter, r *http.Request) {
	prefixPath := os.Getenv("ARK_WINE_PREFIX")
	if prefixPath == "" {
		prefixPath = os.ExpandEnv("${HOME}/.local/share/ark-sa-wine")
	}

	env := wine.DefaultEnvironment(prefixPath)

	type wineStatus struct {
		Linux     bool   `json:"linux"`
		Installed bool   `json:"installed"`
		Prefix    string `json:"prefix"`
		Error     string `json:"error,omitempty"`
	}

	status := wineStatus{
		Linux:  wine.IsLinux(),
		Prefix: prefixPath,
	}

	if err := wine.CheckWineInstalled(); err != nil {
		status.Installed = false
		status.Error = err.Error()
		writeJSON(w, http.StatusServiceUnavailable, status)
		return
	}
	status.Installed = true

	if err := wine.HealthCheck(env); err != nil {
		status.Error = err.Error()
		writeJSON(w, http.StatusServiceUnavailable, status)
		return
	}

	writeJSON(w, http.StatusOK, status)
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
