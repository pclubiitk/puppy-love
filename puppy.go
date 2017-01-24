// main.go
package main

import (
	"fmt"
	"os"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/router"
	"github.com/pclubiitk/puppy-love/utils"
	"github.com/pclubiitk/puppy-love/utils/config"

	"github.com/kataras/iris"
)

func main() {
	sessionDb := db.RedisSession()

	mongoDb, error := db.MongoConnect()
	if error != nil {
		fmt.Print("[Error] Could not connect to MongoDB")
		os.Exit(1)
	}

	utils.Randinit()

	iris.UseSessionDB(sessionDb)

	router.PuppyRoute(mongoDb)

	iris.Listen(config.CfgAddr)
}
