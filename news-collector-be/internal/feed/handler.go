package feed

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

// ListByCategory godoc
// @Summary     List feeds grouped by category
// @Description Returns all feed categories, each containing the list of its feeds. Categories with no feeds are included with an empty list.
// @Tags        feeds
// @Produce     json
// @Success     200 {array} feed.CategoryWithFeeds
// @Failure     500 {object} api.HTTPError
// @Router      /api/v1/feeds [get]
func (h *Handler) ListByCategory(c *gin.Context) {
	items, err := h.repo.ListByCategory(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// ListCategories godoc
// @Summary     List feed categories
// @Description Returns all feed categories (id and name only), ordered by name.
// @Tags        feeds
// @Produce     json
// @Success     200 {array} feed.FeedCategory
// @Failure     500 {object} api.HTTPError
// @Router      /api/v1/feeds/categories [get]
func (h *Handler) ListCategories(c *gin.Context) {
	items, err := h.repo.ListCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}
