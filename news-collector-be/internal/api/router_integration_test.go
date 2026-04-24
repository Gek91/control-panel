//go:build integration

package api_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"news-collector-be/internal/api"
	"news-collector-be/internal/feed"
	"news-collector-be/internal/news"
	"news-collector-be/internal/testutil"
)

// End-to-end tests that mount the full production router
// (api.NewRouter) on top of real SQL repositories backed by an in-memory
// SQLite store seeded with resources/test_data.sql. Each sub-test gets
// its own isolated DB so they can run in parallel.

// newTestRouter wires the real production router to a fresh seeded DB.
func newTestRouter(t *testing.T) *gin.Engine {
	t.Helper()
	store := testutil.NewStore(t)
	newsRepo := news.NewSQLRepository(store)
	feedRepo := feed.NewSQLRepository(store)
	return api.NewRouter(newsRepo, feedRepo)
}

// --- /health ------------------------------------------------------------

func TestRouter_Health(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodGet, "/health", "")

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))

	var body api.HealthResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	assert.Equal(t, "ok", body.Status)

	ts, err := time.Parse(time.RFC3339, body.Time)
	require.NoError(t, err, "time must be RFC3339")
	assert.WithinDuration(t, time.Now().UTC(), ts, 5*time.Second)
}

// --- GET /api/v1/news ---------------------------------------------------

func TestRouter_NewsList(t *testing.T) {
	// Expected order (default: published_at DESC, falling back to fetched_at):
	//   news 3 (12:00), 5 (11:00), 1 (10:00), 4 (fetched 09:00), 2 (08:00)
	cases := []struct {
		name    string
		query   string
		wantIDs []int64
	}{
		{"no filter returns all ordered by date", "", []int64{3, 5, 1, 4, 2}},
		{"feedIds filter", "?feedIds=1", []int64{1, 2}},
		{"multiple feedIds", "?feedIds=1,3", []int64{5, 1, 2}},
		{"categoryIds filter (joins feed)", "?categoryIds=1", []int64{3, 1, 4, 2}},
		{"feedIds OR categoryIds", "?feedIds=3&categoryIds=1", []int64{3, 5, 1, 4, 2}},
		{"read=true filter", "?read=true", []int64{2}},
		{"read=false filter", "?read=false", []int64{3, 5, 1, 4}},
		{"limit caps result", "?limit=2", []int64{3, 5}},
		{"unknown feedIds yields empty", "?feedIds=99", []int64{}},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/news"+tc.query, "")

			require.Equal(t, http.StatusOK, rec.Code, rec.Body.String())
			assert.Equal(t, tc.wantIDs, idsFrom(t, rec.Body.Bytes()))
		})
	}
}

func TestRouter_NewsList_SerializesNullableFields(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/news?feedIds=2", "")
	require.Equal(t, http.StatusOK, rec.Code)

	var items []map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &items))
	require.Len(t, items, 2)

	// news 3: published_at set, guid/summary NULL → omitempty hides them.
	three := itemByID(t, items, 3)
	assert.NotEmpty(t, three["publishedAt"])
	assert.NotContains(t, three, "guid")
	assert.NotContains(t, three, "summary")

	// news 4: published_at NULL → field omitted; fetchedAt is always present.
	four := itemByID(t, items, 4)
	assert.NotContains(t, four, "publishedAt")
	assert.NotEmpty(t, four["fetchedAt"])
}

func TestRouter_NewsList_BadRequest(t *testing.T) {
	cases := []struct {
		name  string
		query string
	}{
		{"invalid feedIds", "?feedIds=1,abc"},
		{"invalid categoryIds", "?categoryIds=x"},
		{"invalid read", "?read=maybe"},
		{"invalid limit non-numeric", "?limit=abc"},
		{"invalid limit negative", "?limit=-1"},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/news"+tc.query, "")
			assert.Equal(t, http.StatusBadRequest, rec.Code)
			assert.Contains(t, rec.Body.String(), `"error"`)
		})
	}
}

// --- PATCH /api/v1/news/:id/read ----------------------------------------

func TestRouter_NewsMarkRead_TogglesPersistence(t *testing.T) {
	t.Parallel()
	r := newTestRouter(t)

	// Initial state: news 1 is unread; only news 2 is read on feed 1.
	rec := doRequest(t, r, http.MethodGet, "/api/v1/news?feedIds=1&read=true", "")
	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, []int64{2}, idsFrom(t, rec.Body.Bytes()))

	// Mark news 1 as read.
	rec = doRequest(t, r, http.MethodPatch, "/api/v1/news/1/read", `{"read":true}`)
	require.Equal(t, http.StatusNoContent, rec.Code)
	assert.Empty(t, rec.Body.String())

	// Now the read=true list on feed 1 includes both 1 and 2.
	rec = doRequest(t, r, http.MethodGet, "/api/v1/news?feedIds=1&read=true", "")
	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, []int64{1, 2}, idsFrom(t, rec.Body.Bytes()))

	// Roll back to unread.
	rec = doRequest(t, r, http.MethodPatch, "/api/v1/news/1/read", `{"read":false}`)
	require.Equal(t, http.StatusNoContent, rec.Code)

	rec = doRequest(t, r, http.MethodGet, "/api/v1/news?feedIds=1&read=true", "")
	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, []int64{2}, idsFrom(t, rec.Body.Bytes()))
}

