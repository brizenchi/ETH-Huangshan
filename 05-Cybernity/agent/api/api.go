package api

import (
	"cybernity/pkg/middleware"
	"net/http"

	"cybernity/internal/config"
	"cybernity/internal/handler/agent"
	"cybernity/internal/handler/sd"

	"github.com/gin-gonic/gin"
)

func Load(e *gin.Engine, mw ...gin.HandlerFunc) *gin.Engine {

	//const version = "/api_v1"
	// Recovery middleware recovers from any panics and writes a 500 if there was one.
	e.Use(middleware.NoCache)
	e.Use(middleware.Options)
	e.Use(middleware.Secure)
	e.Use(middleware.Recover(config.AppConfig.RunMode))
	e.Use(middleware.RequestId())
	e.Use(middleware.LoggerToFile())
	e.Use(middleware.Auth())
	e.Use(mw...)

	e.NoRoute(func(g *gin.Context) {
		g.String(http.StatusNotFound, "The incorrect API route.")
	})

	// c := controller.NewController()

	v1 := e.Group("/api/v1")
	{

		svcd := v1.Group("/sd")
		{
			svcd.GET("/health", sd.HealthCheck)
		}
		agentRouter := v1.Group("/agent")
		{
			agentRouter.POST("/generate", agent.Generate)
			agentRouter.GET("/list", agent.List)
			agentRouter.GET("/detail", agent.Detail)
			agentRouter.PUT("/on_chain", agent.OnChain)
		}

	}
	return e
}
