package services

import (
	"context"
	"cybernity/pkg/core/llm"
	"cybernity/pkg/core/logger"
	"fmt"
	"sync"
)

type llmService struct{}

var (
	LLMService     *llmService
	llmServiceOnce sync.Once
)

func NewLlmService() *llmService {
	llmServiceOnce.Do(func() {
		LLMService = &llmService{}
	})
	return LLMService
}

func (s *llmService) GetAnswer(ctx context.Context, name, desc, question, knowledge string) (string, error) {
	client, err := llm.GetManager().GetClient("default")
	if err != nil {
		return "", fmt.Errorf("failed to get LLM client: %w", err)
	}

	// 构建系统提示词
	systemPrompt := `你是%s,你的描述是%s,现在你在进行一次知识付费，你的知识库是%s,请根据知识库回答问题。`

	chatRequest := llm.ChatCompletionRequest{
		Messages: []llm.Message{
			{
				Role:    "system",
				Content: fmt.Sprintf(systemPrompt, name, desc, knowledge),
			},
			{
				Role:    "user",
				Content: question,
			},
		},
		Temperature: 0.7,
	}
	logger.Debug(ctx, "GetAnswer", "chatRequest", chatRequest)
	// 发送请求
	response, err := client.ChatCompletion(ctx, chatRequest)
	if err != nil {
		return "", fmt.Errorf("chat completion failed: %w", err)
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	// 处理返回内容，保留原始内容以便调试
	logger.Info(ctx, "GetAnswer", "Content", response.Choices[0].Message.Content)

	return response.Choices[0].Message.Content, nil
}
