package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthResponse is the JSON body for GET /health.
type HealthResponse struct {
	Status string `json:"status"`
	Time   string `json:"time"`
}

// HTTPError is a common JSON error envelope.
type HTTPError struct {
	Error string `json:"error"`
}

// Health godoc
// @Summary     Health check
// @Description Returns service status and current UTC time
// @Tags        health
// @Produce     json
// @Success     200 {object} api.HealthResponse
// @Router      /health [get]
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status: "ok",
		Time:   time.Now().UTC().Format(time.RFC3339),
	})
}
