package pg

import "errors"

// 错误定义
var (
	ErrEmptyHost     = errors.New("host cannot be empty")
	ErrInvalidPort   = errors.New("invalid port")
	ErrEmptyDatabase = errors.New("database cannot be empty")
	ErrEmptyUser     = errors.New("user cannot be empty")
	ErrEmptyPassword = errors.New("password cannot be empty")
	ErrNoClient      = errors.New("no database client available")
)

// 默认配置
const (
	DefaultDriver       = "postgres"
	DefaultMaxIdleConns = 50
	DefaultMaxOpenConns = 50
	DefaultMaxLifetime  = 300 // 5分钟
)

// 数据库实例 key
const (
	DefaultDB = "default" // 默认数据库
)
