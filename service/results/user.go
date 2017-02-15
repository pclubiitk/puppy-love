package main

import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"

type (
	// User represents the structure of our resource
	User struct {
		Id      string `json:"_id" bson:"_id"`
		Name    string `json:"name" bson:"name"`
		Email   string `json:"email" bson:"email"`
		Gender  string `json:"gender" bson:"gender"`
		Image   string `json:"image" bson:"image"`
		Pass    string `json:"passHash" bson:"passHash"`
		PrivK   string `json:"privKey" bson:"privKey"`
		PubK    string `json:"pubKey" bson:"pubKey"`
		AuthC   string `json:"authCode" bson:"authCode"`
		Data    string `json:"data" bson:"data"`
		Submit  bool   `json:"submitted" bson:"submitted"`
		Matches string `json:"matches" bson:"matches"`
		Vote    int    `json:"voted" bson:"voted"`
		Dirty   bool   `json:"dirty" bson:"dirty"`
		SPass   string `json:"savepass" bson:"savepass"`
	}
)

func (u User) MatchedUpdate(info string) mgo.Change {
	return mgo.Change{
		Update: bson.M{"$set": bson.M{
			"matches": info,
		}},
		ReturnNew: true,
	}
}
