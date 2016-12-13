package controllers

import (
	"log"

	"github.com/sakshamsharma/puppy-love/db"
	"github.com/sakshamsharma/puppy-love/models"

	"github.com/kataras/iris"
	"gopkg.in/mgo.v2/bson"
)

// @AUTH @Admin Drop compute table
// ----------------------------------------------------
type ComputeDelete struct {
	Db db.PuppyDb
}

func (m ComputeDelete) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	if err := m.Db.GetCollection("compute").DropCollection(); err != nil {
		ctx.Error("Could not delete collection", iris.StatusInternalServerError)
		return
	}

	ctx.JSON(iris.StatusOK, "Deleted compute table")
}

// @AUTH @Admin Create the entries in the compute table
// ----------------------------------------------------
type ComputePrepare struct {
	Db db.PuppyDb
}

func (m ComputePrepare) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type typeIds struct {
		Id string `json:"_id" bson:"_id"`
	}

	var females []typeIds
	var males []typeIds

	collection := m.Db.GetCollection("user")
	err1 := collection.Find(bson.M{"gender": "0"}).All(&females)
	err2 := collection.Find(bson.M{"gender": "1"}).All(&males)

	if err1 != nil || err2 != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		return
	}

	// var toInsert []interface{}
	bulk := m.Db.GetCollection("compute").Bulk()
	for _, fe := range females {
		for _, ma := range males {
			res := models.UpsertEntry(fe.Id, ma.Id)
			bulk.Upsert(res.Selector, res.Change)
		}
	}
	r, err := bulk.Run()

	if err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Println(err)
		return
	}
	ctx.JSON(iris.StatusOK, r)
}
