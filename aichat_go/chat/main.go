package main

import (
	"context"
	"fmt"

	openai "github.com/sashabaranov/go-openai"
)

func main() {
	authToken := "sk-9a19e4f9cfce4bd6ac959deca2944880"
	baseUrl := "https://api.deepseek.com"
	chatModel := "deepseek-chat"

    // 提示词
	prompts := "you're a virtual idol, your name is Lucy, when others says hello to you, you should say hi back and introduce yourself first."

    // 第一条消息
	firstMsg := "Hi there! I'm Lucy, your friendly virtual idol. It's great to meet you! How can I assist you today?"

    // 用户的消息

	cfg := openai.DefaultConfig(authToken)
	cfg.BaseURL = baseUrl
	client := openai.NewClientWithConfig(cfg)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: chatModel,
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
                    Role: openai.ChatMessageRoleUser,
                    Content: "write a poem about water",
                },
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}

	fmt.Println(resp.Choices[0].Message.Content)
}
