package feed

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"news-collector-be/internal/core"
	"news-collector-be/internal/db"
)

type SQLRepository struct {
	store db.Store
}

func NewSQLRepository(store db.Store) *SQLRepository {
	return &SQLRepository{store: store}
}

func (r *SQLRepository) db() *sql.DB {
	return r.store.DB()
}

const baseSelect = `
	SELECT
		id,
		name,
		category_id,
		url,
		enabled,
		fetch_interval,
		COALESCE(etag, '')          AS etag,
		COALESCE(last_modified, '') AS last_modified,
		last_fetched_at,
		created_at
	FROM feed
`

func (r *SQLRepository) List(ctx context.Context) ([]Feed, error) {
	return r.queryFeeds(ctx, baseSelect+" ORDER BY name")
}

// ListByCategory returns all categories with their feeds nested inside.
// Categories with no feeds are still returned (with an empty Feeds slice).
func (r *SQLRepository) ListByCategory(ctx context.Context) ([]CategoryWithFeeds, error) {
	categories, err := r.ListCategories(ctx)
	if err != nil {
		return nil, err
	}

	feeds, err := r.List(ctx)
	if err != nil {
		return nil, err
	}

	byCategory := make(map[int64][]Feed, len(categories))
	for _, f := range feeds {
		byCategory[f.CategoryID] = append(byCategory[f.CategoryID], f)
	}

	out := make([]CategoryWithFeeds, 0, len(categories))
	for _, c := range categories {
		out = append(out, CategoryWithFeeds{
			ID:    c.ID,
			Name:  c.Name,
			Feeds: ensureSlice(byCategory[c.ID]),
		})
	}
	return out, nil
}

func (r *SQLRepository) ListCategories(ctx context.Context) ([]FeedCategory, error) {
	const query = `SELECT id, name FROM feed_category ORDER BY name`

	rows, err := r.db().QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list feed categories: %w", err)
	}
	defer rows.Close()

	out := make([]FeedCategory, 0)
	for rows.Next() {
		var c FeedCategory
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, fmt.Errorf("scan feed category: %w", err)
		}
		out = append(out, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate feed categories: %w", err)
	}
	return out, nil
}

func ensureSlice(s []Feed) []Feed {
	if s == nil {
		return []Feed{}
	}
	return s
}

func (r *SQLRepository) queryFeeds(ctx context.Context, query string, args ...any) ([]Feed, error) {
	rows, err := r.db().QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list feeds: %w", err)
	}
	defer rows.Close()

	out := make([]Feed, 0)
	for rows.Next() {
		f, err := scanRow(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate feeds: %w", err)
	}
	return out, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanRow(s scanner) (Feed, error) {
	var (
		f             Feed
		lastFetchedAt sql.NullTime
	)

	err := s.Scan(
		&f.ID,
		&f.Name,
		&f.CategoryID,
		&f.URL,
		&f.Enabled,
		&f.FetchInterval,
		&f.ETag,
		&f.LastModified,
		&lastFetchedAt,
		&f.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Feed{}, core.ErrNotFound
	}
	if err != nil {
		return Feed{}, fmt.Errorf("scan feed: %w", err)
	}

	if lastFetchedAt.Valid {
		t := lastFetchedAt.Time
		f.LastFetchedAt = &t
	}
	return f, nil
}
