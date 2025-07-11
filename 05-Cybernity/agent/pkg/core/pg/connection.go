package pg

import (
	"context"
	"fmt"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	DbMaxIdleConns = 50
	DbMaxOpenConns = 50
	DbMaxLifetime  = time.Hour
)

// Client MySQL客户端
type Client struct {
	db     *gorm.DB
	mu     sync.RWMutex
	Config *Config
}

// NewClient 创建一个新的数据库客户端
func (c *Client) Init(config *Config) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		config.Host, config.User,
		config.Password, config.Database,
		config.Port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxIdleConns(config.MaxIdleConns)
	sqlDB.SetMaxOpenConns(config.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(DbMaxLifetime)

	c.db = db
	return nil
}

// Close 关闭数据库连接
func (c *Client) Close() error {
	if c.db != nil {
		sqlDB, err := c.db.DB()
		if err != nil {
			return fmt.Errorf("failed to get underlying sql.DB: %w", err)
		}
		return sqlDB.Close()
	}
	return nil
}

// GetDB 获取数据库连接
func (c *Client) GetDB(ctx context.Context) *gorm.DB {
	if c == nil || c.db == nil {
		panic("database client not initialized")
	}

	c.mu.RLock()
	defer c.mu.RUnlock()
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return c.db.WithContext(ctx)
}
