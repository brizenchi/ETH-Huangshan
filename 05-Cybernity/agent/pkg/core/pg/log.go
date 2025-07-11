package pg

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm/logger"
	"gorm.io/gorm/utils"
)

// GormLogger 自定义日志记录器
type GormLogger struct {
	logger.Interface
	originalLogger logger.Interface
}

// NewGormLogger 创建日志记录器
func NewGormLogger() *GormLogger {
	return &GormLogger{
		originalLogger: logger.Default.LogMode(logger.Info),
		Interface:      logger.Default.LogMode(logger.Info),
	}
}

// Trace 实现日志追踪
func (l *GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	sql, rows := fc()

	traceID := "unknown"
	if requestID := ctx.Value("trace_id"); requestID != nil {
		traceID = requestID.(string)
	}

	fileLocation := utils.FileWithLineNum()
	if fileLocation == "" {
		fileLocation = "???"
	}

	wrappedSql := fmt.Sprintf("[TraceID:%s][%s] %s", traceID, fileLocation, sql)

	var wrappedErr error
	if err != nil {
		wrappedErr = fmt.Errorf("[TraceID:%s][%s] %v", traceID, fileLocation, err)
	}

	wrappedFc := func() (string, int64) {
		return wrappedSql, rows
	}

	l.originalLogger.Trace(ctx, begin, wrappedFc, wrappedErr)
}
