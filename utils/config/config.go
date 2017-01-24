package config

import (
	"os"
)

var CfgFbKey = os.Getenv("FB_KEY")
var CfgFbSecret = os.Getenv("FB_SECRET")

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")

var CfgAddr = ":3000"

var CfgMgoUrl = "mongodb://0.0.0.0:27017/puppy"
