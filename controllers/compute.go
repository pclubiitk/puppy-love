package controllers

import (
	"github.com/sakshamsharma/puppy-love/db"
	"github.com/sakshamsharma/puppy-love/models"

	"github.com/kataras/iris"
)

// @AUTH Get user's private information on login
// ---------------------------------------
type ComputeNewBulk struct {
	Db db.PuppyDb
}

type typeComputeNew struct {
	Id    string `json:"id" bson:"id"`
	Token string `json:"tk" bson:"tk"`
}

func (m ComputeNewBulk) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	info := new([]typeComputeNew)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	toInsert := make([]models.Compute, len(*info))

	for i, item := range *info {
		itemId := id + "-" + item.Id
		p1 := id
		p2 := item.Id
		t1 := item.Token
		t2 := ""
		if id > item.Id {
			itemId = item.Id + "-" + id
			p1 = item.Id
			p2 = id
			t1 = ""
			t2 = item.Token
		}

		toInsert[i].Id = itemId
		toInsert[i].Person1 = p1
		toInsert[i].Person2 = p2
		toInsert[i].Token1 = t1
		toInsert[i].Token2 = t2
	}

	// No return value here
	m.Db.GetCollection("compute").Bulk().Insert(&toInsert)

	ctx.JSON(iris.StatusOK, "")
}
