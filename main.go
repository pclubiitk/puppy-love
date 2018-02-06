package main

import (
	"fmt"
	"os"

	"github.com/milindl/puppy-love/config"
	"github.com/milindl/puppy-love/db"
	"github.com/milindl/puppy-love/router"
	"github.com/milindl/puppy-love/utils"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func executeFirst(c *gin.Context) {
	// fmt.Println(string(ctx.Path()[:]))
	// ctx.Next()
}

func main() {
	config.CfgInit()

	mongoDb, error := db.MongoConnect()
	if error != nil {
		fmt.Print("[Error] Could not connect to MongoDB")
		fmt.Print("[Error] " + config.CfgMgoUrl)
		fmt.Print(os.Environ())
		os.Exit(1)
	}

	utils.Randinit()

	// set up session db
	store := sessions.NewCookieStore([]byte("secret"))

	// iris.Config.Gzip = true
	r := gin.Default()
	r.Use(sessions.Sessions("mysession", store))
	router.PuppyRoute(r, mongoDb)
	r.Run(config.CfgAddr)
}
