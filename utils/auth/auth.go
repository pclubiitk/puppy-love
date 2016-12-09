package auth

import (
	"time"

	"github.com/sakshamsharma/puppy-love/utils/config"

	"github.com/iris-contrib/middleware/basicauth"
	"github.com/iris-contrib/plugin/oauth"
	"github.com/kataras/iris"
)

// register your auth via configs, providers with non-empty
// values will be registered to goth automatically by Iris
var configs = oauth.Config{
	Path: "/auth", //defaults to /oauth

	FacebookKey:    config.CfgFbKey,
	FacebookSecret: config.CfgFbSecret,
	FacebookName:   "facebook", // defaults to facebook
}

var authConfig = basicauth.Config{
	Users:      map[string]string{"myusername": "mypassword", "mySecondusername": "mySecondpassword"},
	Realm:      "Authorization Required", // if you don't set it it's "Authorization Required"
	ContextKey: "mycustomkey",            // if you don't set it it's "user"
	Expires:    time.Duration(30) * time.Minute,
}

func PuppyAuth() {
	// create the plugin with our configs
	// authentication := oauth.New(configs)
	authentication := basicauth.New(authConfig)

	// register the plugin to iris
	iris.Plugins.Add(authentication)

	iris.Use(authentication)
}
