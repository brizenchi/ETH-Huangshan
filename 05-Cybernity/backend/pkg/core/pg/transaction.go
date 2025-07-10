package pg

import (
	"context"

	"gorm.io/gorm"
)

type txKey struct{}

// NewTxContext 创建事务上下文
func NewTxContext(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

// WithTransaction 事务包装器
func WithTransaction(ctx context.Context, key string, fn func(txCtx context.Context) error) error {
	db := GetManager().GetClient(key).GetDB(ctx)
	return db.Transaction(func(tx *gorm.DB) error {
		txCtx := NewTxContext(ctx, tx)
		return fn(txCtx)
	})
}
