package handler

import openai "github.com/sashabaranov/go-openai"

// 创建 DeepSeek 的 Client
// 参考deepseek的官方文档: https://platform.deepseek.com/api-docs/zh-cn/
func newDeepSeekClient() *openai.Client {
	authToken := "sk-9a19e4f9cfce4bd6ac959deca2944880"
	baseUrl := "https://api.deepseek.com"

	cfg := openai.DefaultConfig(authToken)
	cfg.BaseURL = baseUrl
	return openai.NewClientWithConfig(cfg)
}
