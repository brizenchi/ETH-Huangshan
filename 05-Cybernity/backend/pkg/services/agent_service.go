package services

import (
	"context"
	"cybernity/pkg/models"
	"sync"
)

type agentService struct{}

var (
	AgentService     *agentService
	agentServiceOnce sync.Once
)

func NewAgentService() *agentService {
	agentServiceOnce.Do(func() {
		AgentService = &agentService{}
	})
	return AgentService
}

type CreateAgentSvcRequest struct {
	Name           string `json:"name"`
	Description    string `json:"description"`
	CID            string `json:"cid"`
	CreatorAddress string `json:"creator_address"`
	AgentAddress   string `json:"agent_address"`
}

type CreateWalletSvcRequest struct {
	CID             string `json:"cid"`
	CreatorAddress  string `json:"creator_address"`
	AgentPrivateKey string `json:"agent_private_key"`
	AgentAddress    string `json:"agent_address"`
}

func (s *agentService) CreateWallet(ctx context.Context, req *CreateWalletSvcRequest) error {
	wallet := &models.Wallet{
		CID:             req.CID,
		CreatorAddress:  req.CreatorAddress,
		AgentPrivateKey: req.AgentPrivateKey,
		AgentAddress:    req.AgentAddress,
	}

	return wallet.Create(ctx)
}

func (s *agentService) CreateAgent(ctx context.Context, req *CreateAgentSvcRequest) error {
	agent := &models.Agents{
		Name:           req.Name,
		Description:    req.Description,
		CID:            req.CID,
		CreatorAddress: req.CreatorAddress,
		AgentAddress:   req.AgentAddress,
	}
	return agent.Create(ctx)
}
func (s *agentService) ListAgent(ctx context.Context) ([]*models.Agents, error) {
	return (&models.Agents{}).List(ctx)
}
func (s *agentService) GetAgent(ctx context.Context, cid string) (*models.Agents, error) {
	return (&models.Agents{}).Get(ctx, cid)
}

func (s *agentService) UpdateOnChain(ctx context.Context, cid string) error {
	return (&models.Agents{}).OnChain(ctx, cid)
}
