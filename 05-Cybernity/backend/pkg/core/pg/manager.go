package pg

import (
	"fmt"
	"sync"
)

// Manager 数据库管理器
type Manager struct {
	dbs    map[string]*Client
	mu     sync.RWMutex
	logger *GormLogger
}

var (
	defaultManager *Manager
	once           sync.Once
)

// NewManager 创建数据库管理器
func NewManager() *Manager {
	once.Do(func() {
		defaultManager = &Manager{
			dbs:    make(map[string]*Client),
			logger: NewGormLogger(),
		}
	})
	return defaultManager
}

// GetManager 获取数据库管理器实例
func GetManager() *Manager {
	return NewManager()
}
func (m *Manager) Init(config *ProjectConfig) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	for key, config := range *config {
		if err := m.Register(key, config); err != nil {
			return fmt.Errorf("failed to register config: %w", err)
		}
	}

	return nil
}

// InitDB 初始化数据库连接
func (m *Manager) Register(key string, config *Config) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// 保存配置
	m.dbs[key] = &Client{
		Config: config,
	}

	// 如果已存在客户端，则重新初始化
	if client, exists := m.dbs[key]; exists {
		if err := client.Init(config); err != nil {
			return fmt.Errorf("failed to reinitialize client: %w", err)
		}
	}

	return nil
}

// GetDB 获取数据库连接（支持事务）
func (m *Manager) GetClient(dbKey string) *Client {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if client, exists := m.dbs[dbKey]; exists {
		return client
	}

	return nil
}
