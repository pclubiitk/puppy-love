package controllers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"
	"github.com/pclubiitk/puppy-love/utils"

	"github.com/gin-gonic/gin"
	"gopkg.in/mgo.v2/bson"
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

	c.JSON(http.StatusAccepted, "Information set up")
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

	c.JSON(http.StatusAccepted, "Information set up")
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

	c.JSON(http.StatusAccepted,
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
	Email   string `json:"email" bson:"email"`
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
		Email:   user.Email,
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
	if err := Db.GetById("user", id).One(&user); err != nil {
		c.JSON(http.StatusNotFound, "Invalid user")
		log.Print(err)
		return
	}

	heartsAndChoices := new(models.HeartsAndChoices)
	if err := c.BindJSON(heartsAndChoices); err != nil {
		c.String(http.StatusBadRequest, "Invalid JSON")
		log.Print(err)
		return
	}

	// First, send the hearts using sendHearts
	if err = sendHearts(user, heartsAndChoices.Hearts); err != nil {
		c.JSON(http.StatusBadRequest, "Failed, probably the request is invalid")
		log.Print(err)
		return
	}

	// Then, declare the choices
	if err = declareStep(user, heartsAndChoices.Tokens); err != nil {
		c.JSON(http.StatusBadRequest, "Failed, probably the request is invalid")
		log.Print(err)
		return
	}

	if _, err := Db.GetById("user", id).
		Apply(user.SetField("submitted", true), &user); err != nil {

		c.AbortWithStatus(http.StatusInternalServerError)
		log.Print(err)
		return
	}

}

func declareStep(user models.User, info models.Declare) error {

	if info.Id != user.Id {
		return errors.New("Invalid session/userId")
	}

	// TODO: fix db name to not be a constant
	if _, err := Db.GetCollection("declare").UpsertId(user.Id, bson.M{
		"t0": info.Token0,
		"t1": info.Token1,
		"t2": info.Token2,
		"t3": info.Token3,
	}); err != nil {
		return err
	}
	return nil
}

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
func sendHearts(user models.User, info []models.GotHeart) error {
	// Check that user isn't voting more than 4
	// ========================================

	userVotes := new([]models.Heart)
	if err := Db.GetCollection("heart").
		Find(bson.M{"roll": user.Id}).
		All(userVotes); err != nil {
		return err
	}

	diffHearts := difference(*userVotes, info)

	log.Print("Earlier count: ", len(*userVotes))
	log.Print("Sent new: ", len(diffHearts))

	if len(diffHearts)+len(*userVotes) > 4 {
		return errors.New("More than allowed votes")
	}

	ctime := uint64(time.Now().UnixNano() / 1000000)

	newHearts := []models.Heart{}
	for _, heart := range diffHearts {
		newHearts = append(newHearts,
			models.Heart{
				Id:     user.Id,
				Gender: heart.GenderOfSender,
				Time:   ctime,
				Value:  heart.Value,
				Data:   heart.Data,
			})
	}

	bulk := Db.GetCollection("heart").Bulk()
	for _, heart := range newHearts {
		bulk.Insert(heart)
	}

	_, err := bulk.Run()

	if err != nil {
		return err
	}
	return nil
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

	c.JSON(http.StatusAccepted, "Saved successfully")
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

	c.JSON(http.StatusAccepted, "Saved successfully")
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

	c.JSON(http.StatusAccepted, "Saved successfully")
}
