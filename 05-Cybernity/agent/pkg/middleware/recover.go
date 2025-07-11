package middleware

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"cybernity/pkg/core/logger"
	"cybernity/pkg/core/result"
	"runtime"
	"time"
)

func Recover(runMode string) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now().UTC()
		defer func() {
			if r := recover(); r != nil {
				result.UError(c, fmt.Sprintln(r))
				switch runMode {
				case "test", "release":
					var buf [4096]byte
					n := runtime.Stack(buf[:], false)
					end := time.Now().UTC()
					latency := end.Sub(start)
					logger.WithFields(c, logrus.Fields{
						"latency_time": latency,
						"code":         result.FailCode,
						"panic":        string(buf[:n]),
					}).Error(r)
				default:
					panic(r)
				}
			}
		}()
		c.Next()
	}
}
