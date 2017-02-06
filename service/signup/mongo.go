package main

import (
	"gopkg.in/mgo.v2"
)

type PuppyDb struct {
	S *mgo.Session
}

func MongoConnect() (PuppyDb, error) {
	S, err := mgo.Dial(CfgMgoUrl)
	return PuppyDb{S}, err
}

func (db PuppyDb) GetById(table string, id string) *mgo.Query {
	return db.S.DB("puppy").C(table).FindId(id)
}

func (db PuppyDb) GetCollection(table string) *mgo.Collection {
	return db.S.DB("puppy").C(table)
}
