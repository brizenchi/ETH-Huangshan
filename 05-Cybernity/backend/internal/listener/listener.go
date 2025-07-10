package listener

import (
	"context"
	"cybernity/pkg/core/eth"
	"cybernity/pkg/services"
	"fmt"
	"log"
	"strings"

	"cybernity/pkg/models"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type PublicKnowledgeAgentQuestionAsked struct {
	Cid             string
	QuestionContent string
}

func EventListener(ctx context.Context, ethConfig eth.Config) {
	// 1. Prepare connection info
	wsURL := ethConfig.WsURL
	address := ethConfig.ContractAddress

	contractAddress := common.HexToAddress(address)

	// 2. Connect to Ethereum node
	client, err := ethclient.Dial(wsURL)
	if err != nil {
		log.Fatalf("Failed to connect to Ethereum node: %v", err)
	}
	fmt.Println("Successfully connected to Ethereum node...")

	// 3. Parse contract ABI
	contractABI, err := abi.JSON(strings.NewReader(eth.PublicKnowledgeAgentABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	// 4. Set up event subscription
	// Create a channel to receive logs
	logs := make(chan types.Log)
	// Subscribe to events using FilterLogs
	sub, err := client.SubscribeFilterLogs(context.Background(), ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
	}, logs)
	if err != nil {
		log.Fatalf("Failed to subscribe to events: %v", err)
	}

	fmt.Println("Listening for QuestionAsked events...")

	// 5. Process received events in a loop
	for {
		select {
		case err := <-sub.Err():
			log.Fatalf("Subscription error: %v", err)
		case vLog := <-logs:
			questionAskedSigHash := contractABI.Events["QuestionAsked"].ID
			if vLog.Topics[0] == questionAskedSigHash {

				fmt.Println("----------- Received new QuestionAsked event! -----------")
				fmt.Printf("Transaction hash: %s\n", vLog.TxHash.Hex())

				var questionAskedEvent PublicKnowledgeAgentQuestionAsked
				err := contractABI.UnpackIntoInterface(&questionAskedEvent, "QuestionAsked", vLog.Data)
				if err != nil {
					log.Printf("Failed to parse event data: %v", err)
					continue
				}

				// Event indexed parameters are stored in Topics
				// Topic[0] is the event signature
				// Topic[1] is the first indexed parameter (questionId)
				// Topic[2] is the second indexed parameter (agentId) - ignored
				// Topic[3] is the third indexed parameter (questioner)
				questionId := vLog.Topics[1].Big()
				questioner := common.HexToAddress(vLog.Topics[3].Hex())

				// --- Here is the parsed information you need ---
				fmt.Printf("Question ID: %s\n", questionId.String())
				fmt.Printf("Questioner Address: %s\n", questioner.Hex())
				fmt.Printf("Agent CID: %s\n", questionAskedEvent.Cid)
				fmt.Printf("Question Content: %s\n", questionAskedEvent.QuestionContent)
				fmt.Println("-------------------------------------------------")

				// get file from ipfs
				ipfsService := services.NewIpfsService()

				agent, err := services.AgentService.GetAgent(ctx, questionAskedEvent.Cid)
				if err != nil {
					log.Printf("Failed to get agent: %v", err)
					continue
				}
				knowledge, err := ipfsService.DownloadFile(ctx, agent.CID)
				if err != nil {
					log.Printf("Failed to download file from IPFS: %v", err)
					continue
				}

				encryptSvc := services.NewEncryptService()
				walletService := services.NewWalletService()

				privateKey, err := walletService.GetPrivateKeyForAgent(ctx, agent.AgentAddress)
				if err != nil {
					log.Printf("Failed to get private key: %v", err)
					continue
				}

				decryptedKnowledge, err := encryptSvc.DecryptHybrid([]byte(knowledge), privateKey)
				if err != nil {
					log.Printf("Failed to decrypt knowledge: %v", err)
					continue
				}

				answer, err := services.LLMService.GetAnswer(ctx, agent.Name, agent.Description, questionAskedEvent.QuestionContent, string(decryptedKnowledge))
				if err != nil {
					log.Printf("Failed to get answer from LLM: %v", err)
					continue
				}
				fmt.Printf("Answer: %s\n", answer)
				answerCID, err := ipfsService.UploadFileRaw(ctx, []byte(answer), agent.CID+"_answer.txt")
				if err != nil {
					log.Printf("Failed to upload file to IPFS: %v", err)
					continue
				}
				fmt.Printf("Answer CID: %s\n", answerCID)

				// upload answer to contract
				agentBlockchainKey, err := walletService.GetBlockchainPrivateKeyForAgent(ctx, agent.AgentAddress)
				if err != nil {
					log.Printf("Failed to get agent blockchain private key: %v", err)
					continue
				}

				ethSvc := services.NewEthService(ethConfig)
				txHash, err := ethSvc.SubmitAnswer(ctx, agentBlockchainKey, questionId, answerCID)
				if err != nil {
					log.Printf("Failed to submit answer to contract: %v", err)
					continue
				}

				log.Printf("Successfully submitted answer to contract. Transaction hash: %s", txHash.Hex())

				questionRecord := &models.Questions{
					QuestionId:      int(questionId.Int64()),
					CreatorAddress:  agent.CreatorAddress,
					CID:             agent.CID,
					AskAddress:      questioner.Hex(),
					AnswerCID:       answerCID,
					AgentAddress:    agent.AgentAddress,
					TransactionHash: txHash.Hex(),
					Question:        questionAskedEvent.QuestionContent,
					Answer:          answer,
				}

				if err := questionRecord.Create(ctx); err != nil {
					log.Printf("Failed to save question to database: %v", err)
				} else {
					log.Printf("Successfully saved question %d to database", questionRecord.QuestionId)
				}
			}
		}
	}
}
