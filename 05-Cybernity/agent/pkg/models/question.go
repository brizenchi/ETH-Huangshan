package models

import (
	"context"
	"cybernity/pkg/core/pg"

	"gorm.io/gorm"
)

type Questions struct {
	QuestionId      int    `json:"question_id"`
	CreatorAddress  string `json:"creator_address"`
	CID             string `json:"cid" gorm:"column:cid"`
	AskAddress      string `json:"ask_address"`
	AnswerCID       string `json:"answer_cid" gorm:"column:answer_cid"`
	AgentAddress    string `json:"agent_address"`
	TransactionHash string `json:"transaction_hash"`
	Question        string `json:"question" gorm:"type:text"`
	Answer          string `json:"answer" gorm:"type:text"`
	gorm.Model
}

func (Questions) TableName() string {
	return "questions"
}

func (q *Questions) Create(ctx context.Context) (err error) {
	err = pg.GetManager().GetClient("cybernity").GetDB(ctx).Create(q).Error
	return
}

func (q *Questions) List(ctx context.Context) ([]*Questions, error) {
	var questions []*Questions
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Find(&questions).Error
	return questions, err
}

func (q *Questions) GetByQuestionID(ctx context.Context, questionId int) (*Questions, error) {
	var question Questions
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("question_id = ?", questionId).First(&question).Error
	return &question, err
}

func (q *Questions) GetByCid(ctx context.Context, cid string) ([]*Questions, error) {
	var questions []*Questions
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("cid = ?", cid).Order("created_at desc").Find(&questions).Error
	return questions, err
}
