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

	var y17males, y16males, y15males, y14males, othermales int
	var y17females, y16females, y15females, y14females, otherfemales int

	for _, user := range users {
		if user.Gender == "1" {
			if strings.HasPrefix(user.Id, "17") {
				y17males++
			} else if strings.HasPrefix(user.Id, "16") {
				y16males++
			} else if strings.HasPrefix(user.Id, "15") {
				y15males++
			} else if strings.HasPrefix(user.Id, "14") {
				y14males++
			} else {
				othermales++
			}
		} else {
			if strings.HasPrefix(user.Id, "17") {
				y17females++
			} else if strings.HasPrefix(user.Id, "16") {
				y16females++
			} else if strings.HasPrefix(user.Id, "15") {
				y15females++
			} else if strings.HasPrefix(user.Id, "14") {
				y14females++
			} else {
				otherfemales++
			}
		}
	}

	var y17maleHearts, y16maleHearts, y15maleHearts, y14maleHearts, othermaleHearts int
	var y17femaleHearts, y16femaleHearts, y15femaleHearts, y14femaleHearts, otherfemaleHearts int

	for _, heart := range hearts {
		if heart.Gender == "1" {
			if strings.HasPrefix(heart.Id, "17") {
				y17maleHearts++
			} else if strings.HasPrefix(heart.Id, "16") {
				y16maleHearts++
			} else if strings.HasPrefix(heart.Id, "15") {
				y15maleHearts++
			} else if strings.HasPrefix(heart.Id, "14") {
				y14maleHearts++
			} else {
				othermaleHearts++
			}
		} else {
			if strings.HasPrefix(heart.Id, "17") {
				y17femaleHearts++
			} else if strings.HasPrefix(heart.Id, "16") {
				y16femaleHearts++
			} else if strings.HasPrefix(heart.Id, "15") {
				y15femaleHearts++
			} else if strings.HasPrefix(heart.Id, "14") {
				y14femaleHearts++
			} else {
				otherfemaleHearts++
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users":             len(users),
		"y17males":          y17males,
		"y16males":          y16males,
		"y15males":          y15males,
		"y14males":          y14males,
		"othermales":        othermales,
		"y17females":        y17females,
		"y16females":        y16females,
		"y15females":        y15females,
		"y14females":        y14females,
		"otherfemales":      otherfemales,
		"y17maleHearts":     y17maleHearts,
		"y16maleHearts":     y16maleHearts,
		"y15maleHearts":     y15maleHearts,
		"y14maleHearts":     y14maleHearts,
		"othermaleHearts":   othermaleHearts,
		"y17femaleHearts":   y17femaleHearts,
		"y16femaleHearts":   y16femaleHearts,
		"y15femaleHearts":   y15femaleHearts,
		"y14femaleHearts":   y14femaleHearts,
		"otherfemaleHearts": otherfemaleHearts,
	})
}
