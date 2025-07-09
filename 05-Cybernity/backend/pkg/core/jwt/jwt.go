package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
)

type Config struct {
	Secret         string `yaml:"secret"`
	ExpiresAtHours int    `yaml:"expires_at_hours"`
}

var config = &Config{}

func InitConfig(cfg *Config) {
	config = cfg
}

func GenerateToken(claims map[string]interface{}, expireHours int) (string, error) {
	// 添加标准声明
	standardClaims := jwt.StandardClaims{
		IssuedAt:  time.Now().Unix(),
		ExpiresAt: time.Now().Add(time.Hour * time.Duration(expireHours)).Unix(),
	}

	// 合并自定义声明和标准声明
	allClaims := jwt.MapClaims{}
	for k, v := range claims {
		allClaims[k] = v
	}
	allClaims["iat"] = standardClaims.IssuedAt
	allClaims["exp"] = standardClaims.ExpiresAt

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, allClaims)
	signedToken, err := token.SignedString([]byte(config.Secret))
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

func ParseToken(tokenString string) (map[string]interface{}, error) {
	if tokenString == "" {
		return nil, fmt.Errorf("auth token empty")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.Secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("token parse error: %v", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
