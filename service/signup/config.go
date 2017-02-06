package main

import (
	"log"
	"os"
)

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")

var CfgAddr = ":3000"

var CfgMgoUrl = "mongodb://0.0.0.0:27017/puppy"

func CfgInit() {
	var port string
	var addr string

	// Email ENV variables
	if EmailUser == "" || EmailPass == "" {
		log.Println("WARNING: Email variables are not in scope")
	}

	// Mongo ENV variables
	port = os.Getenv("MONGO_PORT")
	addr = os.Getenv("MONGO_ADDR")
	if port != "" && addr != "" {
		CfgMgoUrl = "mongodb://" + addr + ":" + port + "/puppy"
	}
}
