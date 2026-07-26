package api_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"news-collector-be/internal/api"
)

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	m.Run()
}

func TestHealth(t *testing.T) {
	r := gin.New()
	r.GET("/health", api.Health)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))

	var body api.HealthResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))

	assert.Equal(t, "ok", body.Status)

	ts, err := time.Parse(time.RFC3339, body.Time)
	require.NoError(t, err, "time must be RFC3339")
	assert.WithinDuration(t, time.Now().UTC(), ts, 5*time.Second)
}
