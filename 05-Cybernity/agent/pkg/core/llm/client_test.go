package llm

import (
	"context"
	"testing"
	"time"
)

func TestChatCompletion(t *testing.T) {
	config := DefaultConfig().
		WithAPIKey("test-key").
		WithBaseURL("https://api.openai.com/v1").
		WithTimeout(60 * time.Second).
		WithMaxRetries(3).
		WithMaxConcurrentCalls(10)

	client := NewClient(config)
	ctx := context.Background()

	tests := []struct {
		name    string
		request ChatCompletionRequest
		wantErr bool
	}{
		{
			name: "basic chat completion",
			request: ChatCompletionRequest{
				Messages: []Message{
					{
						Role:    "system",
						Content: "You are a helpful assistant.",
					},
					{
						Role:    "user",
						Content: "Say 'Hello, World!' in Chinese",
					},
				},
				Temperature: 0.7,
			},
			wantErr: false,
		},
		{
			name: "chat completion with specific model",
			request: ChatCompletionRequest{
				Model: "gpt-3.5-turbo",
				Messages: []Message{
					{
						Role:    "user",
						Content: "What is 1+1?",
					},
				},
				Temperature: 0,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := client.ChatCompletion(ctx, tt.request)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChatCompletion() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && resp == nil {
				t.Error("ChatCompletion() returned nil response")
			}
			if !tt.wantErr && len(resp.Choices) == 0 {
				t.Error("ChatCompletion() returned no choices")
			}
			t.Logf("Response: %s", resp.Choices[0].Message.Content)
		})
	}
}

func TestChatCompletionStream(t *testing.T) {
	config := DefaultConfig().
		WithAPIKey("test-key").
		WithBaseURL("https://api.openai.com/v1")

	client := NewClient(config)
	ctx := context.Background()

	request := ChatCompletionRequest{
		Messages: []Message{
			{
				Role:    "user",
				Content: "Count from 1 to 5 slowly",
			},
		},
		Temperature: 0.7,
		Stream:      true,
	}

	streamChan, err := client.ChatCompletionStream(ctx, request)
	if err != nil {
		t.Fatalf("ChatCompletionStream() error = %v", err)
	}

	var fullResponse string
	for response := range streamChan {
		for _, choice := range response.Choices {
			fullResponse += choice.Delta.Content
			t.Logf("Received chunk: %s", choice.Delta.Content)
		}
	}

	if fullResponse == "" {
		t.Error("ChatCompletionStream() returned empty response")
	}
}

func TestConcurrentChatCompletions(t *testing.T) {
	config := DefaultConfig().
		WithAPIKey("test-key").
		WithBaseURL("https://api.openai.com/v1").
		WithMaxConcurrentCalls(3)

	client := NewClient(config)
	ctx := context.Background()

	// Create multiple requests
	requests := []ChatCompletionRequest{
		{
			Messages: []Message{
				{Role: "user", Content: "Say 'Hello' in English"},
			},
		},
		{
			Messages: []Message{
				{Role: "user", Content: "Say 'Hello' in Chinese"},
			},
		},
		{
			Messages: []Message{
				{Role: "user", Content: "Say 'Hello' in Japanese"},
			},
		},
	}

	// Process requests concurrently
	results := make(chan struct {
		content string
		err     error
	}, len(requests))

	for _, req := range requests {
		go func(req ChatCompletionRequest) {
			resp, err := client.ChatCompletion(ctx, req)
			if err != nil {
				results <- struct {
					content string
					err     error
				}{"", err}
				return
			}
			results <- struct {
				content string
				err     error
			}{resp.Choices[0].Message.Content, nil}
		}(req)
	}

	// Collect and verify results
	successCount := 0
	for i := 0; i < len(requests); i++ {
		result := <-results
		if result.err != nil {
			t.Logf("Request %d failed: %v", i, result.err)
		} else {
			t.Logf("Request %d succeeded: %s", i, result.content)
			successCount++
		}
	}

	if successCount == 0 {
		t.Error("All concurrent requests failed")
	}
}

func TestConfigValidation(t *testing.T) {
	tests := []struct {
		name      string
		configure func() *Config
		wantErr   bool
	}{
		{
			name: "valid config",
			configure: func() *Config {
				return DefaultConfig().
					WithAPIKey("test-key").
					WithBaseURL("https://api.openai.com/v1")
			},
			wantErr: false,
		},
		{
			name: "missing API key",
			configure: func() *Config {
				return DefaultConfig().
					WithBaseURL("https://api.openai.com/v1")
			},
			wantErr: true,
		},
		{
			name: "invalid timeout",
			configure: func() *Config {
				return DefaultConfig().
					WithAPIKey("test-key").
					WithTimeout(-1 * time.Second)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config := tt.configure()
			client := NewClient(config)

			// Try a simple request to test configuration
			_, err := client.ChatCompletion(context.Background(), ChatCompletionRequest{
				Messages: []Message{
					{Role: "user", Content: "Test"},
				},
			})

			if (err != nil) != tt.wantErr {
				t.Errorf("Configuration test failed: error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
