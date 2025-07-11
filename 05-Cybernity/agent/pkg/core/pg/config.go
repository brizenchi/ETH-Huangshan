package pg

import "fmt"

// Config MySQL配置
type Config struct {
	Host         string `yaml:"host"`
	Port         int    `yaml:"port"`
	Database     string `yaml:"database"`
	User         string `yaml:"user"`
	Password     string `yaml:"password"`
	MaxIdleConns int    `yaml:"max_idle_conns"`
	MaxOpenConns int    `yaml:"max_open_conns"`
	MaxLifetime  int    `yaml:"max_lifetime"` // 单位：秒
}

// ProjectConfig 项目数据库配置，支持多实例
type ProjectConfig map[string]*Config

// Validate 验证配置是否有效
func (c *Config) Validate() error {
	if c.Host == "" {
		return ErrEmptyHost
	}
	if c.Port == 0 {
		return ErrInvalidPort
	}
	if c.Database == "" {
		return ErrEmptyDatabase
	}
	if c.User == "" {
		return ErrEmptyUser
	}
	if c.Password == "" {
		return ErrEmptyPassword
	}
	return nil
}

// DSN 获取数据库连接字符串
func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User,
		c.Password,
		c.Host,
		c.Port,
		c.Database,
	)
}
