package controllers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"gopkg.in/mgo.v2/bson"
)

func HeartGet(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	// Last checked time
	ltime, err := strconv.ParseUint(c.Param("time"), 10, 64)
	if err != nil {
		c.String(http.StatusBadRequest, "Bad timestamp value")
		return
	}

	// Current time
	ctime := uint64(time.Now().UnixNano() / 1000000)

	// TODO: fix bindings to be consistent across dbs
	type AnonymVote struct {
		Value          string `json:"v" bson:"v"`
		GenderOfSender string `json:"genderOfSender" bson:"gender"`
	}

	votes := new([]AnonymVote)

	// Fetch user
	if err := Db.GetCollection("heart").
		Find(bson.M{"time": bson.M{"$gt": ltime, "$lte": ctime}}).
		All(votes); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	if *votes == nil {
		*votes = []AnonymVote{}
	}

	c.JSON(http.StatusAccepted, bson.M{
		"votes": *votes,
		"time":  ctime,
	})
}
