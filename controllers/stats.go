package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pclubiitk/puppy-love/models"
	"gopkg.in/mgo.v2/bson"
)

// GetStats returns useful statistics
func GetStats(c *gin.Context) {
	var users []models.User
	var hearts []models.Heart
	if err := Db.GetCollection("user").Find(bson.M{"dirty": false}).All(&users); err != nil {
		c.String(http.StatusInternalServerError, "Could not get database info")
		return
	}
	if err := Db.GetCollection("heart").Find(nil).All(&hearts); err != nil {
		c.String(http.StatusInternalServerError, "Could not get database info")
		return
	}

	var y18males, y17males, y16males, y15males, othermales int
	var y18females, y17females, y16females, y15females, otherfemales int

	for _, user := range users {
		if user.Gender == "1" {
			if strings.HasPrefix(user.Id, "18") {
				y18males++
			} else if strings.HasPrefix(user.Id, "17") {
				y17males++
			} else if strings.HasPrefix(user.Id, "16") {
				y16males++
			} else if strings.HasPrefix(user.Id, "15") {
				y15males++
			} else {
				othermales++
			}
		} else {
			if strings.HasPrefix(user.Id, "18") {
				y18females++
			} else if strings.HasPrefix(user.Id, "17") {
				y17females++
			} else if strings.HasPrefix(user.Id, "16") {
				y16females++
			} else if strings.HasPrefix(user.Id, "15") {
				y15females++
			} else {
				otherfemales++
			}
		}
	}

	var y18maleHearts, y17maleHearts, y16maleHearts, y15maleHearts, othermaleHearts int
	var y18femaleHearts, y17femaleHearts, y16femaleHearts, y15femaleHearts, otherfemaleHearts int

	for _, heart := range hearts {
		if heart.Gender == "1" {
			if strings.HasPrefix(heart.Id, "18") {
				y18maleHearts++
			} else if strings.HasPrefix(heart.Id, "17") {
				y17maleHearts++
			} else if strings.HasPrefix(heart.Id, "16") {
				y16maleHearts++
			} else if strings.HasPrefix(heart.Id, "15") {
				y15maleHearts++
			} else {
				othermaleHearts++
			}
		} else {
			if strings.HasPrefix(heart.Id, "18") {
				y18femaleHearts++
			} else if strings.HasPrefix(heart.Id, "17") {
				y17femaleHearts++
			} else if strings.HasPrefix(heart.Id, "16") {
				y16femaleHearts++
			} else if strings.HasPrefix(heart.Id, "15") {
				y15femaleHearts++
			} else {
				otherfemaleHearts++
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users":             len(users),
		"y18males":          y18males,
		"y17males":          y17males,
		"y16males":          y16males,
		"y15males":          y15males,
		"othermales":        othermales,
		"y18females":        y18females,
		"y17females":        y17females,
		"y16females":        y16females,
		"y15females":        y15females,
		"otherfemales":      otherfemales,
		"y18maleHearts":     y18maleHearts,
		"y17maleHearts":     y17maleHearts,
		"y16maleHearts":     y16maleHearts,
		"y15maleHearts":     y15maleHearts,
		"othermaleHearts":   othermaleHearts,
		"y18femaleHearts":   y18femaleHearts,
		"y17femaleHearts":   y17femaleHearts,
		"y16femaleHearts":   y16femaleHearts,
		"y15femaleHearts":   y15femaleHearts,
		"otherfemaleHearts": otherfemaleHearts,
	})
}
