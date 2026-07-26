package news

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

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
		n.id,
		n.feed_id,
		COALESCE(n.guid, '')    AS guid,
		n.link,
		n.title,
		COALESCE(n.summary, '') AS summary,
		n.published_at,
		n.fetched_at,
		n."read"
	FROM news n
`

func (r *SQLRepository) List(ctx context.Context, filter ListFilter) ([]News, error) {
	var (
		conditions []string
		args       []any
	)

	// FeedIDs e CategoryIDs sono in OR fra di loro (vedi ListFilter).
	// Se uno solo dei due è popolato, l'OR collassa nella sola IN clause.
	if len(filter.FeedIDs) > 0 || len(filter.CategoryIDs) > 0 {
		var orParts []string
		if len(filter.FeedIDs) > 0 {
			orParts = append(orParts, "n.feed_id IN ("+placeholders(len(filter.FeedIDs))+")")
			for _, id := range filter.FeedIDs {
				args = append(args, id)
			}
		}
		if len(filter.CategoryIDs) > 0 {
			orParts = append(orParts, "f.category_id IN ("+placeholders(len(filter.CategoryIDs))+")")
			for _, id := range filter.CategoryIDs {
				args = append(args, id)
			}
		}
		conditions = append(conditions, "("+strings.Join(orParts, " OR ")+")")
	}

	if filter.Read != nil {
		conditions = append(conditions, `n."read" = ?`)
		args = append(args, boolToInt(*filter.Read))
	}

	query := baseSelect
	// JOIN su feed solo se serve filtrare per categoria: evita di pagare
	// il join nei casi più comuni (nessun filtro o solo feedIds).
	if len(filter.CategoryIDs) > 0 {
		query += " JOIN feed f ON f.id = n.feed_id"
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY COALESCE(n.published_at, n.fetched_at) DESC"

	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
	}

	rows, err := r.db().QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list news: %w", err)
	}
	defer rows.Close()

	out := make([]News, 0)
	for rows.Next() {
		n, err := scanNews(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate news: %w", err)
	}
	return out, nil
}

// placeholders restituisce "?, ?, ?" per costruire IN clauses dinamiche.
// Pre-condizione: n > 0.
func placeholders(n int) string {
	if n <= 0 {
		return ""
	}
	return strings.Repeat("?,", n-1) + "?"
}

func (r *SQLRepository) MarkRead(ctx context.Context, id int64, read bool) error {
	const query = `UPDATE news SET "read" = ? WHERE id = ?`

	res, err := r.db().ExecContext(ctx, query, boolToInt(read), id)
	if err != nil {
		return fmt.Errorf("mark read: %w", err)
	}

	n, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	if n == 0 {
		return core.ErrNotFound
	}
	return nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanNews(s scanner) (News, error) {
	var (
		n           News
		publishedAt sql.NullTime
	)
	err := s.Scan(
		&n.ID,
		&n.FeedID,
		&n.GUID,
		&n.Link,
		&n.Title,
		&n.Summary,
		&publishedAt,
		&n.FetchedAt,
		&n.Read,
	)
	if err != nil {
		return News{}, err
	}
	if publishedAt.Valid {
		t := publishedAt.Time
		n.PublishedAt = &t
	}
	return n, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
