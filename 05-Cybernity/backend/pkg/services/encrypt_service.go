package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"sync"
)

type encryptService struct{}

var (
	EncryptService     *encryptService
	encryptServiceOnce sync.Once
)

func NewEncryptService() *encryptService {
	encryptServiceOnce.Do(func() {
		EncryptService = &encryptService{}
	})
	return EncryptService
}

// GenerateKeyPair generates a new key pair
func (s *encryptService) GenerateKeyPair(bits int) (*rsa.PrivateKey, error) {
	privKey, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, err
	}
	return privKey, nil
}

// EncryptWithPublicKey encrypts data with public key
func (s *encryptService) EncryptWithPublicKey(msg []byte, pub *rsa.PublicKey) ([]byte, error) {
	hash := sha256.New()
	ciphertext, err := rsa.EncryptOAEP(hash, rand.Reader, pub, msg, nil)
	if err != nil {
		return nil, err
	}
	return ciphertext, nil
}

// DecryptWithPrivateKey decrypts data with private key
func (s *encryptService) DecryptWithPrivateKey(ciphertext []byte, priv *rsa.PrivateKey) ([]byte, error) {
	hash := sha256.New()
	plaintext, err := rsa.DecryptOAEP(hash, rand.Reader, priv, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return plaintext, nil
}

// EncryptHybrid encrypts data using a hybrid approach (RSA-OAEP + AES-GCM)
func (s *encryptService) EncryptHybrid(msg []byte, pub *rsa.PublicKey) ([]byte, error) {
	// Generate a random AES-256 key.
	aesKey := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, aesKey); err != nil {
		return nil, fmt.Errorf("failed to generate AES key: %w", err)
	}

	// Encrypt the data with AES-GCM.
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	encryptedMsg := gcm.Seal(nil, nonce, msg, nil)

	// Encrypt the AES key with the RSA public key.
	hash := sha256.New()
	encryptedAESKey, err := rsa.EncryptOAEP(hash, rand.Reader, pub, aesKey, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt AES key with RSA: %w", err)
	}

	// Combine and return: encrypted AES key + nonce + encrypted message.
	var result []byte
	result = append(result, encryptedAESKey...)
	result = append(result, nonce...)
	result = append(result, encryptedMsg...)

	return result, nil
}

// DecryptHybrid decrypts data using a hybrid approach (RSA-OAEP + AES-GCM)
func (s *encryptService) DecryptHybrid(ciphertext []byte, priv *rsa.PrivateKey) ([]byte, error) {
	rsaKeySize := priv.Size()
	// Standard GCM nonce size is 12 bytes
	nonceSize := 12

	if len(ciphertext) < rsaKeySize+nonceSize {
		return nil, errors.New("ciphertext too short")
	}

	// Extract parts
	encryptedAESKey := ciphertext[:rsaKeySize]
	nonce := ciphertext[rsaKeySize : rsaKeySize+nonceSize]
	encryptedMsg := ciphertext[rsaKeySize+nonceSize:]

	// Decrypt AES key
	hash := sha256.New()
	aesKey, err := rsa.DecryptOAEP(hash, rand.Reader, priv, encryptedAESKey, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt AES key with RSA: %w", err)
	}

	// Decrypt message with AES-GCM
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	if gcm.NonceSize() != nonceSize {
		// This should not happen if we use standard GCM
		return nil, fmt.Errorf("nonce size mismatch: expected %d, got %d", nonceSize, gcm.NonceSize())
	}

	plaintext, err := gcm.Open(nil, nonce, encryptedMsg, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt message with AES-GCM: %w", err)
	}

	return plaintext, nil
}

// PrivateKeyToBytes private key to bytes
func (s *encryptService) PrivateKeyToBytes(priv *rsa.PrivateKey) []byte {
	privBytes := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(priv),
		},
	)

	return privBytes
}

// PublicKeyToBytes public key to bytes
func (s *encryptService) PublicKeyToBytes(pub *rsa.PublicKey) ([]byte, error) {
	pubASN1, err := x509.MarshalPKIXPublicKey(pub)
	if err != nil {
		return nil, err
	}

	pubBytes := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: pubASN1,
	})

	return pubBytes, nil
}

// BytesToPrivateKey bytes to private key
func (s *encryptService) BytesToPrivateKey(priv []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(priv)
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the key")
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}

// BytesToPublicKey bytes to public key
func (s *encryptService) BytesToPublicKey(pub []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(pub)
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the key")
	}
	ifc, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	key, ok := ifc.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not RSA public key")
	}
	return key, nil
}
