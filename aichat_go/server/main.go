package main

import (
	"log"
	"net/http"

	"github.com/youngqqcn/fansland_ai/openai_go/server/handler"
)

func main() {
	http.HandleFunc("/chat-stream", handler.HandleChatStream)
	http.HandleFunc("/chat", handler.HandleChat)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
