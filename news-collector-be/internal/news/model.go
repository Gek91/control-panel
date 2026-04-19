package news

import "time"

type News struct {
	ID          int64      `json:"id"`
	FeedID      int64      `json:"feedId"`
	GUID        string     `json:"guid,omitempty"`
	Link        string     `json:"link"`
	Title       string     `json:"title"`
	Summary     string     `json:"summary,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	FetchedAt   time.Time  `json:"fetchedAt"`
	Read        bool       `json:"read"`
}

type ListFilter struct {
	FeedIDs     []int64 // vuoto = nessun vincolo per feed
	CategoryIDs []int64 // vuoto = nessun vincolo per categoria
	Read        *bool   // nil = both read and unread
	Limit       int     // 0 = no limit
}

// MarkReadRequest is the JSON body for PATCH /api/v1/news/:id/read.
type MarkReadRequest struct {
	Read bool `json:"read"`
}
