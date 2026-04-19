package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"news-collector-be/docs"
	"news-collector-be/internal/api"
	"news-collector-be/internal/core"
	"news-collector-be/internal/db"
	"news-collector-be/internal/feed"
	"news-collector-be/internal/news"
)

func setSwaggerInfo(cfg *core.Config) {
	docs.SwaggerInfo.Host = cfg.BaseURL + ":" + cfg.Port
	docs.SwaggerInfo.BasePath = "/v1"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Title = "News Collector API"
	docs.SwaggerInfo.Description = "REST API for the control panel news service."
}

func main() {
	cfg, err := core.Load()
	if err != nil {
		slog.Error("failed to load config", "err", err)
		os.Exit(1)
	}

	setSwaggerInfo(cfg)

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: cfg.LogLevel,
	}))
	slog.SetDefault(logger)

	store, err := db.OpenSQLite()
	if err != nil {
		slog.Error("failed to open database", "err", err)
		os.Exit(1)
	}
	defer func() { _ = store.Close() }()

	newsRepo := news.NewSQLRepository(store)
	feedRepo := feed.NewSQLRepository(store)

	router := api.NewRouter(newsRepo, feedRepo)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
	}

	go func() {
		slog.Info("starting server", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("shutdown error", "err", err)
		os.Exit(1)
	}
	slog.Info("server stopped")
}
