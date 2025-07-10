package services

import (
	"context"
	"cybernity/pkg/models"
	"sync"
)

type questionService struct{}

var (
	QuestionService     *questionService
	questionServiceOnce sync.Once
)

func NewQuestionService() *questionService {
	questionServiceOnce.Do(func() {
		QuestionService = &questionService{}
	})
	return QuestionService
}
func (s *questionService) GetQuestionByCid(ctx context.Context, cid string) ([]*models.Questions, error) {
	return (&models.Questions{}).GetByCid(ctx, cid)
}
