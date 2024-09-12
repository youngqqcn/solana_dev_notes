package main

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/sashabaranov/go-openai"
)

func main() {
	http.HandleFunc("/chat-stream", handleChatStream)
	http.HandleFunc("/chat", handleChat)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// handleChatSSE 流式聊天,
// 使用 SSE, 与deepseek也是SSE, 与客户端也是SSE
// 关于SSE(Server-Sents Event)
// https://en.wikipedia.org/wiki/Server-sent_events
func handleChatStream(w http.ResponseWriter, r *http.Request) {
	// 发送请求到 deepseek
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
		r.Context(), // 与请求共用同一个 context, 当用户断开连接时，与deepseek的连接会同时断开
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

	// 将 deepseek 的响应头复制到客户端响应头
	for k, v := range stream.Header() {
		w.Header()[k] = v
	}

	// 也可以手动设置响应头
	// w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	// w.Header().Set("Cache-Control", "no-cache")
	// w.Header().Set("Connection", "keep-alive")

	// 发送数据
	for {
		select {
		case <-r.Context().Done():
			fmt.Println("客户端已断开，终端与DeepSeek的连接")
			return
		default:
		}

		response, err := stream.Recv()

		if errors.Is(err, io.EOF) {
			// 结束
			fmt.Println()

			fmt.Fprintf(w, "%v", "\n")
			w.(http.Flusher).Flush()
			return
		}

		if err != nil {
			fmt.Printf("Stream error: %v\n", err)
			return
		}

		// 打印新增的消息
		fmt.Printf("%v", response.Choices[0].Delta.Content)

		// 只返回新增内容
		fmt.Fprintf(w, "%v", response.Choices[0].Delta.Content)

		// 将deepseek的内容全部返回
		// rsp, err := json.MarshalIndent(response, "", "\t")
		// if err != nil {
		// 	fmt.Printf("Marshal error: %v\n", err)
		// 	return
		// }
		// fmt.Fprintf(w, "%v", string(rsp))

		// 刷新
		w.(http.Flusher).Flush()
	}

}

// handleChat , 普通聊天，非流式, 需要等待 deepseek全部返回
func handleChat(w http.ResponseWriter, r *http.Request) {
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

	resp, err := client.CreateChatCompletion(
		r.Context(),
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

	fmt.Println(resp.Choices[0].Message.Content)

	fmt.Fprintf(w, "%v\n", resp.Choices[0].Message.Content)
	w.(http.Flusher).Flush()
}

// 创建 DeepSeek 的 Client
// 参考deepseek的官方文档: https://platform.deepseek.com/api-docs/zh-cn/
func newDeepSeekClient() *openai.Client {
	authToken := "sk-9a19e4f9cfce4bd6ac959deca2944880"
	baseUrl := "https://api.deepseek.com"

	cfg := openai.DefaultConfig(authToken)
	cfg.BaseURL = baseUrl
	return openai.NewClientWithConfig(cfg)
}
