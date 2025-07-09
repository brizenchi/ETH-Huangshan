package middleware

import (
	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// token := c.GetHeader("Authorization")
		// if token == "" {
		// 	result.UError(c, "Authorization header is required")
		// 	c.Abort()
		// 	return
		// }

		// // Remove "Bearer " prefix if present
		// if len(token) > 7 && token[:7] == "Bearer " {
		// 	token = token[7:]
		// }

		// claims, err := jwt.ParseToken(token)
		// if err != nil {
		// 	result.UError(c, "Invalid or expired token")
		// 	c.Abort()
		// 	return
		// }

		// c.Set("user_id", int(claims["user_id"].(float64)))
		c.Set("user_id", int64(1))
		c.Next()
	}
}
