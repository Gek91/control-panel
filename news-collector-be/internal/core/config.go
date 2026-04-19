package core

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port              string
	BaseURL           string
	LogLevel          slog.Level
	ReadHeaderTimeout time.Duration
	ShutdownTimeout   time.Duration
}

func Load() (*Config, error) {
	level, err := parseLogLevel(getEnv("LOG_LEVEL", "info"))
	if err != nil {
		return nil, fmt.Errorf("invalid LOG_LEVEL: %w", err)
	}

	readHeaderTimeout, err := getEnvDuration("READ_HEADER_TIMEOUT", 5*time.Second)
	if err != nil {
		return nil, fmt.Errorf("invalid READ_HEADER_TIMEOUT: %w", err)
	}

	shutdownTimeout, err := getEnvDuration("SHUTDOWN_TIMEOUT", 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("invalid SHUTDOWN_TIMEOUT: %w", err)
	}

	return &Config{
		Port:                 getEnv("PORT", "8080"),
		BaseURL:              getEnv("BASE_URL", "http://localhost"),
		LogLevel:             level,
		ReadHeaderTimeout:    readHeaderTimeout,
		ShutdownTimeout:      shutdownTimeout,
	}, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) (time.Duration, error) {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return fallback, nil
	}
	if secs, err := strconv.Atoi(v); err == nil {
		return time.Duration(secs) * time.Second, nil
	}
	return time.ParseDuration(v)
}

func parseLogLevel(s string) (slog.Level, error) {
	var lvl slog.Level
	if err := lvl.UnmarshalText([]byte(strings.ToLower(strings.TrimSpace(s)))); err != nil {
		return 0, err
	}
	return lvl, nil
}
