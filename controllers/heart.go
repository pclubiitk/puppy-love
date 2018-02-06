package controllers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/milindl/puppy-love/models"

	"github.com/gin-gonic/gin"

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

// Serve when a Heart is to be saved
func GotHeart(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	// Verify valid requested changes
	info := new([]models.GotHeart)
	if err := c.BindJSON(info); err != nil {
		c.String(http.StatusBadRequest, "Invalid JSON")
		log.Println(err)
		return
	}

	// Check that user isn't voting more than 4
	// ========================================
	user := models.User{}
	if err := Db.GetById("user", id).One(&user); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
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
	if err := Db.GetCollection("heart").
		Find(bson.M{"roll": id}).
		All(userVotes); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	diffHearts := difference(*userVotes, *info)

	log.Print("Earlier count: ", len(*userVotes))
	log.Print("Sent new: ", len(diffHearts))

	if len(diffHearts)+len(*userVotes) > 4 {
		c.String(http.StatusBadRequest, "More than allowed votes")
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

	bulk := Db.GetCollection("heart").Bulk()
	for _, heart := range newHearts {
		bulk.Insert(heart)
	}
	r, err := bulk.Run()

	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	c.JSON(http.StatusOK, r)
}

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

	gen := c.Param("gen")

	// Current time
	ctime := uint64(time.Now().UnixNano() / 1000000)

	type AnonymVote struct {
		Value string `json:"v" bson:"v"`
	}

	votes := new([]AnonymVote)

	// Fetch user
	if err := Db.GetCollection("heart").
		Find(bson.M{"time": bson.M{"$gt": ltime, "$lte": ctime},
			"gender": gen}).All(votes); err != nil {
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
