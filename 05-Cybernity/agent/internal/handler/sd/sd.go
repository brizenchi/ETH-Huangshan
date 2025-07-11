package sd

import (
	"cybernity/pkg/core/result"

	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	result.Success(c, "ok")
}
