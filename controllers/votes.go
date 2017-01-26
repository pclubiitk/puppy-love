package controllers

import (
	"log"
	"strconv"
	"time"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"

	"github.com/kataras/iris"

	"gopkg.in/mgo.v2/bson"
)

// @AUTH @Admin Create the entries in the vote table
// ----------------------------------------------------
type VotePrepare struct {
	Db db.PuppyDb
}

func (m VotePrepare) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type VoteVal struct {
		Value string `json:"v" bson:"v"`
	}

	var votes []VoteVal
	if len(votes) > 4 {
		ctx.Error("More than allowed votes", iris.StatusBadRequest)
		return
	}

	t, _ := strconv.ParseUint(time.Now().Format("20060102150405"), 10, 64)

	bulk := m.Db.GetCollection("vote").Bulk()
	for _, vote := range votes {
		bulk.Insert(models.Vote{t, vote.Value})
	}
	r, err := bulk.Run()

	if err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Println(err)
		return
	}
	ctx.JSON(iris.StatusOK, r)
}

// Get your votes
// --------------
type VoteGet struct {
	Db db.PuppyDb
}

type typeVoteGet struct {
	Id     string `json:"_id" bson:"_id"`
	Name   string `json:"name" bson:"name"`
	Gender string `json:"gender" bson:"gender"`
	Image  string `json:"image" bson:"image"`
	PubK   string `json:"pubKey" bson:"pubKey"`
}

func (m VoteGet) Serve(ctx *iris.Context) {
	time, err := strconv.ParseUint(ctx.Param("time"), 10, 64)
	if err != nil {
		ctx.Error("Bad timestamp value", iris.StatusBadRequest)
		return
	}

	votes := []models.Vote{}

	// Fetch user
	if err := m.Db.GetCollection("vote").
		Find(bson.M{"time": bson.M{"$gt": time}}).
		All(&votes); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Fatal(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, votes)
}
