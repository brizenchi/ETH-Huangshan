package jwt

type User struct {
	Wallet  string
	Email   string
	RoleId  string
	ChainId string
}

func NewUser(wallet, email string, roleId, chainId string) *User {
	return &User{
		Wallet:  wallet,
		Email:   email,
		RoleId:  roleId,
		ChainId: chainId,
	}
}

func (user *User) GetWallet() string {
	return user.Wallet
}

func (user *User) GetEmail() string {
	return user.Email
}

// get user role id
func (user *User) GetRoleId() string {
	return user.RoleId
}
func (user *User) GetChainId() string {
	return user.ChainId
}
