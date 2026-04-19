package news

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"news-collector-be/internal/core"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

// List godoc
// @Summary     List news
// @Description Returns news optionally filtered by feed(s), category(ies), read state and limit. `feedIds` and `categoryIds` are CSV lists and combine in OR.
// @Tags        news
// @Produce     json
// @Param       feedIds query string false "Feed IDs (CSV, e.g. 1,2,3)"
// @Param       categoryIds query string false "Category IDs (CSV, e.g. 1,2)"
// @Param       read query bool false "Read filter"
// @Param       limit query int false "Limit (0 = all)"
// @Success     200 {array} news.News
// @Failure     400 {object} api.HTTPError
// @Failure     500 {object} api.HTTPError
// @Router      /api/v1/news [get]
func (h *Handler) List(c *gin.Context) {
	filter := ListFilter{}

	feedIDs, err := parseIDList(c.Query("feedIds"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid feedIds: " + err.Error()})
		return
	}
	filter.FeedIDs = feedIDs

	categoryIDs, err := parseIDList(c.Query("categoryIds"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid categoryIds: " + err.Error()})
		return
	}
	filter.CategoryIDs = categoryIDs

	if v := c.Query("read"); v != "" {
		b, err := strconv.ParseBool(v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid read"})
			return
		}
		filter.Read = &b
	}
	if v := c.Query("limit"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
			return
		}
		filter.Limit = n
	}

	items, err := h.repo.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// parseIDList interpreta una stringa CSV di interi positivi (es. "1,2,3").
// Stringa vuota → slice nil (nessun filtro). Elementi duplicati o vuoti
// vengono ignorati silenziosamente; un valore non parsabile è invece un
// errore esplicito.
func parseIDList(raw string) ([]int64, error) {
	if raw == "" {
		return nil, nil
	}
	parts := strings.Split(raw, ",")
	out := make([]int64, 0, len(parts))
	seen := make(map[int64]struct{}, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		id, err := strconv.ParseInt(p, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("%q is not a valid integer", p)
		}
		if _, dup := seen[id]; dup {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out, nil
}

// MarkRead godoc
// @Summary     Mark news read state
// @Tags        news
// @Accept      json
// @Produce     json
// @Param       id path int true "News ID"
// @Param       body body news.MarkReadRequest true "Read flag"
// @Success     204
// @Failure     400 {object} api.HTTPError
// @Failure     404 {object} api.HTTPError
// @Failure     500 {object} api.HTTPError
// @Router      /api/v1/news/{id}/read [patch]
func (h *Handler) MarkRead(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var body MarkReadRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.MarkRead(c.Request.Context(), id, body.Read); err != nil {
		if errors.Is(err, core.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "news not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func parseID(c *gin.Context) (int64, error) {
	return strconv.ParseInt(c.Param("id"), 10, 64)
}
