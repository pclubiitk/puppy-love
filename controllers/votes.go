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

type VoteSend struct {
	Db db.PuppyDb
}

func (m VoteSend) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type VoteVal struct {
		Value string `json:"v" bson:"v"`
	}

	// Check that votes sent are valid
	// ===============================
	votes := new([]VoteVal)
	if err := ctx.ReadJSON(votes); err != nil {
		ctx.JSON(iris.StatusBadRequest, "Invalid JSON")
		log.Println(err)
		return
	}

	if len(*votes) > 4 {
		ctx.Error("More than allowed votes", iris.StatusBadRequest)
		return
	}

	// Check that user isn't voting more than 4
	// ========================================
	user := models.User{}

	if err := m.Db.GetById("user", id).One(&user); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Fatal(err)
		return
	}

	if user.Vote+len(*votes) > 4 {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	// Increment user's vote count
	// ===========================
	if _, err := m.Db.GetById("user", id).
		Apply(user.HasVoted(len(*votes)), &user); err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Fatal(err)
		return
	}

	// Get latest time
	t, _ := strconv.ParseUint(time.Now().Format("20060102150405"), 10, 64)

	// Add user's votes to DB
	// ======================
	bulk := m.Db.GetCollection("vote").Bulk()
	for _, vote := range *votes {
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
