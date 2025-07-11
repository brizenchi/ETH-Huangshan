package services

import (
	"context"
	"crypto/rsa"
	"cybernity/pkg/models"
	"sync"
)

type walletService struct{}

var (
	WalletService     *walletService
	walletServiceOnce sync.Once
)

func NewWalletService() *walletService {
	walletServiceOnce.Do(func() {
		WalletService = &walletService{}
	})
	return WalletService
}

func (s *walletService) GetPrivateKeyForAgent(ctx context.Context, agentAddress string) (*rsa.PrivateKey, error) {
	wallet, err := (&models.Wallet{}).GetWalletByAgentAddress(ctx, agentAddress)
	if err != nil {
		return nil, err
	}

	keys, err := models.AgentKeysFromJSON(wallet.AgentPrivateKey)
	if err != nil {
		return nil, err
	}

	encryptSvc := NewEncryptService()
	privateKey, err := encryptSvc.BytesToPrivateKey([]byte(keys.EncryptionPrivateKey))
	if err != nil {
		return nil, err
	}

	return privateKey, nil
}

func (s *walletService) GetBlockchainPrivateKeyForAgent(ctx context.Context, agentAddress string) (string, error) {
	wallet, err := (&models.Wallet{}).GetWalletByAgentAddress(ctx, agentAddress)
	if err != nil {
		return "", err
	}

	keys, err := models.AgentKeysFromJSON(wallet.AgentPrivateKey)
	if err != nil {
		return "", err
	}

	return keys.BlockchainPrivateKey, nil
}
