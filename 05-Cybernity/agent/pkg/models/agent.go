package models

import (
	"context"
	"cybernity/pkg/core/pg"

	"gorm.io/gorm"
)

type Agents struct {
	Name           string `json:"name"`
	Description    string `json:"description"`
	CID            string `json:"cid" gorm:"column:cid"`
	CreatorAddress string `json:"creator_address"`
	AgentAddress   string `json:"agent_address"`
	gorm.Model
}

func (Agents) TableName() string {
	return "agents"
}

const (
	OnChain  = 1
	OffChain = 0
)

func (a *Agents) Create(ctx context.Context) (err error) {
	// Check if CID already exists
	var count int64
	if err = pg.GetManager().GetClient("cybernity").GetDB(ctx).Model(&Agents{}).Where("cid = ?", a.CID).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return gorm.ErrDuplicatedKey
	}

	err = pg.GetManager().GetClient("cybernity").GetDB(ctx).Create(a).Error
	return
}
func (a *Agents) List(ctx context.Context) ([]*Agents, error) {
	var agents []*Agents
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("on_chain = ?", OnChain).Order("created_at desc").Find(&agents).Error
	return agents, err
}
func (a *Agents) Get(ctx context.Context, cid string) (*Agents, error) {
	var agent Agents
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("cid = ?", cid).First(&agent).Error
	return &agent, err
}
func (a *Agents) OnChain(ctx context.Context, cid string) error {
	return pg.GetManager().GetClient("cybernity").GetDB(ctx).Model(&Agents{}).Where("cid = ?", cid).Update("on_chain", OnChain).Error
}
