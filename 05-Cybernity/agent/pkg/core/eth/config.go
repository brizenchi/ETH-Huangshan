package eth

type Config struct {
	WsURL           string `yaml:"ws_url"`
	ContractAddress string `yaml:"contract_address"`
	PrivateKey      string `yaml:"private_key"`
}
