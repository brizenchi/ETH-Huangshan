package middleware

import (
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func RequestId() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get trace ID from header or generate new one
		traceId := c.GetHeader("trace_id")
		if traceId == "" {
			// Generate new trace ID if not found in header
			u4 := uuid.NewV4()
			traceId = u4.String()
		}

		// Add trace ID to context and header
		c.Set("trace_id", traceId)
		c.Header("trace_id", traceId)

		// Process request
		c.Next()
	}
}
