package embed

import (
	"embed"
	"io/fs"
	"log"
)

// static/ is populated by `make build-frontend` (copies web/dist here).
// In development the directory may be empty; the router falls back to a stub.
//
//go:embed static
var embeddedFS embed.FS

// StaticFS is the sub-filesystem rooted at the built frontend assets.
// Serve with http.FileServer(http.FS(StaticFS)).
var StaticFS fs.FS

func init() {
	sub, err := fs.Sub(embeddedFS, "static")
	if err != nil {
		log.Fatalf("embed: failed to create sub-FS: %v", err)
	}
	StaticFS = sub
}
