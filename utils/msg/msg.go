package msg

import (
	"github.com/kataras/iris"
)

type Message struct {
	success bool
	code    int
	data    interface{}
}

var Unauthorized = Message{
	false,
	iris.StatusUnauthorized,
	"Unauthorized Request",
}

var MissingFields = Message{
	false,
	iris.StatusNotFound,
	"Missing Fields",
}

var WrongAuthCode = Message{
	false,
	iris.StatusBadRequest,
	"Wrong authentication code",
}

var BadRequest = Message{
	false,
	iris.StatusBadRequest,
	"Bad request",
}

var NotFound = Message{
	false,
	iris.StatusNotFound,
	"Not found",
}

var AllFine = Message{
	true,
	iris.StatusAccepted,
	"Success",
}

func SendMessage(ctx *iris.Context, m Message) {
	ctx.JSON(m.code, m.data)
}
