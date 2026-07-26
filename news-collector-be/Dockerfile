# ---- build ----
FROM golang:1.23-alpine AS build
WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN VERSION=$(tr -d '[:space:]' < VERSION) \
    && CGO_ENABLED=0 go build -ldflags "-X main.version=${VERSION}" -o news-collector-be .

# ---- runtime ----
FROM alpine:3.21
WORKDIR /app

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

COPY --from=build --chown=app:app /build/news-collector-be .
COPY --from=build --chown=app:app /build/resources ./resources

USER app
EXPOSE 8080

ENTRYPOINT ["./news-collector-be"]
