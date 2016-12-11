package models

import ()

type (
	// User represents the structure of our resource
	Compute struct {
		Id      string `json:"_id" bson:"_id"`
		Person1 string `json:"p1" bson:"p1"`
		Person2 string `json:"p2" bson:"p2"`
		Token1  string `json:"tk" bson:"tk"`
		Token2  string `json:"tk" bson:"tk"`
		Res1    string `json:"tk" bson:"tk"`
		Res2    string `json:"tk" bson:"tk"`
		Match   bool   `json:"match" bson:"match"`
	}
)
