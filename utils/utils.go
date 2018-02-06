package utils

import (
	"github.com/gin-gonic/gin"

	"math/rand"
	"time"
)

func CheckForFields(c *gin.Context, required []string) bool {
	for _, key := range required {
		if c.Param(key) == "" {
			return false
		}
	}
	return true
}

func Randinit() {
	rand.Seed(time.Now().UnixNano())
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}
