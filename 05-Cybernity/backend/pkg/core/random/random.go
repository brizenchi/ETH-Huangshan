package random

import "math/rand"

func GenerateNumbers() string {
	count := 6
	const numbers = "0123456789"
	result := make([]byte, count)
	for i := 0; i < count; i++ {
		result[i] = numbers[rand.Intn(len(numbers))]
	}
	return string(result)
}
