package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Client interface defines the methods that an LLM client must implement
type Client interface {
	GetConfig() *Config
	ChatCompletion(ctx context.Context, request ChatCompletionRequest) (*ChatCompletionResponse, error)
	ChatCompletionStream(ctx context.Context, request ChatCompletionRequest) (<-chan StreamResponse, error)
}

// client implements the Client interface
type client struct {
	config     *Config
	httpClient *http.Client
	semaphore  chan struct{}
}

// NewClient creates a new LLM client with the given configuration
func NewClient(config *Config) Client {
	if config == nil {
		config = DefaultConfig()
	}

	return &client{
		config: config,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		semaphore: make(chan struct{}, config.MaxConcurrentCalls),
	}
}

func (c *client) GetConfig() *Config {
	return c.config
}

// ChatCompletion sends a chat completion request to LLM
func (c *client) ChatCompletion(ctx context.Context, request ChatCompletionRequest) (*ChatCompletionResponse, error) {
	// Acquire semaphore
	select {
	case c.semaphore <- struct{}{}:
		defer func() { <-c.semaphore }()
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	if request.Model == "" {
		request.Model = c.config.Model
	}

	jsonBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST",
		c.config.BaseURL+"/chat/completions",
		bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	var resp *ChatCompletionResponse
	err = c.doRequest(req, &resp)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

// ChatCompletionStream sends a streaming chat completion request to LLM
func (c *client) ChatCompletionStream(ctx context.Context, request ChatCompletionRequest) (<-chan StreamResponse, error) {
	// Acquire semaphore
	select {
	case c.semaphore <- struct{}{}:
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	request.Stream = true
	if request.Model == "" {
		request.Model = c.config.Model
	}

	jsonBody, err := json.Marshal(request)
	if err != nil {
		<-c.semaphore
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST",
		c.config.BaseURL+"/chat/completions",
		bytes.NewBuffer(jsonBody))
	if err != nil {
		<-c.semaphore
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		<-c.semaphore
		return nil, fmt.Errorf("failed to send request: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		<-c.semaphore
		resp.Body.Close()
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	streamChan := make(chan StreamResponse)
	go func() {
		defer func() {
			resp.Body.Close()
			<-c.semaphore
			close(streamChan)
		}()

		reader := bufio.NewReader(resp.Body)
		for {
			line, err := reader.ReadBytes('\n')
			if err != nil {
				if err != io.EOF {
					// Log error if needed
				}
				return
			}

			line = bytes.TrimSpace(line)
			if len(line) == 0 {
				continue
			}

			if !bytes.HasPrefix(line, []byte("data: ")) {
				continue
			}

			line = bytes.TrimPrefix(line, []byte("data: "))
			if bytes.Equal(line, []byte("[DONE]")) {
				return
			}

			var response StreamResponse
			if err := json.Unmarshal(line, &response); err != nil {
				// Log error if needed
				continue
			}

			select {
			case streamChan <- response:
			case <-ctx.Done():
				return
			}
		}
	}()

	return streamChan, nil
}

// setHeaders sets the required headers for LLM API requests
func (c *client) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	if c.config.OrgID != "" {
		req.Header.Set("LLM-Organization", c.config.OrgID)
	}
}

// doRequest performs the HTTP request with retries
func (c *client) doRequest(req *http.Request, v interface{}) error {
	var lastErr error
	// 保存原始请求体
	var originalBody []byte
	if req.Body != nil {
		originalBody, _ = io.ReadAll(req.Body)
		req.Body.Close()
	}

	for i := 0; i <= c.config.MaxRetries; i++ {
		// 为每次重试创建新的请求体
		if originalBody != nil {
			req.Body = io.NopCloser(bytes.NewBuffer(originalBody))
			req.ContentLength = int64(len(originalBody))
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("failed to send request: %w", err)
			continue
		}

		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			lastErr = fmt.Errorf("failed to read response body: %w", err)
			continue
		}

		if resp.StatusCode != http.StatusOK {
			var llmErr Error
			if err := json.Unmarshal(body, &llmErr); err != nil {
				lastErr = fmt.Errorf("unexpected status code: %d", resp.StatusCode)
			} else {
				lastErr = fmt.Errorf("LLM API error: %s", llmErr.Error.Message)
			}
			continue
		}

		if err := json.Unmarshal(body, v); err != nil {
			lastErr = fmt.Errorf("failed to unmarshal response: %w", err)
			continue
		}

		return nil
	}

	return lastErr
}
