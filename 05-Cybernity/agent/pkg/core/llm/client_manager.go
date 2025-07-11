package llm

import (
	"fmt"
	"sync"
)

var (
	defaultManager *ClientManager
	once           sync.Once
)

// ClientManager manages LLM client instances
type ClientManager struct {
	clients map[string]Client
	mu      sync.RWMutex
}

// GetManager returns the singleton instance of ClientManager
func GetManager() *ClientManager {
	once.Do(func() {
		defaultManager = &ClientManager{
			clients: make(map[string]Client),
		}
	})
	return defaultManager
}

// RegisterClient registers a new client with the given key
func (m *ClientManager) RegisterClient(key string, config *Config) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.clients[key]; exists {
		return fmt.Errorf("client with key %s already exists", key)
	}

	if config == nil {
		config = DefaultConfig()
	}

	m.clients[key] = NewClient(config)
	return nil
}

// GetClient returns the client instance for the given key
func (m *ClientManager) GetClient(key string) (Client, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	client, exists := m.clients[key]
	if !exists {
		return nil, fmt.Errorf("no client found for key %s", key)
	}

	return client, nil
}

// MustGetClient returns the client instance for the given key
// Panics if the client does not exist
func (m *ClientManager) MustGetClient(key string) Client {
	client, err := m.GetClient(key)
	if err != nil {
		panic(err)
	}
	return client
}

// RemoveClient removes the client instance for the given key
func (m *ClientManager) RemoveClient(key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.clients[key]; !exists {
		return fmt.Errorf("no client found for key %s", key)
	}

	delete(m.clients, key)
	return nil
}

// HasClient checks if a client exists for the given key
func (m *ClientManager) HasClient(key string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	_, exists := m.clients[key]
	return exists
}

// Clear removes all registered clients
func (m *ClientManager) Clear() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.clients = make(map[string]Client)
}
