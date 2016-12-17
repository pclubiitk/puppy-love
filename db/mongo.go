package db

import (
	"github.com/pclubiitk/puppy-love/utils/config"

	"gopkg.in/mgo.v2"
)

type PuppyDb struct {
	S *mgo.Session
}

func MongoConnect() (PuppyDb, error) {
	S, err := mgo.Dial(config.CfgMgoUrl)
	return PuppyDb{S}, err
}

func (db PuppyDb) GetById(table string, id string) *mgo.Query {
	return db.S.DB("puppy").C(table).FindId(id)
}

func (db PuppyDb) GetCollection(table string) *mgo.Collection {
	return db.S.DB("puppy").C(table)
}
