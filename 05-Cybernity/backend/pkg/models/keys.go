package models

import "encoding/json"

type AgentKeys struct {
	EncryptionPrivateKey string `json:"encryption_private_key"` // RSA key in PEM format
	BlockchainPrivateKey string `json:"blockchain_private_key"` // Ethereum key in hex format
}

func (k *AgentKeys) ToJSON() (string, error) {
	bytes, err := json.Marshal(k)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func AgentKeysFromJSON(jsonString string) (*AgentKeys, error) {
	var keys AgentKeys
	err := json.Unmarshal([]byte(jsonString), &keys)
	if err != nil {
		return nil, err
	}
	return &keys, nil
}
