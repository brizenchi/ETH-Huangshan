package agent

import (
	"crypto/ecdsa"
	"cybernity/pkg/core/result"
	"cybernity/pkg/models"
	"cybernity/pkg/services"
	"encoding/hex"
	"io"

	"github.com/ethereum/go-ethereum/crypto"

	"github.com/gin-gonic/gin"
)

func Generate(c *gin.Context) {
	name := c.PostForm("name")
	description := c.PostForm("description")
	address := c.PostForm("creator_address")

	if name == "" || address == "" {
		result.UError(c, "name and address are required")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		result.UError(c, "file upload failed: "+err.Error())
		return
	}

	openedFile, err := file.Open()
	if err != nil {
		result.UError(c, "failed to open file: "+err.Error())
		return
	}
	defer openedFile.Close()

	fileContent, err := io.ReadAll(openedFile)
	if err != nil {
		result.UError(c, "failed to read file: "+err.Error())
		return
	}

	// Generate key pair
	encryptSvc := services.NewEncryptService()
	privateKey, err := encryptSvc.GenerateKeyPair(2048)
	if err != nil {
		result.UError(c, "failed to generate key pair: "+err.Error())
		return
	}
	publicKey := &privateKey.PublicKey

	// Encrypt file content
	encryptedFileContent, err := encryptSvc.EncryptHybrid(fileContent, publicKey)
	if err != nil {
		result.UError(c, "failed to encrypt file: "+err.Error())
		return
	}

	// Upload encrypted content to IPFS
	ipfsService := services.NewIpfsService()
	cid, err := ipfsService.UploadFileRaw(c.Request.Context(), encryptedFileContent, file.Filename)
	if err != nil {
		result.UError(c, "failed to upload to IPFS: "+err.Error())
		return
	}

	// Generate Ethereum wallet for the agent
	ethPrivateKey, err := crypto.GenerateKey()
	if err != nil {
		result.UError(c, "failed to generate ethereum key: "+err.Error())
		return
	}

	publicKeyECDSA, ok := ethPrivateKey.Public().(*ecdsa.PublicKey)
	if !ok {
		result.UError(c, "error casting public key to ECDSA")
		return
	}
	agentAddress := crypto.PubkeyToAddress(*publicKeyECDSA).Hex()

	// Save wallet with keys
	privateKeyBytes := encryptSvc.PrivateKeyToBytes(privateKey)
	ethPrivateKeyBytes := crypto.FromECDSA(ethPrivateKey)

	agentKeys := &models.AgentKeys{
		EncryptionPrivateKey: string(privateKeyBytes),
		BlockchainPrivateKey: hex.EncodeToString(ethPrivateKeyBytes),
	}

	agentKeysJSON, err := agentKeys.ToJSON()
	if err != nil {
		result.UError(c, "failed to serialize agent keys: "+err.Error())
		return
	}

	err = services.AgentService.CreateWallet(c.Request.Context(), &services.CreateWalletSvcRequest{
		CID:             cid,
		CreatorAddress:  address,
		AgentPrivateKey: agentKeysJSON,
		AgentAddress:    agentAddress,
	})
	if err != nil {
		result.UError(c, "failed to create wallet: "+err.Error())
		return
	}

	// Save agent
	err = services.AgentService.CreateAgent(c.Request.Context(), &services.CreateAgentSvcRequest{
		Name:           name,
		Description:    description,
		CID:            cid,
		CreatorAddress: address,
		AgentAddress:   agentAddress,
	})
	if err != nil {
		result.UError(c, "failed to create agent: "+err.Error())
		return
	}
	result.Success(c, GenerateResponse{
		AgentAddress: agentAddress,
		CID:          cid,
		Name:         name,
		Description:  description,
	})
}

type GenerateResponse struct {
	AgentAddress string `json:"agent_address"`
	CID          string `json:"cid"`
	Name         string `json:"name"`
	Description  string `json:"description"`
}

type AgentResponse struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	CID            string `json:"cid"`
	CreatorAddress string `json:"creator_address"`
}

func List(c *gin.Context) {
	agents, err := services.AgentService.ListAgent(c.Request.Context())
	if err != nil {
		result.UError(c, err.Error())
		return
	}
	agentResponses := make([]*AgentResponse, len(agents))
	for i, agent := range agents {
		agentResponses[i] = &AgentResponse{
			ID:             agent.ID,
			Name:           agent.Name,
			Description:    agent.Description,
			CID:            agent.CID,
			CreatorAddress: agent.CreatorAddress,
		}
	}
	result.Success(c, agentResponses)
}
