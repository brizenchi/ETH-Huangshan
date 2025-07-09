package llm

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatCompletionRequest represents a request for chat completion
type ChatCompletionRequest struct {
	Model       string     `json:"model"`
	Messages    []Message  `json:"messages"`
	MaxTokens   int        `json:"max_tokens,omitempty"`
	Temperature float32    `json:"temperature,omitempty"`
	Stream      bool       `json:"stream,omitempty"`
	Stop        []string   `json:"stop,omitempty"`
	Functions   []Function `json:"functions,omitempty"`
}

type ThinkingType string

const (
	ThinkingEnabled  ThinkingType = "enabled"
	ThinkingDisabled ThinkingType = "disabled"
	ThinkingAuto     ThinkingType = "auto"
)

type Thinking struct {
	Type ThinkingType `json:"type"`
}

// ChatCompletionResponse represents a response from chat completion
type ChatCompletionResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

// Choice represents a completion choice
type Choice struct {
	Index        int     `json:"index"`
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

// Usage represents token usage
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// Function represents a function that can be called by the model
type Function struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Parameters  any    `json:"parameters"`
}

// Error represents an error response from LLM
type Error struct {
	Error struct {
		Message string      `json:"message"`
		Type    string      `json:"type"`
		Param   string      `json:"param"`
		Code    interface{} `json:"code"`
	} `json:"error"`
}

// StreamChoice represents a choice in a stream response
type StreamChoice struct {
	Delta        Message `json:"delta"`
	Index        int     `json:"index"`
	FinishReason string  `json:"finish_reason"`
}

// StreamResponse represents a streaming response
type StreamResponse struct {
	ID      string         `json:"id"`
	Object  string         `json:"object"`
	Created int64          `json:"created"`
	Model   string         `json:"model"`
	Choices []StreamChoice `json:"choices"`
}
