package controllers

import (
	"log"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"

	"github.com/kataras/iris"
	"gopkg.in/mgo.v2/bson"
)

// @AUTH Get user's basic information
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
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, results)
}

// @AUTH @Admin Get compute table
// ------------------------------
type ComputeListAdmin struct {
	Db db.PuppyDb
}

func (m ComputeListAdmin) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	var results []models.Compute

	// Fetch user
	if err := m.Db.GetCollection("compute").
		Find(bson.M{}).All(&results); err != nil {

		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, results)
}

// @AUTH Get all relevant entries from table
// -----------------------------------------
type ComputeList struct {
	Db db.PuppyDb
}

func (m ComputeList) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type tokenType struct {
		D0 string `json:"d0" bson:"d0"`
		D1 string `json:"d1" bson:"d1"`
	}

	type retType struct {
		Id     string    `json:"_id" bson:"_id"`
		Token1 tokenType `json:"t0" bson:"t0"`
		Token2 tokenType `json:"t1" bson:"t1"`
	}

	var query []retType

	// Fetch user
	if err := m.Db.GetCollection("compute").
		Find(bson.M{"$or": []bson.M{bson.M{"p1": id}, bson.M{"p2": id}}}).
		All(&query); err != nil {

		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	if query == nil {
		query = []retType{}
	}

	ctx.JSON(iris.StatusAccepted, query)
}

type PubkeyList struct {
	Db db.PuppyDb
}

func (m PubkeyList) Serve(ctx *iris.Context) {
	_gender := ctx.Param("gender")
	if _gender != "0" && _gender != "1" {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	var query [](struct {
		Id string `json:"_id" bson:"_id"`
		PK string `json:"pubKey" bson:"pubKey"`
	})

	if err := m.Db.GetCollection("user").
		Find(bson.M{"gender": _gender, "dirty": false}).All(&query); err != nil {

		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, query)
}

type DeclareList struct {
	Db db.PuppyDb
}

func (m DeclareList) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	var resp models.Declare
	if err := m.Db.GetById("declare", id).One(&resp); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	if resp.Token0 != "" {
		resp.Token0 = "1"
	}
	if resp.Token1 != "" {
		resp.Token1 = "1"
	}
	if resp.Token2 != "" {
		resp.Token2 = "1"
	}
	if resp.Token3 != "" {
		resp.Token3 = "1"
	}

	ctx.JSON(iris.StatusOK, resp)
}
