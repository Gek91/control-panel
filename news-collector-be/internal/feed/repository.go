package feed

import "context"

type Repository interface {
	List(ctx context.Context) ([]Feed, error)
	ListByCategory(ctx context.Context) ([]CategoryWithFeeds, error)
	ListCategories(ctx context.Context) ([]FeedCategory, error)
}
