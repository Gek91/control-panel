package api

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"news-collector-be/internal/feed"
	"news-collector-be/internal/news"
)

func NewRouter(newsRepo news.Repository, feedRepo feed.Repository) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/health", Health)

	newsHandler := news.NewHandler(newsRepo)
	feedHandler := feed.NewHandler(feedRepo)

	v1 := r.Group("/api/v1")
	{
		newsGroup := v1.Group("/news")
		{
			newsGroup.GET("", newsHandler.List)
			newsGroup.PATCH("/:id/read", newsHandler.MarkRead)
		}

		feedGroup := v1.Group("/feeds")
		{
			feedGroup.GET("", feedHandler.ListByCategory)
			feedGroup.GET("/categories", feedHandler.ListCategories)
		}
	}

	return r
}
