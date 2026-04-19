.PHONY: tidy run run-dev build test lint clean reset-db swagger

BIN=bin/news-collector-be
DB_FILE=news.db
# Prefer `swag` on PATH (faster). If missing, same version as go.mod via `go run`.
_SWAG_PATH := $(shell command -v swag 2>/dev/null)
ifeq ($(_SWAG_PATH),)
SWAG := go run github.com/swaggo/swag/cmd/swag@v1.8.12
else
SWAG := $(_SWAG_PATH)
endif

tidy:
	go mod tidy

swagger:
	$(SWAG) init -g main.go -o docs --parseInternal

run:
	go run .

run-dev:
	SEED_PATH=resources/local_data.sql LOG_LEVEL=debug go run .

build:
	mkdir -p bin
	go build -o $(BIN) .

test:
	go test ./...

lint:
	go vet ./...

clean:
	rm -rf bin

reset-db:
	rm -f $(DB_FILE) $(DB_FILE)-wal $(DB_FILE)-shm
