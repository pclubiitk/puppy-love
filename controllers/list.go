package controllers

import (
	"log"
	"net/http"

	"github.com/milindl/puppy-love/models"

	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2/bson"
)

// @AUTH Get user's basic information
// ---------------------------------------
type typeListAll struct {
	Id    string `json:"_id" bson:"_id"`
	Name  string `json:"name" bson:"name"`
	Image string `json:"image" bson:"image"`
}

func ListAll(c *gin.Context) {
	var results []typeListAll

	_gender := c.Param("gender")
	if _gender != "0" && _gender != "1" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	// Fetch user
	if err := Db.GetCollection("user").
		Find(bson.M{"gender": _gender}).
		All(&results); err != nil {

		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	c.JSON(http.StatusAccepted, results)
}

func PubkeyList(c *gin.Context) {
	_gender := c.Param("gender")
	if _gender != "0" && _gender != "1" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var query [](struct {
		Id string `json:"_id" bson:"_id"`
		PK string `json:"pubKey" bson:"pubKey"`
	})

	if err := Db.GetCollection("user").
		Find(bson.M{"gender": _gender, "dirty": false}).
		All(&query); err != nil {

		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	c.JSON(http.StatusAccepted, query)
}

func DeclareList(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	var resp models.Declare
	if err := Db.GetById("declare", id).One(&resp); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
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

	c.JSON(http.StatusOK, resp)
}
