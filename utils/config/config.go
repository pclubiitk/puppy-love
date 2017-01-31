package config

import (
	"os"
)

var CfgFbKey = os.Getenv("FB_KEY")
var CfgFbSecret = os.Getenv("FB_SECRET")

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")

var CfgAddr = ":3000"

var CfgMgoAddr = "0.0.0.0"
var CfgMgoPort = "27017"
if os.Getenv("MONGO_PORT_27017_TCP_ADDR") != "" && os.Getenv("MONGO_PORT_27017_TCP_PORT") {
	CfgMgoAddr = os.Getenv("MONGO_PORT_27017_TCP_ADDR")
	CfgMgoPort = os.Getenv("MONGO_PORT_27017_TCP_PORT")
}
CfgMgoUrl = "mongodb://" + CfgMgoAddr + ":" + CfgMgoPort + "/puppy"
