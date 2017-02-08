package controllers

import (
	"errors"
	"log"

	"github.com/pclubiitk/puppy-love/config"
	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"

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
		log.Println(err)
		return
	}

	// @TODO @IMPORTANT Move password to env variable
	if u.Username == "admin" {
		if u.Passhash == config.CfgAdminPass {
			ctx.Session().Set("Status", "login")
			ctx.Session().Set("id", u.Username)
			ctx.Write("Logged in: %s", u.Username)
		} else {
			SessionLogout(ctx)
			ctx.Write("Invalid username or password")
		}
		return
	}

	user := models.User{}

	// Fetch user
	if err := m.Db.GetById("user", u.Username).One(&user); err != nil {
		SessionLogout(ctx)
		ctx.Error("Invalid user", iris.StatusNotFound)
		log.Println("Invalid user: " + u.Username)
		return
	}

	// Check login
	if user.Pass == u.Passhash {
		ctx.Session().Set("Status", "login")
		ctx.Session().Set("id", u.Username)
		ctx.Write("Logged in: %s", u.Username)
	} else {
		SessionLogout(ctx)
		ctx.Error("Invalid password", iris.StatusForbidden)
	}
}

func SessionLogout(ctx *iris.Context) {
	ctx.SessionDestroy()
}

func SessionId(ctx *iris.Context) (string, error) {
	id := ctx.Session().Get("id")
	if id != nil {
		return id.(string), nil
	}
	return "", errors.New("No such session")
}
