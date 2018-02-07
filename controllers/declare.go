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
