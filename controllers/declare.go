package controllers

import (
	"log"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"

	"github.com/kataras/iris"
)

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
