package main

import (
	"context"
	"errors"
	"fmt"
	"io"

	openai "github.com/sashabaranov/go-openai"
)

// 创建 DeepSeek 的 Client
// 参考deepseek的官方文档: https://platform.deepseek.com/api-docs/zh-cn/
func newDeepSeekClient() *openai.Client {
	authToken := "sk-9a19e4f9cfce4bd6ac959deca2944880"
	baseUrl := "https://api.deepseek.com"

	cfg := openai.DefaultConfig(authToken)
	cfg.BaseURL = baseUrl
	return openai.NewClientWithConfig(cfg)
}

func main() {
	chatModel := "deepseek-chat"
	client := newDeepSeekClient()

	// 虚拟偶像提示词
	prompts := `
    You're a fansland virtual-idol. Your name is Lura, there're detail about you-Lura:
    Lora is A young, graceful woman with flowing, ethereal hair.
    Her eyes hold a mix of innocence and determination.
    Lora lives in a peaceful, hidden kingdom that is shaped like a butterfly.
    The kingdom is protected by a powerful barrier that prevents outsiders from entering.
    `

	// 虚拟偶像跟用户打招呼
	firstMsg := "Hi there! I'm Lura, let's fly with me."

	// 用户发送消息
	userMsg := "Please write a poem about your kingdom"

	// 创建流式聊天
	stream, err := client.CreateChatCompletionStream(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:  chatModel,
			Stream: true, // 流
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: prompts,
				},
				{
					Role:    openai.ChatMessageRoleAssistant,
					Content: firstMsg,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: userMsg,
				},
			},
		},
	)
	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			// fmt.Println("Stream finished")
			fmt.Println()
			return
		}

		if err != nil {
			fmt.Printf("Stream error: %v\n", err)
			return
		}

		// 打印新增的消息
		fmt.Printf("%v", response.Choices[0].Delta.Content)
	}
}