func TestRouter_NewsMarkRead_NotFound(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodPatch, "/api/v1/news/999/read", `{"read":true}`)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Contains(t, rec.Body.String(), "news not found")
}

func TestRouter_NewsMarkRead_BadInput(t *testing.T) {
	cases := []struct {
		name   string
		target string
		body   string
	}{
		{"invalid id", "/api/v1/news/abc/read", `{"read":true}`},
		{"malformed body", "/api/v1/news/1/read", `{"read":`},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			rec := doRequest(t, newTestRouter(t), http.MethodPatch, tc.target, tc.body)
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		})
	}
}

// --- GET /api/v1/feeds/categories ---------------------------------------

func TestRouter_FeedsListCategories(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/feeds/categories", "")
	require.Equal(t, http.StatusOK, rec.Code)

	var got []feed.FeedCategory
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))

	// Sorted by name (see repository_sql.ListCategories).
	assert.Equal(t, []feed.FeedCategory{
		{ID: 2, Name: "Economia"},
		{ID: 3, Name: "Sport"},
		{ID: 1, Name: "Tecnologia"},
		{ID: 4, Name: "Vuota"},
	}, got)
}

// --- GET /api/v1/feeds --------------------------------------------------

func TestRouter_FeedsListByCategory(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/feeds", "")
	require.Equal(t, http.StatusOK, rec.Code)

	var got []feed.CategoryWithFeeds
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	require.Len(t, got, 4, "every category is included, even those with no feeds")

	byName := map[string]feed.CategoryWithFeeds{}
	for _, c := range got {
		byName[c.Name] = c
	}

	assert.Equal(t, []string{"Economy"}, feedNames(byName["Economia"].Feeds))
	assert.Equal(t, []string{"Sport1"}, feedNames(byName["Sport"].Feeds))
	assert.Equal(t, []string{"HN", "TechCr"}, feedNames(byName["Tecnologia"].Feeds))

	// Category with no feeds: the response still exposes an empty array,
	// never null. Asserts on the JSON output, not just the Go slice.
	require.NotNil(t, byName["Vuota"].Feeds)
	assert.Empty(t, byName["Vuota"].Feeds)
	assert.Contains(t, rec.Body.String(), `"name":"Vuota","feeds":[]`)
}

func TestRouter_FeedsListByCategory_FeedPayload(t *testing.T) {
	t.Parallel()
	rec := doRequest(t, newTestRouter(t), http.MethodGet, "/api/v1/feeds", "")
	require.Equal(t, http.StatusOK, rec.Code)

	var got []feed.CategoryWithFeeds
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))

	// Pick a specific feed and assert the key columns of the mapping.
	var hn feed.Feed
	for _, c := range got {
		for _, f := range c.Feeds {
			if f.ID == 1 {
				hn = f
			}
		}
	}
	require.Equal(t, int64(1), hn.ID, "feed 1 not found")
	assert.Equal(t, "HN", hn.Name)
	assert.Equal(t, int64(1), hn.CategoryID)
	assert.Equal(t, "https://example.test/hn", hn.URL)
	assert.True(t, hn.Enabled)
	assert.Equal(t, 600, hn.FetchInterval)
	assert.Empty(t, hn.ETag, "NULL etag → empty string via COALESCE")
	assert.Empty(t, hn.LastModified)
	assert.Nil(t, hn.LastFetchedAt, "never fetched in fixture")
}

// --- helpers ------------------------------------------------------------

func doRequest(t *testing.T, r *gin.Engine, method, target, body string) *httptest.ResponseRecorder {
	t.Helper()
	var req *http.Request
	if body != "" {
		req = httptest.NewRequest(method, target, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req = httptest.NewRequest(method, target, nil)
	}
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func idsFrom(t *testing.T, body []byte) []int64 {
	t.Helper()
	var items []news.News
	require.NoError(t, json.Unmarshal(body, &items))
	out := make([]int64, 0, len(items))
	for _, n := range items {
		out = append(out, n.ID)
	}
	return out
}

func itemByID(t *testing.T, items []map[string]any, id int64) map[string]any {
	t.Helper()
	for _, it := range items {
		if n, ok := it["id"].(float64); ok && int64(n) == id {
			return it
		}
	}
	t.Fatalf("item with id=%d not found in %v", id, items)
	return nil
}

func feedNames(fs []feed.Feed) []string {
	out := make([]string, 0, len(fs))
	for _, f := range fs {
		out = append(out, f.Name)
	}
	return out
}
