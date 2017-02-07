package models

import (
	"strings"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// Token => Private communication between parties
	// Value => Value sent to the server
	// Res => Expected hash if there is a match
	Compute struct {
		Id      string `json:"_id" bson:"_id"`
		Person1 string `json:"p1" bson:"p1"`
		Person2 string `json:"p2" bson:"p2"`
		Token1  string `json:"t0" bson:"t0"`
		Token2  string `json:"t1" bson:"t1"`
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
			"t0":    bson.M{},
			"t1":    bson.M{},
			"match": false,
		}},
	}
}

func CheckId(id string, p string) bool {
	chunks := strings.Split(id, "-")
	if len(chunks) != 2 || (chunks[0] != p && chunks[1] != p) ||
		(chunks[0] == chunks[1]) {
		return false
	}
	return true
}

func MakeChange(change bson.M) mgo.Change {
	return mgo.Change{
		Update:    change,
		ReturnNew: true,
	}
}
