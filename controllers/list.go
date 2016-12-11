package controllers

import (
	"log"

	"github.com/sakshamsharma/puppy-love/db"

	"github.com/kataras/iris"
	"gopkg.in/mgo.v2/bson"
)

// @AUTH Get user's private information on login
// ---------------------------------------
type ListAll struct {
	Db db.PuppyDb
}

type typeListAll struct {
	Id    string `json:"_id" bson:"_id"`
	Name  string `json:"name" bson:"name"`
	Image string `json:"image" bson:"image"`
}

func (m ListAll) Serve(ctx *iris.Context) {
	var results []typeListAll

	_gender := ctx.Param("gender")
	if _gender != "0" && _gender != "1" {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	// Fetch user
	if err := m.Db.GetCollection("user").
		Find(bson.M{"gender": _gender}).
		All(&results); err != nil {

		ctx.EmitError(iris.StatusNotFound)
		log.Fatal(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, results)
}
