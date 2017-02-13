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

func difference(oldVotes []models.Heart,
	newVotes []models.GotHeart) []models.GotHeart {

	diff := []models.GotHeart{}
	m := map[string]int{}
	for _, s1val := range oldVotes {
		m[s1val.Data] = 1
	}

	for _, s2val := range newVotes {
		if m[s2val.Data] != 1 {
			diff = append(diff, s2val)
		}
	}

	return diff
}

type GotHeart struct {
	Db db.PuppyDb
}

// Serve when a Heart is to be saved
func (m GotHeart) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != ctx.Param("you") {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	// Verify valid requested changes
	info := new([]models.GotHeart)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.Error("Invalid JSON", iris.StatusBadRequest)
		log.Println(err)
		return
	}

	// Check that user isn't voting more than 4
	// ========================================
	user := models.User{}
	if err := m.Db.GetById("user", id).One(&user); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}
	var gen string
	if user.Gender == "0" {
		gen = "1"
	} else {
		gen = "0"
	}

	userVotes := new([]models.Heart)
	if err := m.Db.GetCollection("heart").Find(bson.M{"roll": id}).
		All(userVotes); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	diffHearts := difference(*userVotes, *info)

	log.Print("Earlier count: ", len(*userVotes))
	log.Print("Sent new: ", len(diffHearts))

	if len(diffHearts)+len(*userVotes) > 4 {
		ctx.Error("More than allowed votes", iris.StatusBadRequest)
		return
	}

	ctime := uint64(time.Now().UnixNano() / 1000000)

	newHearts := []models.Heart{}
	for _, heart := range diffHearts {
		newHearts = append(newHearts,
			models.Heart{
				Id:     id,
				Gender: gen,
				Time:   ctime,
				Value:  heart.Value,
				Data:   heart.Data,
			})
	}

	bulk := m.Db.GetCollection("heart").Bulk()
	for _, heart := range newHearts {
		bulk.Insert(heart)
	}
	r, err := bulk.Run()

	if err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Println(err)
		return
	}
	ctx.JSON(iris.StatusOK, r)
}

type HeartGet struct {
	Db db.PuppyDb
}

func (m HeartGet) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != ctx.Param("you") {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	// Last checked time
	ltime, err := strconv.ParseUint(ctx.Param("time"), 10, 64)
	if err != nil {
		ctx.Error("Bad timestamp value", iris.StatusBadRequest)
		return
	}

	gen := ctx.Param("gen")

	// Current time
	ctime := uint64(time.Now().UnixNano() / 1000000)

	type AnonymVote struct {
		Value string `json:"v" bson:"v"`
	}

	votes := new([]AnonymVote)

	// Fetch user
	if err := m.Db.GetCollection("heart").
		Find(bson.M{"time": bson.M{"$gt": ltime, "$lte": ctime},
			"gender": gen}).All(votes); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	if *votes == nil {
		*votes = []AnonymVote{}
	}

	ctx.JSON(iris.StatusAccepted, bson.M{"votes": *votes, "time": ctime})
}
