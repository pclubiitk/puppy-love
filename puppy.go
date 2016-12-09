// main.go
package main

import (
	"fmt"
	"os"

	"github.com/sakshamsharma/puppy-love/db"
	"github.com/sakshamsharma/puppy-love/router"
	"github.com/sakshamsharma/puppy-love/utils/config"

	"github.com/kataras/iris"
)

func main() {
	sessionDb := db.RedisSession()

	mongoDb, error := db.MongoConnect()
	if error != nil {
		fmt.Print("[Error] Could not connect to MongoDB")
		os.Exit(1)
	}

	iris.UseSessionDB(sessionDb)

	router.PuppyRoute(mongoDb)

	iris.Listen(config.CfgAddr)
}
