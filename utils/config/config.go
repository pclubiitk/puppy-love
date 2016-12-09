package config

import (
	"os"
)

var CfgFbKey = os.Getenv("FB_KEY")
var CfgFbSecret = os.Getenv("FB_SECRET")

var CfgAddr = ":3000"

var CfgMgoUrl = "mongodb://0.0.0.0:27017/puppy"
