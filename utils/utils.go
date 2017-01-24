package utils

import (
	"github.com/kataras/iris"

	"math/rand"
	"time"
)

func CheckForFields(ctx *iris.Context, required []string) bool {
	for _, key := range required {
		if ctx.Param(key) == "" {
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
