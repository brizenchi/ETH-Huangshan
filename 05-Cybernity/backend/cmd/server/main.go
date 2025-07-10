package main

import (
	"context"
	"cybernity/api"
	"cybernity/internal/config"
	"cybernity/internal/listener"
	"cybernity/pkg/core/llm"
	"cybernity/pkg/core/logger"
	"cybernity/pkg/core/pg"
	"flag"
	"net/http"
	"os"
	"time"

	"log"

	"github.com/gin-gonic/gin"
)

func main() {

	// 解析命令行参数
	configFile := flag.String("c", "deployment/config.yaml", "config file path")
	flag.Parse()

	loc, err := time.LoadLocation(config.AppConfig.Timezone)
	if err != nil {
		log.Fatalf("Failed to load location: %v", err)
	}
	time.Local = loc

	// 如果环境变量中有配置文件路径，优先使用环境变量
	if envConfig := os.Getenv("CONFIG_FILE"); envConfig != "" {
		*configFile = envConfig
	}

	// 初始化配置
	if err := config.InitConfig(*configFile); err != nil {
		log.Fatalf("Failed to initialize config: %v", err)
	}
	if err := logger.Init(config.AppConfig.Log); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}

	if err := llm.InitWithConfig(&config.AppConfig.LLM); err != nil {
		log.Fatalf("Failed to initialize llm: %v", err)
	}
	if err := pg.GetManager().Init(&config.AppConfig.Postgres); err != nil {
		log.Fatalf("Failed to initialize postgres: %v", err)
	}

	// 现在可以使用 config.AppConfig 访问配置
	logger.Infof(context.Background(), "Server Name: %s", config.AppConfig.Name)

	// Create the Gin engine without default config
	g := gin.New()
	// Routes.
	api.Load(
		g,
	)
	go listener.EventListener(context.Background(), config.AppConfig.Eth)

	addr := config.AppConfig.Addr // Assuming the address is stored in the Log.Path for demonstration
	logger.Infof(context.Background(), "Start to listening the incoming requests on http address: %s", addr)
	logger.Info(context.Background(), http.ListenAndServe(addr, g).Error())
}
