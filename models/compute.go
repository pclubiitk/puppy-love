package models

import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// User represents the structure of our resource
	Compute struct {
		Id      string `json:"_id" bson:"_id"`
		Person1 string `json:"p1" bson:"p1"`
		Person2 string `json:"p2" bson:"p2"`
		Token1  string `json:"t1" bson:"t1"`
		Token2  string `json:"t2" bson:"t2"`
		Res1    string `json:"r1" bson:"r1"`
		Res2    string `json:"r2" bson:"r2"`
		Match   bool   `json:"match" bson:"match"`
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
			"t1":    "",
			"t2":    "",
			"r1":    "",
			"r2":    "",
			"match": false,
		}},
	}
}
