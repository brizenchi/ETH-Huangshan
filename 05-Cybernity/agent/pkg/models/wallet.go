package models

import (
	"context"
	"cybernity/pkg/core/pg"

	"gorm.io/gorm"
)

type Wallet struct {
	CreatorAddress  string `json:"creator_address"`
	CID             string `json:"cid" gorm:"column:cid"`
	AgentAddress    string `json:"agent_address"`
	AgentPrivateKey string `json:"agent_private_key"`
	gorm.Model
}

func (Wallet) TableName() string {
	return "wallets"
}

func (w *Wallet) Create(ctx context.Context) (err error) {
	err = pg.GetManager().GetClient("cybernity").GetDB(ctx).Create(w).Error
	return
}

func (w *Wallet) List(ctx context.Context) ([]*Wallet, error) {
	var wallets []*Wallet
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Find(&wallets).Error
	return wallets, err
}

func (w *Wallet) GetWalletByCID(ctx context.Context, cid string) (*Wallet, error) {
	var wallet Wallet
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("cid = ?", cid).First(&wallet).Error
	return &wallet, err
}

func (w *Wallet) GetWalletByAgentAddress(ctx context.Context, agentAddress string) (*Wallet, error) {
	var wallet Wallet
	err := pg.GetManager().GetClient("cybernity").GetDB(ctx).Where("agent_address = ?", agentAddress).First(&wallet).Error
	return &wallet, err
}
