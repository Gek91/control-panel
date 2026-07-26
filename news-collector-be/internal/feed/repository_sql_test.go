package feed_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"news-collector-be/internal/feed"
	"news-collector-be/internal/testutil"
)

func TestSQLRepository_List(t *testing.T) {
	t.Parallel()
	repo := feed.NewSQLRepository(testutil.NewStore(t))

	got, err := repo.List(context.Background())
	require.NoError(t, err)

	names := make([]string, 0, len(got))
	for _, f := range got {
		names = append(names, f.Name)
	}
	// Ordered by name ASC.
	assert.Equal(t, []string{"Economy", "HN", "Sport1", "TechCr"}, names)
}

func TestSQLRepository_ListCategories(t *testing.T) {
	t.Parallel()
	repo := feed.NewSQLRepository(testutil.NewStore(t))

	got, err := repo.ListCategories(context.Background())
	require.NoError(t, err)

	assert.Equal(t, []feed.FeedCategory{
		{ID: 2, Name: "Economia"},
		{ID: 3, Name: "Sport"},
		{ID: 1, Name: "Tecnologia"},
		{ID: 4, Name: "Vuota"},
	}, got)
}

func TestSQLRepository_ListByCategory(t *testing.T) {
	t.Parallel()
	repo := feed.NewSQLRepository(testutil.NewStore(t))

	got, err := repo.ListByCategory(context.Background())
	require.NoError(t, err)
	require.Len(t, got, 4)

	assert.Equal(t, "Economia", got[0].Name)
	assert.Equal(t, []string{"Economy"}, feedNames(got[0].Feeds))

	assert.Equal(t, "Sport", got[1].Name)
	assert.Equal(t, []string{"Sport1"}, feedNames(got[1].Feeds))

	assert.Equal(t, "Tecnologia", got[2].Name)
	assert.Equal(t, []string{"HN", "TechCr"}, feedNames(got[2].Feeds))

	// Category with no feeds: non-nil empty slice (repository contract).
	assert.Equal(t, "Vuota", got[3].Name)
	require.NotNil(t, got[3].Feeds)
	assert.Empty(t, got[3].Feeds)
}

func feedNames(fs []feed.Feed) []string {
	out := make([]string, 0, len(fs))
	for _, f := range fs {
		out = append(out, f.Name)
	}
	return out
}
