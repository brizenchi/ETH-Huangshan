package llm

import (
	"fmt"
	"time"
)

// Config represents the configuration for LLM client
type Config struct {
	APIKey             string        `json:"api_key" yaml:"api_key"`
	BaseURL            string        `json:"base_url" yaml:"base_url"`
	OrgID              string        `json:"org_id" yaml:"org_id"`
	Timeout            time.Duration `json:"timeout" yaml:"timeout"`
	MaxRetries         int           `json:"max_retries" yaml:"max_retries"`
	Model              string        `json:"model" yaml:"model"`
	MaxConcurrentCalls int           `json:"max_concurrent_calls" yaml:"max_concurrent_calls"`
}

// DefaultConfig returns a default configuration
func DefaultConfig() *Config {
	return &Config{
		BaseURL:            "https://api.openai.com/v1",
		Timeout:            30 * time.Second,
		MaxRetries:         3,
		Model:              "gpt-3.5-turbo",
		MaxConcurrentCalls: 10,
	}
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.APIKey == "" {
		return fmt.Errorf("api key is required")
	}
	if c.BaseURL == "" {
		return fmt.Errorf("base url is required")
	}
	if c.Timeout <= 0 {
		return fmt.Errorf("timeout must be greater than 0")
	}
	if c.MaxRetries < 0 {
		return fmt.Errorf("max retries must be greater than or equal to 0")
	}
	if c.MaxConcurrentCalls <= 0 {
		return fmt.Errorf("max concurrent calls must be greater than 0")
	}
	return nil
}

// MergeDefault merges the default configuration with the current configuration
func (c *Config) MergeDefault() *Config {
	def := DefaultConfig()
	if c.BaseURL == "" {
		c.BaseURL = def.BaseURL
	}
	if c.Timeout == 0 {
		c.Timeout = def.Timeout
	}
	if c.MaxRetries == 0 {
		c.MaxRetries = def.MaxRetries
	}
	if c.Model == "" {
		c.Model = def.Model
	}
	if c.MaxConcurrentCalls == 0 {
		c.MaxConcurrentCalls = def.MaxConcurrentCalls
	}
	return c
}

// Clone returns a deep copy of the configuration
func (c *Config) Clone() *Config {
	return &Config{
		APIKey:             c.APIKey,
		BaseURL:            c.BaseURL,
		OrgID:              c.OrgID,
		Timeout:            c.Timeout,
		MaxRetries:         c.MaxRetries,
		Model:              c.Model,
		MaxConcurrentCalls: c.MaxConcurrentCalls,
	}
}

// WithAPIKey sets the API key
func (c *Config) WithAPIKey(apiKey string) *Config {
	c.APIKey = apiKey
	return c
}

// WithBaseURL sets the base URL
func (c *Config) WithBaseURL(baseURL string) *Config {
	c.BaseURL = baseURL
	return c
}

// WithOrgID sets the organization ID
func (c *Config) WithOrgID(orgID string) *Config {
	c.OrgID = orgID
	return c
}

// WithTimeout sets the timeout
func (c *Config) WithTimeout(timeout time.Duration) *Config {
	c.Timeout = timeout
	return c
}

// WithMaxRetries sets the maximum number of retries
func (c *Config) WithMaxRetries(maxRetries int) *Config {
	c.MaxRetries = maxRetries
	return c
}

// WithDefaultModel sets the default model
func (c *Config) WithModel(model string) *Config {
	c.Model = model
	return c
}

// WithMaxConcurrentCalls sets the maximum number of concurrent calls
func (c *Config) WithMaxConcurrentCalls(max int) *Config {
	c.MaxConcurrentCalls = max
	return c
}
