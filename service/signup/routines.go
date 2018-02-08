package main

import (
	"log"
	"net/smtp"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func MarkNotDirtyAlt(u User) mgo.Change {
	return mgo.Change{
		Update: bson.M{"$set": bson.M{
			"dirty": false,
		}},
		ReturnNew: true,
	}
}

func QueueService(listen_channel chan string, signup_channel chan string) {
	for request := range listen_channel {
		go func(request string) {
			signup_channel <- request[1:]
		}(request)
	}
}

func SignupService(
	Db PuppyDb,
	signup_channel chan string,
	mail_channel chan User) {

	for id := range signup_channel {
		log.Println("Signing up: " + id)

		u := User{}

		// If no such user
		if err := Db.GetById("user", id).One(&u); err != nil {
			log.Print(err)
			continue
		}

		// If user has already been computed
		if u.Dirty == false {
			log.Print("User ", id, " is not dirty. Skipping.")

			// Mailing should be async
			go func(user User) {
				log.Println("Sending mail now")
				mail_channel <- user
			}(u)

			continue
		}

		// Mark user as not dirty
		if _, err := Db.GetById("user", id).
			Apply(MarkNotDirtyAlt(u), &u); err != nil {

			log.Println("ERROR: Could not mark ", id, " as not dirty")
			log.Println(err)
		}

		// Mailing should be async
		go func(user User) {
			mail_channel <- user
			log.Println("Sending mail now")
		}(u)
	}
}

func MailerService(Db PuppyDb, mail_channel chan User) {
	mailCounter := 0
	auth := smtp.PlainAuth("", EmailUser, EmailPass,
		EmailHost)

	for u := range mail_channel {
		log.Println("Setting up smtp")

		to := []string{u.Email + "@iitk.ac.in"}
		msg := []byte("To: " + u.Email + "@iitk.ac.in" + "\r\n" +
			"Subject: Puppy-Love authentication code\r\n" +
			"\r\n" +
			"Use this token while signing up, and don't share it with anyone.\n" +
			"Token: " + u.AuthC + "\n" +
			".\r\n")
		err := smtp.SendMail(EmailHost+":"+EmailPort, auth,
			EmailUser, to, msg)

		if err != nil {
			log.Println("ERROR: while mailing user ", u.Email, " ", u.Id)
			log.Println(err)
		} else {
			mailCounter += 1
			log.Println("Mailed " + u.Id)
			log.Println("Mails sent since inception", mailCounter)
		}
	}
}
