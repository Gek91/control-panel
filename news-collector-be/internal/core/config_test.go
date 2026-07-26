package core

import (
	"log/slog"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseLogLevel(t *testing.T) {
	t.Parallel()

	cases := []struct {
		in      string
		want    slog.Level
		wantErr bool
	}{
		{"debug", slog.LevelDebug, false},
		{"INFO", slog.LevelInfo, false},
		{" warn ", slog.LevelWarn, false},
		{"error", slog.LevelError, false},
		{"", 0, true},
		{"nope", 0, true},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.in, func(t *testing.T) {
			t.Parallel()
			got, err := parseLogLevel(tc.in)
			if tc.wantErr {
				assert.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestGetEnvDuration(t *testing.T) {
	const key = "NEWS_TEST_DURATION"

	cases := []struct {
		name     string
		value    string
		unset    bool
		fallback time.Duration
		want     time.Duration
		wantErr  bool
	}{
		{name: "unset uses fallback", unset: true, fallback: 7 * time.Second, want: 7 * time.Second},
		{name: "empty uses fallback", value: "", fallback: 3 * time.Second, want: 3 * time.Second},
		{name: "bare integer is seconds", value: "12", fallback: time.Second, want: 12 * time.Second},
		{name: "duration string", value: "250ms", fallback: time.Second, want: 250 * time.Millisecond},
		{name: "invalid value", value: "abc", fallback: time.Second, wantErr: true},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			if tc.unset {
				t.Setenv(key, "")
			} else {
				t.Setenv(key, tc.value)
			}

			got, err := getEnvDuration(key, tc.fallback)
			if tc.wantErr {
				assert.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestLoad_Defaults(t *testing.T) {
	for _, k := range []string{"PORT", "BASE_URL", "LOG_LEVEL", "READ_HEADER_TIMEOUT", "SHUTDOWN_TIMEOUT"} {
		t.Setenv(k, "")
	}

	cfg, err := Load()
	require.NoError(t, err)
	require.NotNil(t, cfg)

	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, "http://localhost", cfg.BaseURL)
	assert.Equal(t, slog.LevelInfo, cfg.LogLevel)
	assert.Equal(t, 5*time.Second, cfg.ReadHeaderTimeout)
	assert.Equal(t, 10*time.Second, cfg.ShutdownTimeout)
}

func TestLoad_Overrides(t *testing.T) {
	t.Setenv("PORT", "9090")
	t.Setenv("BASE_URL", "http://example.test")
	t.Setenv("LOG_LEVEL", "debug")
	t.Setenv("READ_HEADER_TIMEOUT", "2s")
	t.Setenv("SHUTDOWN_TIMEOUT", "30")

	cfg, err := Load()
	require.NoError(t, err)

	assert.Equal(t, "9090", cfg.Port)
	assert.Equal(t, "http://example.test", cfg.BaseURL)
	assert.Equal(t, slog.LevelDebug, cfg.LogLevel)
	assert.Equal(t, 2*time.Second, cfg.ReadHeaderTimeout)
	assert.Equal(t, 30*time.Second, cfg.ShutdownTimeout)
}

func TestLoad_InvalidValues(t *testing.T) {
	cases := []struct {
		name string
		env  map[string]string
	}{
		{"invalid log level", map[string]string{"LOG_LEVEL": "nope"}},
		{"invalid read header timeout", map[string]string{"READ_HEADER_TIMEOUT": "abc"}},
		{"invalid shutdown timeout", map[string]string{"SHUTDOWN_TIMEOUT": "xyz"}},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			for k, v := range tc.env {
				t.Setenv(k, v)
			}
			_, err := Load()
			assert.Error(t, err)
		})
	}
}
