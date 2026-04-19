package feed

import "time"

type Feed struct {
	ID            int64      `json:"id"`
	Name          string     `json:"name"`
	CategoryID    int64      `json:"categoryId"`
	URL           string     `json:"url"`
	Enabled       bool       `json:"enabled"`
	FetchInterval int        `json:"fetchInterval"`
	ETag          string     `json:"etag,omitempty"`
	LastModified  string     `json:"lastModified,omitempty"`
	LastFetchedAt *time.Time `json:"lastFetchedAt,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
}

type FeedCategory struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// CategoryWithFeeds groups all feeds belonging to a single category.
// It is the response payload for GET /api/v1/feeds.
type CategoryWithFeeds struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Feeds []Feed `json:"feeds"`
}
