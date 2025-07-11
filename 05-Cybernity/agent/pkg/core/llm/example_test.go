package llm

import (
	"context"
	"fmt"
	"log"
	"testing"
	"time"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

func TestExample2(t *testing.T) {
	client := openai.NewClient(
		option.WithAPIKey("test-key"), // defaults to os.LookupEnv("OPENAI_API_KEY")
	)
	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("你是一个专业的旅行规划师，仅根据给出的地点数据（包括餐厅，酒店，景点等），提供详细信息和评价，如果没有提供数据，则自由发挥。这是需要参考的地点数据，请根据这些数据提供详细信息和评价：景点：\n上海迪士尼度假区,外滩,东方明珠广播电视塔,静安寺,上海豫园,佘山国家旅游度假区,上海共青森林公园,朱家角古镇,上海野生动物园,上海人民广场,上海城隍庙,上海顾村公园,上海海昌海洋公园,世博文化公园,上海动物园,上海世纪公园,滴水湖,上海辰山植物园,上海欢乐谷,武康路历史文化名街,。."),
			openai.UserMessage("上海有什么好玩的"),
		},
		Model: openai.ChatModelGPT4o,
	})

	if err != nil {
		panic(err.Error())
	}
	println(chatCompletion.Choices[0].Message.Content)
}
func TestExample(t *testing.T) {
	// Create a new client with custom configuration
	config := DefaultConfig().
		WithAPIKey("test-key").
		WithTimeout(time.Second * 60).
		WithMaxConcurrentCalls(5).
		WithModel("gpt-3.5-turbo").
		WithBaseURL("https://api.openai.com/v1")

	client := NewClient(config)

	// Create a chat completion request
	request := ChatCompletionRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: "你是一个专业的旅行规划师，仅根据给出的地点数据（包括餐厅，酒店，景点等），提供详细信息和评价，如果没有提供数据，则自由发挥。这是需要参考的地点数据，请根据这些数据提供详细信息和评价：景点：\n上海迪士尼度假区,外滩,东方明珠广播电视塔,静安寺,上海豫园,佘山国家旅游度假区,上海共青森林公园,朱家角古镇,上海野生动物园,上海人民广场,上海城隍庙,上海顾村公园,上海海昌海洋公园,世博文化公园,上海动物园,上海世纪公园,滴水湖,上海辰山植物园,上海欢乐谷,武康路历史文化名街,。.",
			},
			{
				Role:    "user",
				Content: "问题：上海有什么好玩的",
			},
		},
		Temperature: 0.7,
	}

	// Example of streaming response
	streamChan, err := client.ChatCompletionStream(context.TODO(), request)
	if err != nil {
		log.Fatal(err)
	}

	// Read from the stream
	for response := range streamChan {
		for _, choice := range response.Choices {
			fmt.Print(choice.Delta.Content)
		}
	}
}
