package services

import (
	"context"
	"cybernity/pkg/core/eth"
	"math/big"
	"sync"

	"github.com/ethereum/go-ethereum/common"
)

type ethService struct {
	client *eth.Service
}

var (
	EthService     *ethService
	ethServiceOnce sync.Once
)

func NewEthService(cfg eth.Config) *ethService {
	ethServiceOnce.Do(func() {
		EthService = &ethService{
			client: eth.New(&cfg),
		}
	})
	return EthService
}

func (s *ethService) SubmitAnswer(ctx context.Context, agentPrivateKey string, questionId *big.Int, answerCID string) (common.Hash, error) {
	return s.client.SubmitAnswer(ctx, agentPrivateKey, questionId, answerCID)
}
