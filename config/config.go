package config

import (
	"log"
	"os"
)

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")

var CfgAddr = ":3000"

var CfgMgoUrl = "mongodb://0.0.0.0:27017/puppy"

var CfgRedisUrl = "0.0.0.0:6379"

var SignupUrl string = "http://0.0.0.0:3001"

func CfgInit() {
	var port string
	var addr string

	// Signup URL
	port = os.Getenv("SIGNUP_TCP_PORT")
	addr = os.Getenv("SIGNUP_TCP_ADDR")
	if port != "" && addr != "" {
		SignupUrl = addr + ":" + port
	}

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

	// Redis ENV variables
	port = os.Getenv("REDIS_PORT")
	addr = os.Getenv("REDIS_ADDR")
	if port != "" && addr != "" {
		CfgRedisUrl = addr + ":" + port
	}
}
