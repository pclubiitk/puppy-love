package config

import (
	"os"
)

var CfgFbKey = os.Getenv("FB_KEY")
var CfgFbSecret = os.Getenv("FB_SECRET")

var EmailUser = os.Getenv("EMAIL_USER")
var EmailPass = os.Getenv("EMAIL_PASS")

var CfgAddr = ":3000"

var osMgoAddr = os.Getenv("MONGO_PORT_27017_TCP_ADDR")
var CfgMgoAddr = func () string {
    if osMgoAddr != "" {
        return osMgoAddr
    } else {
        return "0.0.0.0"
    }
}()

var osMgoPort = os.Getenv("MONGO_PORT_27017_TCP_PORT")
var CfgMgoPort = func () string {
    if osMgoPort != "" {
        return osMgoPort
    } else {
        return "27017"
    }
}()

var CfgMgoUrl = func () string { return "mongodb://" + CfgMgoAddr + ":" + CfgMgoPort + "/puppy" }()
