BINARY     := ark-server-manager
CMD        := ./cmd/server
DIST       := ./dist
WEB_DIR    := ./web
STATIC_DIR := ./internal/embed/static

GOOS_LINUX  := linux
GOARCH_AMD  := amd64
GOOS_WIN    := windows

.PHONY: all setup dev build build-linux build-windows build-all test lint clean

all: build

setup:
	cd $(WEB_DIR) && npm install

dev:
	@echo "Starting dev servers..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	go run $(CMD)

dev-frontend:
	cd $(WEB_DIR) && npm run dev

build: build-frontend build-linux

build-all: build-frontend build-linux build-windows

build-frontend:
	cd $(WEB_DIR) && npm run build
	rm -rf $(STATIC_DIR)
	cp -r $(WEB_DIR)/dist $(STATIC_DIR)

build-linux: build-frontend
	GOOS=$(GOOS_LINUX) GOARCH=$(GOARCH_AMD) go build \
		-ldflags="-s -w" \
		-o $(DIST)/$(BINARY) \
		$(CMD)

build-windows: build-frontend
	GOOS=$(GOOS_WIN) GOARCH=$(GOARCH_AMD) go build \
		-ldflags="-s -w" \
		-o $(DIST)/$(BINARY).exe \
		$(CMD)

test:
	go test ./...

lint:
	golangci-lint run ./...

clean:
	rm -rf $(DIST) $(STATIC_DIR) $(WEB_DIR)/dist $(WEB_DIR)/node_modules
