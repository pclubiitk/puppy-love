// main.go
package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/pclubiitk/puppy-love/db"
	"github.com/pclubiitk/puppy-love/models"
	"github.com/pclubiitk/puppy-love/router"
	"github.com/pclubiitk/puppy-love/service"
	"github.com/pclubiitk/puppy-love/utils"
	"github.com/pclubiitk/puppy-love/utils/config"

	"github.com/kataras/iris"
)

func executeFirst(ctx *iris.Context) {
	fmt.Println(string(ctx.Path()[:]))
	ctx.Next()
}

func main() {
	sessionDb := db.RedisSession()

	mongoDb, error := db.MongoConnect()
	if error != nil {
		fmt.Print("[Error] Could not connect to MongoDB")
		os.Exit(1)
	}

	utils.Randinit()

	iris.UseSessionDB(sessionDb)
	iris.Config.Gzip = true
	iris.UseFunc(executeFirst)

	// Create channels for services
	signup_channel := make(chan string)
	mailer_channel := make(chan models.User)
	queue_channel := make(chan string)
	go service.SignupService(mongoDb, signup_channel, mailer_channel)
	go service.MailerService(mongoDb, mailer_channel)
	go service.QueueService(queue_channel, signup_channel)

	// For clean exit
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for sig := range c {
			log.Printf("Captured %v, exiting..", sig)
			close(signup_channel)
			close(mailer_channel)
			close(queue_channel)
			// TODO exit mongo and redis too
			os.Exit(0)
		}
	}()

	router.PuppyRoute(mongoDb, queue_channel)

	iris.Listen(config.CfgAddr)
}
