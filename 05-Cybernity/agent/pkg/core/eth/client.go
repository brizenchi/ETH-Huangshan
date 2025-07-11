package eth

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Service struct {
	cfg *Config
}

func New(cfg *Config) *Service {
	return &Service{cfg: cfg}
}

func (s *Service) SubmitAnswer(ctx context.Context, agentPrivateKey string, questionId *big.Int, answerCID string) (common.Hash, error) {
	client, err := ethclient.Dial(s.cfg.WsURL)
	if err != nil {
		return common.Hash{}, err
	}

	privateKey, err := crypto.HexToECDSA(agentPrivateKey)
	if err != nil {
		return common.Hash{}, err
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return common.Hash{}, err
	}

	gasPrice, err := client.SuggestGasPrice(ctx)
	if err != nil {
		return common.Hash{}, err
	}

	contractAddress := common.HexToAddress(s.cfg.ContractAddress)
	parsedABI, err := abi.JSON(strings.NewReader(PublicKnowledgeAgentABI))
	if err != nil {
		return common.Hash{}, err
	}

	data, err := parsedABI.Pack("submitAnswer", questionId, answerCID)
	if err != nil {
		return common.Hash{}, err
	}

	tx := types.NewTransaction(nonce, contractAddress, big.NewInt(0), 300000, gasPrice, data)

	chainID, err := client.NetworkID(ctx)
	if err != nil {
		return common.Hash{}, err
	}

	signedTx, err := types.SignTx(tx, types.NewLondonSigner(chainID), privateKey)
	if err != nil {
		return common.Hash{}, err
	}

	err = client.SendTransaction(ctx, signedTx)
	if err != nil {
		return common.Hash{}, err
	}

	return signedTx.Hash(), nil
}
