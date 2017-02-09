package main

import (
	"log"
	"os"
)

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")
var EmailHost = os.Getenv("EMAIL_HOST")

var CfgAddr = ":3000"

var CfgMgoUrl = "mongodb://0.0.0.0:27017/puppy"

func CfgInit() {
	var port string
	var addr string

	// Email ENV variables
	if EmailUser == "" || EmailPass == "" {
		log.Println("WARNING: Email variables are not in scope")
	}

	if EmailHost == "" {
		log.Println("No email host")
		EmailHost = "smtp.gmail.com"
	}

	// Mongo ENV variables
	port = os.Getenv("MONGO_PORT_27017_TCP_PORT")
	addr = os.Getenv("MONGO_PORT_27017_TCP_ADDR")
	if port != "" && addr != "" {
		CfgMgoUrl = "mongodb://" + addr + ":" + port + "/puppy"
	}
}
