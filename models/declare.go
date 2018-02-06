package models

import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	Declare struct {
		Id     string `json:"_id" bson:"_id"`
		Token0 string `json:"t0" bson:"t0"`
		Token1 string `json:"t1" bson:"t1"`
		Token2 string `json:"t2" bson:"t2"`
		Token3 string `json:"t3" bson:"t3"`
	}
	PairUpsert struct {
		Selector bson.M
		Change   bson.M
	}
)

// Create table update object for token table
func UpsertDeclareTable(d *Declare) mgo.Change {
	return mgo.Change{
		Update: bson.M{"$set": bson.M{
			"t0": d.Token0,
			"t1": d.Token1,
			"t2": d.Token2,
			"t3": d.Token3,
		}},
		ReturnNew: true,
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
