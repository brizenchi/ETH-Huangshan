package llm

import (
	"fmt"
)

const (
	DefaultClientKey = "default"
)

type LLMConfig struct {
	Default *Config
	Configs map[string]*Config `yaml:"configs"`
}

// InitWithConfig initializes the LLM client with the provided configuration
func InitWithConfig(configs *LLMConfig) error {
	if len(configs.Configs) == 0 {
		return fmt.Errorf("no configurations provided")
	}

	manager := GetManager()

	// Register all clients
	for key, config := range configs.Configs {
		// Validate and merge with defaults
		config.MergeDefault()
		if err := config.Validate(); err != nil {
			return fmt.Errorf("invalid configuration for key %s: %v", key, err)
		}

		if err := manager.RegisterClient(key, config); err != nil {
			return fmt.Errorf("failed to register client for key %s: %v", key, err)
		}
	}

	return nil
}

// GetClient returns the LLM client for the given key
func GetClient(key string) (Client, error) {
	return GetManager().GetClient(key)
}

// MustGetClient returns the LLM client for the given key
// Panics if the client does not exist
func MustGetClient(key string) Client {
	return GetManager().MustGetClient(key)
}

// GetDefaultClient returns the default LLM client
func GetDefaultClient() (Client, error) {
	return GetClient(DefaultClientKey)
}

// MustGetDefaultClient returns the default LLM client
// Panics if the client does not exist
func MustGetDefaultClient() Client {
	return MustGetClient(DefaultClientKey)
}
