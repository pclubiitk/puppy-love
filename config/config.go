package config

import (
	"os"
)

var (
	EmailUser           = os.Getenv("EMAIL_USER")
	EmailPass           = os.Getenv("EMAIL_PASS")
	CfgAdminPass        = "passhash"
	CfgAddr             = ":3000"
	CfgMgoUrl           = "mongodb://0.0.0.0:27017/puppy"
	CfgRedisUrl         = "0.0.0.0:6379"
	SignupUrl    string = "http://0.0.0.0:3001"
)

func CfgInit() {
	var port string
	var addr string

	// Signup URL
	port = os.Getenv("SIGNUP_PORT_3001_TCP_PORT")
	addr = os.Getenv("SIGNUP_PORT_3001_TCP_ADDR")
	if port != "" && addr != "" {
		SignupUrl = "http://" + addr + ":" + port
	}

	// Mongo ENV variables
	port = os.Getenv("MONGO_PORT_27017_TCP_PORT")
	addr = os.Getenv("MONGO_PORT_27017_TCP_ADDR")
	if port != "" && addr != "" {
		CfgMgoUrl = "mongodb://" + addr + ":" + port + "/puppy"
	}

	// Redis ENV variables
	port = os.Getenv("REDIS_PORT_6379_TCP_PORT")
	addr = os.Getenv("REDIS_PORT_6379_TCP_ADDR")
	if port != "" && addr != "" {
		CfgRedisUrl = addr + ":" + port
	}

	// Admin pass
	pass := os.Getenv("ADMIN_PASS")
	if pass != "" {
		CfgAdminPass = pass
	}
}
