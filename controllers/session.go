package controllers

import (
	"log"

	"github.com/sakshamsharma/puppy-love/db"
	"github.com/sakshamsharma/puppy-love/models"

	"github.com/kataras/iris"
)

type LoginInfo struct {
	Username string `json:"username" xml:"username" form:"username"`
	Passhash string `json:"password" xml:"password" form:"password"`
}

type SessionLogin struct {
	Db db.PuppyDb
}

func (m SessionLogin) Serve(ctx *iris.Context) {
	if ctx.Session().Get("Status") != nil {
		ctx.Session().Clear()
	}

	u := new(LoginInfo)
	if err := ctx.ReadJSON(u); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	user := models.User{}

	// Fetch user
	if err := m.Db.GetById("user", u.Username).One(&user); err != nil {
		ctx.Write("Bad user.")
		log.Fatal(err)
		return
	}

	// Check login
	if user.Pass == u.Passhash {
		ctx.Session().Set("Status", "login")
		ctx.Session().Set("id", u.Username)

		ctx.Write("Logged in: %s", u.Username)
	} else {
		SessionLogout(ctx)
		ctx.Write("Invalid request")
	}
}

func SessionLogout(ctx *iris.Context) {
	ctx.SessionDestroy()
}

func SessionId(ctx *iris.Context) string {
	return ctx.Session().Get("id").(string)
}
