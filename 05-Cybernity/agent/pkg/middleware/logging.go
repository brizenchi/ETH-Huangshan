package middleware

import (
	"bytes"
	"cybernity/pkg/core/logger"
	"io"

	"github.com/sirupsen/logrus"
	"github.com/willf/pad"

	"github.com/gin-gonic/gin"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func LoggerToFile() gin.HandlerFunc {
	return func(c *gin.Context) {

		// start := time.Now().UTC()
		ip := c.ClientIP()

		method := c.Request.Method
		path := c.Request.URL.Path
		if len(c.Request.URL.RawQuery) > 0 {
			path = path + "&" + c.Request.URL.RawQuery
		}

		// Read the Body content
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
		}

		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		// Log the incoming request with headers
		fields := logrus.Fields{
			"request": string(bodyBytes),
			"path":    path,
			"method":  pad.Right(method, 5, ""),
			"ip":      ip,
			"headers": make(map[string]string),
		}

		// Add headers to fields
		for key, values := range c.Request.Header {
			if len(values) > 0 {
				fields["headers"].(map[string]string)[key] = values[0]
			}
		}

		logger.WithFields(c, fields).Info("Request")

		blw := &bodyLogWriter{
			body:           bytes.NewBufferString(""),
			ResponseWriter: c.Writer,
		}
		c.Writer = blw
		c.Next()

		// end := time.Now().UTC()
		// latency := end.Sub(start)

		// Log the response
		// logger.WithFields(c, logrus.Fields{
		// 	"latency_time": latency,
		// 	"response":     blw.body.String(),
		// }).Info("Response")

	}
}
