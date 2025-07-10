package services

import (
	"bytes"
	"context"
	"cybernity/internal/config"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"sync"
)

type ipfsService struct{}

var (
	IpfsService     *ipfsService
	ipfsServiceOnce sync.Once
)

func NewIpfsService() *ipfsService {
	ipfsServiceOnce.Do(func() {
		IpfsService = &ipfsService{}
	})
	return IpfsService
}
func (s *ipfsService) UploadFileRaw(ctx context.Context, fileContent []byte, fileName string) (string, error) {
	// Pinata API endpoint for pinning files
	url := "https://api.pinata.cloud/pinning/pinFileToIPFS"

	// Create a buffer to store our request body
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create a new form-data header with the provided file name
	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	// Copy the file content to the form-data part
	_, err = io.Copy(part, bytes.NewReader(fileContent))
	if err != nil {
		return "", fmt.Errorf("failed to write file content to form: %w", err)
	}

	// It's important to close the multipart writer.
	// This writes the trailing boundary marker.
	err = writer.Close()
	if err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create a new HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", url, body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set the content type, this is important
	req.Header.Set("Content-Type", writer.FormDataContentType())
	// Set the authorization header
	jwt := config.AppConfig.Pinata.JWT
	if jwt == "" {
		return "", fmt.Errorf("PINATA_JWT is not set in config")
	}
	req.Header.Set("Authorization", "Bearer "+jwt)

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check the response status code
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("bad status: %s, body: %s", resp.Status, string(bodyBytes))
	}

	// Decode the JSON response
	var result struct {
		IpfsHash string `json:"IpfsHash"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if result.IpfsHash == "" {
		return "", fmt.Errorf("IpfsHash not found in response")
	}

	return result.IpfsHash, nil
}
func (s *ipfsService) UploadFile(ctx context.Context, fileContent []byte) (string, error) {
	// 创建一个新的 multipart writer
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// 创建一个 form file
	part, err := writer.CreateFormFile("file", "upload.txt")
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	// 将文件内容写入 form file
	_, err = io.Copy(part, bytes.NewReader(fileContent))
	if err != nil {
		return "", fmt.Errorf("failed to write file content to form: %w", err)
	}

	// 关闭 multipart writer
	err = writer.Close()
	if err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// 创建一个 HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", "http://localhost:3000/upload", body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s", resp.Status)
	}

	// 读取响应体
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	// 解析 JSON
	var result map[string]string
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal json: %w", err)
	}

	cid, ok := result["cid"]
	if !ok {
		return "", fmt.Errorf("cid not found in response")
	}

	return cid, nil
}
func (s *ipfsService) DownloadFile(ctx context.Context, cid string) (string, error) {
	// Create HTTP request to Pinata gateway
	url := fmt.Sprintf("https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/%s", cid)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s", resp.Status)
	}

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(respBody), nil
}
