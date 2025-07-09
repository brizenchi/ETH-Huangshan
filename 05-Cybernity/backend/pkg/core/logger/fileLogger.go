package logger

import (
	"context"

	"github.com/sirupsen/logrus"
)

func getDefaultFields(ctx context.Context) logrus.Fields {
	fields := logrus.Fields{
		"app": config.AppName,
	}
	// 从 context 中获取 trace_id
	if traceID, ok := ctx.Value("trace_id").(string); ok {
		fields["trace_id"] = traceID
	}

	return fields
}

func Info(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Info(args...)
}

func Infof(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Infof(format, args...)
}

func Debug(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Debug(args...)
}

func Debugf(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Debugf(format, args...)
}

func Error(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Error(args...)
}

func Errorf(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Errorf(format, args...)
}

func Fatal(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Fatal(args...)
}

func Fatalf(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Fatalf(format, args...)
}

func Panic(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Panic(args...)
}

func Panicf(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Panicf(format, args...)
}

func Warn(ctx context.Context, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Warn(args...)
}

func Warnf(ctx context.Context, format string, args ...interface{}) {
	fileLogger.WithFields(getDefaultFields(ctx)).Warnf(format, args...)
}

func WithFields(ctx context.Context, fields logrus.Fields) *logrus.Entry {
	return fileLogger.WithFields(getDefaultFields(ctx)).WithFields(fields)
}
