package utils

import (
	"github.com/kataras/iris"
)

func CheckForFields(ctx *iris.Context, required []string) bool {
	for _, key := range required {
		if ctx.Param(key) == "" {
			return false
		}
	}
	return true
}
