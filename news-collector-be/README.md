Common tasks are also available via [Just](https://github.com/casey/just) — see `Justfile` (`just --list`).

### Compile application
```bash
go build -o bin/news-collector-be .
```

### Run application
```bash
go run .
```

### Build Docker image
```bash
docker build -t news-collector-be:0.0.1 .
```

### Run Docker container
```bash
docker run --rm -p 8080:8080 news-collector-be:0.0.1
```

# Local Swagger
http://localhost:8080/swagger/index.html

---

## Tests

The suite uses an in-memory SQLite database seeded from `resources/test_data.sql`.

### Run the full suite
```bash
go test -race ./...
```

### Run integration tests
```bash
go test -race -tags=integration ./...
```

### Run a single package or test
```bash
go test -race ./internal/news
go test -race ./internal/news -run TestList
```

## Version

The app version is defined in `VERSION` and injected at build/run time via `ldflags`.
