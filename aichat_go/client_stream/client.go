package main

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	// "os"
)

func main() {
	// 创建一个 HTTP 客户端
	client := &http.Client{}

	// 创建一个 POST 请求
	req, err := http.NewRequest("POST", "http://localhost:8080/chat", nil)
	if err != nil {
		fmt.Println("Failed to create request:", err)
		return
	}

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Failed to send request:", err)
		return
	}
	defer resp.Body.Close()

	// 检查响应状态码
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Unexpected status code:", resp.StatusCode)
		return
	}

	// 使用 bufio.Reader 逐行读取响应
	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			fmt.Println("Failed to read response:", err)
			return
		}
		fmt.Print(line)
	}
}