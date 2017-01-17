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

	if err := m.Db.GetCollection("declare").Find(bson.M{}).
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
	Db db.PuppyDb
}

func (m DeclareStep) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	// Verify valid requested changes
	info := new(models.Declare)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.JSON(iris.StatusBadRequest, "Invalid JSON")
		log.Println(err)
		return
	}

	tmp := models.Declare{}

	if _, err := m.Db.GetById("declare", id).
		Apply(models.UpsertDeclareTable(info), &tmp); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Println(err)
		return
	}
}
