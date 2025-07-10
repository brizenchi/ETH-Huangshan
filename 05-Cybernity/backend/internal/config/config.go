package config

import (
	"cybernity/pkg/core/eth"
	"cybernity/pkg/core/llm"
	"cybernity/pkg/core/logger"
	"cybernity/pkg/core/pg"
	"cybernity/pkg/core/pinata"
	"os"

	"gopkg.in/yaml.v2"
)

type Config struct {
	Name     string           `yaml:"name"`
	Addr     string           `yaml:"addr"`
	RunMode  string           `yaml:"run_mode"`
	Timezone string           `yaml:"timezone"`
	Log      logger.Config    `yaml:"log"`
	LLM      llm.LLMConfig    `yaml:"llm"`
	Eth      eth.Config       `yaml:"eth"`
	Postgres pg.ProjectConfig `yaml:"postgres"`
	Pinata   pinata.Config    `yaml:"pinata"`
}

var AppConfig Config

func InitConfig(configPath string) error {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	err = yaml.Unmarshal(data, &AppConfig)
	if err != nil {
		return err
	}

	return nil
}
