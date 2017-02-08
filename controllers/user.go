package controllers

import (
	"log"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"
	"github.com/pclubiitk/puppy-love/utils"

	"github.com/kataras/iris"
)

// @AUTH @Admin Drop users table
// ----------------------------------------------------
type UserDelete struct {
	Db db.PuppyDb
}

func (m UserDelete) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	if err := m.Db.GetCollection("user").DropCollection(); err != nil {
		ctx.Text(iris.StatusInternalServerError, "Could not delete collection")
		return
	}

	ctx.JSON(iris.StatusOK, "Deleted user table")
}

// @AUTH @Admin Create new user
// -------------------------------
type UserNew struct {
	Db db.PuppyDb
}

func (m UserNew) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil || id != "admin" {
		ctx.EmitError(iris.StatusForbidden)
		log.Print("Unauthorized creation attempt by: " + id)
		log.Print(err)
		return
	}

	info := new(models.TypeUserNew)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	user := models.NewUser(info)

	if err := m.Db.GetCollection("user").Insert(&user); err != nil {
		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Information set up")
}

// User's first login
// ------------------
type UserFirst struct {
	Db db.PuppyDb
}

func (m UserFirst) Serve(ctx *iris.Context) {
	info := new(models.TypeUserFirst)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	user := models.User{}

	// Fetch user
	if err := m.Db.GetById("user", info.Id).One(&user); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	// If auth code did not match
	if user.AuthC != info.AuthCode || user.AuthC == "" {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	// Edit information
	if _, err := m.Db.GetById("user", info.Id).
		Apply(user.FirstLogin(info), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	// Remove user's auth token
	if _, err := m.Db.GetById("user", info.Id).
		Apply(user.RemoveAuthCode(), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Information set up")
}

type UserMail struct {
	Db db.PuppyDb
}

// User asking for email
// ---------------------
func (m UserMail) Serve(ctx *iris.Context) {
	id := ctx.Param("id")

	type mailData struct {
		Email string `json:"email" bson:"email"`
		AuthC string `json:"authCode" bson:"authCode"`
	}

	u := mailData{}

	if err := m.Db.GetById("user", id).One(&u); err != nil {
		ctx.EmitError(iris.StatusNotFound)
		log.Print(err)
		return
	}

	if u.AuthC == "" {
		ctx.Error("You have already signed up", iris.StatusBadRequest)
		return
	}

	// Queue this request in service
	err := utils.SignupRequest(id)
	if err != nil {
		ctx.Error("Something went wrong", iris.StatusInternalServerError)
	}

	ctx.JSON(iris.StatusAccepted, "Mail will be sent to "+u.Email)
}

// Get user's information
// ----------------------
type UserGet struct {
	Db db.PuppyDb
}

type typeUserGet struct {
	Id     string `json:"_id" bson:"_id"`
	Name   string `json:"name" bson:"name"`
	Gender string `json:"gender" bson:"gender"`
	Image  string `json:"image" bson:"image"`
	PubK   string `json:"pubKey" bson:"pubKey"`
}

func (m UserGet) Serve(ctx *iris.Context) {
	id := ctx.Param("id")

	user := models.User{}

	// Fetch user
	if err := m.Db.GetById("user", id).One(&user); err != nil {
		ctx.EmitError(iris.StatusNotFound)
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

	ctx.JSON(iris.StatusAccepted, resp)
}

// @AUTH Get user's private information on login
// ---------------------------------------
type UserLoginGet struct {
	Db db.PuppyDb
}

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

func (m UserLoginGet) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	user := models.User{}

	// Fetch user
	if err := m.Db.GetById("user", id).One(&user); err != nil {
		ctx.EmitError(iris.StatusNotFound)
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

	ctx.JSON(iris.StatusAccepted, resp)
}

// After user submits all choices
// ------------------------------
type UserSubmitTrue struct {
	Db db.PuppyDb
}

func (m UserSubmitTrue) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	user := models.User{}

	if _, err := m.Db.GetById("user", id).
		Apply(user.HasSubmitted(), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Submitted successfully")
}

// @AUTH Update user data
// ------------------------------
type UserUpdateData struct {
	Db db.PuppyDb
}

func (m UserUpdateData) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	info := new(models.TypeUserUpdateData)
	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	user := models.User{}

	if _, err := m.Db.GetById("user", id).
		Apply(user.UpdateData(info), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Saved successfully")
}

// @AUTH Update user image
// ------------------------------
type UserUpdateImage struct {
	Db db.PuppyDb
}

func (m UserUpdateImage) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type imgstruct struct {
		Image string `json:"img" bson:"img"`
	}

	user := models.User{}
	info := new(imgstruct)

	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	if _, err := m.Db.GetById("user", id).
		Apply(user.UpdateImage(info.Image), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Saved successfully")
}

// @AUTH Update user passsave
// ------------------------------
type UserSavePass struct {
	Db db.PuppyDb
}

func (m UserSavePass) Serve(ctx *iris.Context) {
	id, err := SessionId(ctx)
	if err != nil {
		ctx.EmitError(iris.StatusForbidden)
		return
	}

	type imgstruct struct {
		Pass string `json:"pass" bson:"pass"`
	}

	user := models.User{}
	info := new(imgstruct)

	if err := ctx.ReadJSON(info); err != nil {
		ctx.EmitError(iris.StatusBadRequest)
		return
	}

	if _, err := m.Db.GetById("user", id).
		Apply(user.SavePass(info.Pass), &user); err != nil {

		ctx.EmitError(iris.StatusInternalServerError)
		log.Print(err)
		return
	}

	ctx.JSON(iris.StatusAccepted, "Saved successfully")
}
