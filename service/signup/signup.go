package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
)

type appHandler struct {
	Channel chan string
}

func (ctx appHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx.Channel <- r.URL.Path[:]
	fmt.Fprintf(w, "Welcome, %s!", r.URL.Path[1:])
}

func main() {
	CfgInit()
	mongoDb, error := MongoConnect()
	if error != nil {
		fmt.Print("[Error] Could not connect to MongoDB")
		os.Exit(1)
	}

	// Create channels for services
	signup_channel := make(chan string)
	mailer_channel := make(chan User)
	queue_channel := make(chan string)
	go SignupService(mongoDb, signup_channel, mailer_channel)
	go MailerService(mongoDb, mailer_channel)
	go QueueService(queue_channel, signup_channel)

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

	http.Handle("/", appHandler{queue_channel})
	http.ListenAndServe(":3001", nil)
}
