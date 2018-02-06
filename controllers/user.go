package controllers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/milindl/puppy-love/db"
	"github.com/milindl/puppy-love/models"
	"github.com/milindl/puppy-love/utils"

	"github.com/gin-gonic/gin"
)

var Db db.PuppyDb

func UserDelete(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != "admin" {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	if err := Db.GetCollection("user").DropCollection(); err != nil {
		c.String(http.StatusInternalServerError,
			"Could not delete collection")
		return
	}

	c.String(http.StatusOK, "Deleted user table")
}

func UserNew(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != "admin" {
		c.AbortWithStatus(http.StatusForbidden)
		log.Print("Unauthorized creation attempt by: " + id)
		log.Print(err)
		return
	}

	info := new(models.TypeUserNew)
	if err := c.BindJSON(info); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	user := models.NewUser(info)

	if err := Db.GetCollection("user").Insert(&user); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Information set up")
}

// User's first login
// ------------------
func UserFirst(c *gin.Context) {
	info := new(models.TypeUserFirst)
	if err := c.BindJSON(info); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	user := models.User{}

	// Fetch user
	if err := Db.GetById("user", info.Id).One(&user); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	// If auth code did not match
	if user.AuthC != info.AuthCode || user.AuthC == "" {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	// Edit information
	if _, err := Db.GetById("user", info.Id).
		Apply(user.FirstLogin(info), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	// Remove user's auth token
	if _, err := Db.GetById("user", info.Id).
		Apply(user.SetField("autoCode", ""), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Information set up")
}

// User asking for email
// ---------------------
func UserMail(c *gin.Context) {
	id := c.Param("id")

	type mailData struct {
		Email string `json:"email" bson:"email"`
		AuthC string `json:"authCode" bson:"authCode"`
	}

	u := mailData{}

	if err := Db.GetById("user", id).One(&u); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	if u.AuthC == "" {
		c.String(http.StatusBadRequest, "You have already signed up")
		return
	}

	// Queue this request in service
	err := utils.SignupRequest(id)
	if err != nil {
		c.String(http.StatusInternalServerError, "Something went wrong")
	}

	c.String(http.StatusAccepted,
		fmt.Sprintf("Mail will be sent to %s", u.Email))
}

func MatchGet(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || c.Param("you") != id {
		c.AbortWithStatus(http.StatusForbidden)
		log.Println("Failed on match get: " + id)
		log.Println(err)
		return
	}

	type typeUserGet struct {
		ID      string `json:"_id" bson:"_id"`
		Matches string `json:"matches" bson:"matches"`
	}

	user := new(typeUserGet)

	// Fetch user
	if err := Db.GetById("user", id).One(user); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	c.JSON(http.StatusOK, (*user))
}

// Get user's information
// ----------------------
type typeUserGet struct {
	Id     string `json:"_id" bson:"_id"`
	Name   string `json:"name" bson:"name"`
	Gender string `json:"gender" bson:"gender"`
	Image  string `json:"image" bson:"image"`
	PubK   string `json:"pubKey" bson:"pubKey"`
}

func UserGet(c *gin.Context) {
	id := c.Param("id")

	user := models.User{}

	// Fetch user
	if err := Db.GetById("user", id).One(&user); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	resp := typeUserGet{
		Id:     user.Id,
		Name:   user.Name,
		Gender: user.Gender,
		Image:  user.Image,
		PubK:   user.PubK,
	}

	c.JSON(http.StatusAccepted, resp)
}

// @AUTH Get user's private information on login
// ---------------------------------------

type typeUserLoginGet struct {
	Id      string `json:"_id" bson:"_id"`
	Name    string `json:"name" bson:"name"`
	Gender  string `json:"gender" bson:"gender"`
	Image   string `json:"image" bson:"image"`
	PrivK   string `json:"privKey" bson:"privKey"`
	PubK    string `json:"pubKey" bson:"pubKey"`
	Data    string `json:"data" bson:"data"`
	Submit  bool   `json:"submitted" bson:"submitted"`
	Matches string `json:"matches" bson:"matches"`
}

func UserLoginGet(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil {
		c.AbortWithStatus(http.StatusForbidden)
		log.Println("Failed on login info: " + id)
		log.Println(err)
		return
	}

	user := models.User{}

	// Fetch user
	if err := Db.GetById("user", id).One(&user); err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		log.Print(err)
		return
	}

	resp := typeUserLoginGet{
		Id:      user.Id,
		Name:    user.Name,
		Gender:  user.Gender,
		Image:   user.Image,
		PrivK:   user.PrivK,
		PubK:    user.PubK,
		Data:    user.Data,
		Submit:  user.Submit,
		Matches: user.Matches,
	}

	c.JSON(http.StatusAccepted, resp)
}

// After user submits all choices
// ------------------------------

func UserSubmitTrue(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	user := models.User{}

	if _, err := Db.GetById("user", id).
		Apply(user.SetField("submitted", true), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Submitted successfully")
}

// @AUTH Update user data
// ------------------------------

func UserUpdateData(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	type typeUserUpdateData struct {
		Data string `json:"data"`
	}

	info := new(typeUserUpdateData)
	if err := c.BindJSON(info); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	user := models.User{}

	if _, err := Db.GetById("user", id).
		Apply(user.SetField("data", info.Data), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Saved successfully")
}

// @AUTH Update user image
// ------------------------------

func UserUpdateImage(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	type imgstruct struct {
		Image string `json:"img" bson:"img"`
	}

	user := models.User{}
	info := new(imgstruct)

	if err := c.BindJSON(info); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	if _, err := Db.GetById("user", id).
		Apply(user.SetField("image", info.Image), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Saved successfully")
}

// @AUTH Update user passsave
// ------------------------------

func UserSavePass(c *gin.Context) {
	id, err := SessionId(c)
	if err != nil || id != c.Param("you") {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	type imgstruct struct {
		Pass string `json:"pass" bson:"pass"`
	}

	user := models.User{}
	info := new(imgstruct)

	if err := c.BindJSON(info); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	if _, err := Db.GetById("user", id).
		Apply(user.SetField("savepass", info.Pass), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

	c.String(http.StatusAccepted, "Saved successfully")
}
