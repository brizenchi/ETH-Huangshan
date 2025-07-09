package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// NoCache is a middleware function that appends headers
// to prevent the client from caching the HTTP result.
func NoCache(g *gin.Context) {
	g.Header("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate, value")
	g.Header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT")
	g.Header("Last-Modified", time.Now().UTC().Format(http.TimeFormat))
	g.Next()
}

// Options is a middleware function that appends headers
// for options requests and aborts then exits the middleware
// chain and ends the request.
func Options(g *gin.Context) {
	if g.Request.Method != "OPTIONS" {
		g.Next()
	} else {
		g.Header("Access-Control-Allow-Origin", "*")
		g.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		g.Header("Access-Control-Allow-Headers", "authorization, origin, content-type, accept")
		g.Header("Allow", "HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS")
		g.Header("Content-Type", "application/json")
		// g.Header("Content-Length"s)

		g.AbortWithStatus(200)
	}
}

// Secure is a middleware function that appends security
// and resource access headers.
func Secure(g *gin.Context) {
	g.Header("Access-Control-Allow-Origin", "*")
	g.Header("X-Frame-Options", "DENY")
	g.Header("X-Content-Type-Options", "nosniff")
	g.Header("X-XSS-Protection", "1; mode=parse")
	if g.Request.TLS != nil {
		g.Header("Strict-Transport-Security", "max-age=31536000")
	}

	// Also consider adding Content-Security-Policy headers
	// g.Header("Content-Security-Policy", "script-src 'self' https://cdnjs.cloudflare.com")
}

// Cors 跨域中间件
func Cors(c *gin.Context) {
	method := c.Request.Method
	origin := c.Request.Header.Get("Origin") //请求头部
	if origin != "" {
		//接收客户端发送的origin （重要！）
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		//服务器支持的所有跨域请求的方法
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		//允许跨域设置可以返回其他子段，可以自定义字段
		c.Header("Access-Control-Allow-Headers",
			"Authorization, Content-Length, X-CSRF-Token, Token,session, Content-Type")
		// 允许浏览器（客户端）可以解析的头部 （重要）
		c.Header("Access-Control-Expose-Headers",
			"Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers")
		//设置缓存时间
		c.Header("Access-Control-Max-Age", "172800")
		//允许客户端传递校验信息比如 cookie (重要)
		c.Header("Access-Control-Allow-Credentials", "true")
	}

	//允许类型校验
	if method == "OPTIONS" {
		c.JSON(http.StatusOK, "ok!")
	}

	defer func() {
		if err := recover(); err != nil {
			panic(err)
		}
	}()
	c.Next()
}
