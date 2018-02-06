package controllers

import (
	"log"
	"net/http"

	"github.com/milindl/puppy-love/models"

	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2/bson"
)

// @AUTH @Admin Create the entries in the declare table
// ----------------------------------------------------
func DeclarePrepare(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != "admin" {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	type typeIds struct {
		Id string `json:"_id" bson:"_id"`
	}

	var people []typeIds

	if err := Db.GetCollection("user").
		Find(bson.M{"dirty": false}).
		All(&people); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	bulk := Db.GetCollection("declare").Bulk()
	for _, pe := range people {
		res := models.NewDeclareTable(pe.Id)
		bulk.Upsert(res.Selector, res.Change)
	}
	r, err := bulk.Run()

	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	c.JSON(http.StatusOK, r)
}

func DeclareStep(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	type Tokens struct {
		Id     string `json:"_id" bson:"_id"`
		Token0 string `json:"t0" bson:"t0"`
		Token1 string `json:"t1" bson:"t1"`
		Token2 string `json:"t2" bson:"t2"`
		Token3 string `json:"t3" bson:"t3"`
	}

	// Verify valid requested changes
	info := new(Tokens)
	if err := c.BindJSON(info); err != nil {
		c.String(http.StatusBadRequest, "Invalid JSON")
		log.Println(err)
		return
	}

	if info.Id != id {
		c.String(http.StatusBadRequest, "Invalid session/userId")
		log.Print("Invalid session/userId:", id, "and", info.Id)
		return
	}

	// TODO: fix db name to not be a constant
	if _, err := Db.GetCollection("declare").UpsertId(id, bson.M{
		"t0": info.Token0,
		"t1": info.Token1,
		"t2": info.Token2,
		"t3": info.Token3,
	}); err != nil {
		c.String(http.StatusInternalServerError,
			"There was an internal server error")
		log.Println("ERROR:", err)
		return
	}
	c.JSON(http.StatusOK, "Saved your values")
}
