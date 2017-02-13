package controllers

import (
	"log"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"

	"github.com/kataras/iris"

	"gopkg.in/mgo.v2/bson"
)

// @AUTH @Admin Create the entries in the declare table
// ----------------------------------------------------
type DeclarePrepare struct {
	Db db.PuppyDb
}

func (m DeclarePrepare) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type typeIds struct {
		Id string `json:"_id" bson:"_id"`
	}

	var people []typeIds

	if err := m.Db.GetCollection("user").Find(bson.M{"dirty": false}).
		All(&people); err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		return
	}

	bulk := m.Db.GetCollection("declare").Bulk()
	for _, pe := range people {
		res := models.NewDeclareTable(pe.Id)
		bulk.Upsert(res.Selector, res.Change)
	}
	r, err := bulk.Run()

	if err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Println(err)
		return
	}
	ctx.JSON(iris.StatusOK, r)
}

type DeclareStep struct {
	Db     db.PuppyDb
	DbName string
}

func (m DeclareStep) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type Tokens struct {
		Id     string `json:"_id" bson:"_id"`
		Token0 string `json:"t0" bson:"t0"`
		Token1 string `json:"t1" bson:"t1"`
		Token2 string `json:"t2" bson:"t2"`
		Token3 string `json:"t3" bson:"t3"`
	}

	// Verify valid requested changes
	info := new(Tokens)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.JSON(iris.StatusBadRequest, "Invalid JSON")
		log.Println(err)
		return
	}

	if info.Id != id {
		ctx.Error("Invalid session/userId", iris.StatusBadRequest)
		log.Print("Invalid session/userId:", id, "and", info.Id)
		return
	}

	if _, err := m.Db.GetCollection(m.DbName).UpsertId(id, bson.M{
		"t0": info.Token0,
		"t1": info.Token1,
		"t2": info.Token2,
		"t3": info.Token3,
	}); err != nil {
		ctx.Error("There was an internal server error", iris.StatusInternalServerError)
		log.Println("ERROR:", err)
		return
	}
	ctx.JSON(iris.StatusOK, "Saved your values")
}
