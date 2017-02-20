package main

import (
	"gopkg.in/mgo.v2/bson"
)

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
	}
)

type PairUpsert struct {
	Selector bson.M
	Change   bson.M
}

func UpsertEntry(id1 string, id2 string) PairUpsert {
	itemId := id1 + "-" + id2
	p1 := id1
	p2 := id2
	if id1 > id2 {
		itemId = id2 + "-" + id1
		p1 = id2
		p2 = id1
	}

	_selector := bson.M{"_id": itemId}

	return PairUpsert{
		Selector: _selector,
		Change: bson.M{"$setOnInsert": bson.M{
			"_id":   itemId,
			"p1":    p1,
			"p2":    p2,
			"t0":    bson.M{},
			"t1":    bson.M{},
			"r0":    "",
			"r1":    "",
			"v0":    "",
			"v1":    "",
			"match": false,
		}},
	}
}

func NewDeclareTable(id string) PairUpsert {
	_selector := bson.M{"_id": id}

	return PairUpsert{
		Selector: _selector,
		Change: bson.M{"$setOnInsert": bson.M{
			"_id": id,
			"t0":  "",
			"t1":  "",
			"t2":  "",
			"t3":  "",
		}},
	}
}
