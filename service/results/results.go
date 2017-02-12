package main

import (
	"fmt"
	"gopkg.in/mgo.v2/bson"
	"log"
	"os"
	"sort"
)

type Declare struct {
	Id     string `json:"_id" bson:"_id"`
	Token0 string `json:"t0" bson:"t0"`
	Token1 string `json:"t1" bson:"t1"`
	Token2 string `json:"t2" bson:"t2"`
	Token3 string `json:"t3" bson:"t3"`
}

type Flat struct {
	Id    string `json:"_id" bson:"_id"`
	Token string `json:"t" bson:"t"`
}

type ByValue []Flat

func (b ByValue) Len() int {
	return len(b)
}
func (b ByValue) Swap(i, j int) {
	b[i], b[j] = b[j], b[i]
}
func (b ByValue) Less(i, j int) bool {
	return b[i].Token < b[j].Token
}

func main() {
	CfgInit()
	db, error := MongoConnect()
	if error != nil {
		log.Print("ERROR: Could not connect to MongoDB")
		os.Exit(1)
	}

	var decs []Declare
	collection := db.GetCollection("declare")
	err := collection.Find(bson.M{}).All(&decs)
	if err != nil {
		log.Println("ERROR: Results cannot fetch declare list: ")
		log.Println(err)
		return
	}

	var flat []Flat
	for _, fe := range decs {
		if fe.Token0 != "" {
			flat = append(flat, Flat{
				Id:    fe.Id,
				Token: fe.Token0,
			})
		}
		if fe.Token1 != "" {
			flat = append(flat, Flat{
				Id:    fe.Id,
				Token: fe.Token1,
			})
		}
		if fe.Token2 != "" {
			flat = append(flat, Flat{
				Id:    fe.Id,
				Token: fe.Token2,
			})
		}
		if fe.Token3 != "" {
			flat = append(flat, Flat{
				Id:    fe.Id,
				Token: fe.Token3,
			})
		}
	}

	sort.Sort(ByValue(flat))
	fmt.Println(flat)

	for i := range flat {
		if i == 0 {
			continue
		}

		if flat[i].Token == flat[i-1].Token {
			fmt.Println("Matched:", flat[i].Id, "and", flat[i-1].Id)
		}
	}
}
