package news

import "context"

type Repository interface {
	List(ctx context.Context, filter ListFilter) ([]News, error)
	MarkRead(ctx context.Context, id int64, read bool) error
}
