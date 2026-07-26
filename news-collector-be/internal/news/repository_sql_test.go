package news_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"news-collector-be/internal/core"
	"news-collector-be/internal/news"
	"news-collector-be/internal/testutil"
)

// Direct tests on SQLRepository: they validate the SQL queries against a
// real SQLite DB seeded with resources/test_data.sql.

func boolPtr(b bool) *bool { return &b }

func TestSQLRepository_List(t *testing.T) {
	cases := []struct {
		name    string
		filter  news.ListFilter
		wantIDs []int64
	}{
		{"empty filter", news.ListFilter{}, []int64{3, 5, 1, 4, 2}},
		{"feedIds single", news.ListFilter{FeedIDs: []int64{1}}, []int64{1, 2}},
		{"feedIds multi", news.ListFilter{FeedIDs: []int64{1, 3}}, []int64{5, 1, 2}},
		{"categoryIds single", news.ListFilter{CategoryIDs: []int64{1}}, []int64{3, 1, 4, 2}},
		{"feedIds OR categoryIds", news.ListFilter{FeedIDs: []int64{3}, CategoryIDs: []int64{1}}, []int64{3, 5, 1, 4, 2}},
		{"read=true", news.ListFilter{Read: boolPtr(true)}, []int64{2}},
		{"read=false", news.ListFilter{Read: boolPtr(false)}, []int64{3, 5, 1, 4}},
		{"feed + read combo", news.ListFilter{FeedIDs: []int64{1}, Read: boolPtr(false)}, []int64{1}},
		{"limit", news.ListFilter{Limit: 2}, []int64{3, 5}},
		{"unknown feed yields empty", news.ListFilter{FeedIDs: []int64{99}}, []int64{}},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			repo := news.NewSQLRepository(testutil.NewStore(t))

			got, err := repo.List(context.Background(), tc.filter)
			require.NoError(t, err)

			ids := make([]int64, 0, len(got))
			for _, n := range got {
				ids = append(ids, n.ID)
			}
			assert.Equal(t, tc.wantIDs, ids)
		})
	}
}

func TestSQLRepository_List_ScansNullableFields(t *testing.T) {
	repo := news.NewSQLRepository(testutil.NewStore(t))

	got, err := repo.List(context.Background(), news.ListFilter{FeedIDs: []int64{2}})
	require.NoError(t, err)
	require.Len(t, got, 2)

	byID := map[int64]news.News{}
	for _, n := range got {
		byID[n.ID] = n
	}

	// news 3: published_at set, guid/summary NULL → coalesced to "".
	three := byID[3]
	require.NotNil(t, three.PublishedAt)
	assert.Empty(t, three.GUID)
	assert.Empty(t, three.Summary)

	// news 4: published_at NULL → PublishedAt == nil, fetched_at set.
	four := byID[4]
	assert.Nil(t, four.PublishedAt)
	assert.False(t, four.FetchedAt.IsZero())
}

func TestSQLRepository_MarkRead(t *testing.T) {
	ctx := context.Background()
	repo := news.NewSQLRepository(testutil.NewStore(t))

	require.NoError(t, repo.MarkRead(ctx, 1, true))

	got, err := repo.List(ctx, news.ListFilter{Read: boolPtr(true)})
	require.NoError(t, err)
	ids := make([]int64, 0, len(got))
	for _, n := range got {
		ids = append(ids, n.ID)
	}
	assert.ElementsMatch(t, []int64{1, 2}, ids)

	require.NoError(t, repo.MarkRead(ctx, 1, false))
	got, err = repo.List(ctx, news.ListFilter{Read: boolPtr(true)})
	require.NoError(t, err)
	require.Len(t, got, 1)
	assert.EqualValues(t, 2, got[0].ID)
}

func TestSQLRepository_MarkRead_NotFound(t *testing.T) {
	repo := news.NewSQLRepository(testutil.NewStore(t))

	err := repo.MarkRead(context.Background(), 999, true)
	assert.ErrorIs(t, err, core.ErrNotFound)
	assert.True(t, errors.Is(err, core.ErrNotFound))
}
