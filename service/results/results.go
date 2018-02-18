package main

import (
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	"gopkg.in/mgo.v2/bson"
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

func AddMatch(toAdd string, prev string) string {
	if prev == "" {
		return toAdd
	}

	return prev + " " + toAdd
}

func main() {
	CfgInit()
	log.Println("Computing for table:", CfgTable)
	db, error := MongoConnect()
	if error != nil {
		log.Print("ERROR: Could not connect to MongoDB")
		os.Exit(1)
	}

	var decs []Declare
	collection := db.GetCollection(CfgTable)
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

	for i := range flat {
		fmt.Println(flat[i].Token, flat[i].Id)
	}

	fmt.Println()

	var emails = []string{}
	var maleMale, femaleFemale, crossGender int
	var matches string

	for i := range flat {
		if i == 0 {
			continue
		}

		if flat[i].Token == flat[i-1].Token {
			fmt.Println("Matched:", flat[i].Id, "and", flat[i-1].Id)

			u1 := User{}
			u2 := User{}
			if err := db.GetById("user", flat[i].Id).One(&u1); err != nil {
				fmt.Println("Error")
				fmt.Println(err)
				continue
			}
			if err := db.GetById("user", flat[i-1].Id).One(&u2); err != nil {
				fmt.Println("Error")
				fmt.Println(err)
				continue
			}

			fmt.Println("Names: ", u1.Name, "and", u2.Name)
			fmt.Println("Emails: ", u1.Email, "and", u2.Email)
			fmt.Println("Genders: ", u1.Gender, u2.Gender)
			fmt.Println("Prev matches: ", u1.Matches, "; ", u2.Matches)

			// EXTRA STUFF, NOT NEEDED
			// If you want to verify some information
			// As an example here, I match the hash, in the hypothetical scenario
			// that the hash can be computed on the server

			//fmt.Println("Hash: ", flat[i].Token)
			//pairId := ""
			//if flat[i].Id > flat[i-1].Id {
			//pairId = flat[i].Id + "-" + flat[i-1].Id
			//} else {
			//pairId = flat[i-1].Id + "-" + flat[i].Id
			//}

			//out, _ := exec.Command("/bin/bash", "-c", "echo -n '"+pairId+"' | sha256sum").Output()
			//h2 := strings.Fields(string(out[:]))[0]
			//fmt.Println("Has2: ", h2)
			//if h2 != flat[i].Token {
			//fmt.Println("ERROR")
			//continue
			//} else {
			//cnt = cnt + 1
			//}

			// if u1.Gender == u2.Gender {
			// 	fmt.Println("SAME GENDER")
			// 	fmt.Println("ERROR")
			// 	continue
			// }

			if u1.Gender != u2.Gender {
				crossGender++
			} else if u1.Gender == "1" {
				maleMale++
			} else {
				femaleFemale++
			}

			matches += fmt.Sprintf("%s(%s) <-> %s(%s)\n", u1.Name, u1.Id, u2.Name, u2.Id)

			emails = append(emails, u1.Email)
			emails = append(emails, u2.Email)

			var b bool
			var ans string

			p1matches := strings.Fields(u1.Matches)
			b = false
			for _, match := range p1matches {
				if match == u2.Id {
					b = true
					break
				}
			}
			if !b {
				fmt.Println(u2.Name, "is not in matches of", u1.Name, ". Add?")
				// _, _ = fmt.Scanf("%s", &ans)
				ans = "y"
				if ans == "y" {
					fmt.Println("Adding", AddMatch(u2.Id, u1.Matches))

					if _, err := db.GetById("user", u1.Id).
						Apply(u1.MatchedUpdate(AddMatch(u2.Id, u1.Matches)), &u1); err != nil {
						fmt.Println(err)
					}

				} else {
					fmt.Println("You said no")
				}
			}

			p2matches := strings.Fields(u2.Matches)
			b = false
			for _, match := range p2matches {
				if match == u1.Id {
					b = true
					break
				}
			}
			if !b {
				fmt.Println(u1.Name, "is not in matches of", u2.Name, ". Add?")
				// _, _ = fmt.Scanf("%s", &ans)
				ans = "y"
				if ans == "y" {
					fmt.Println("Adding", AddMatch(u1.Id, u2.Matches))

					if _, err := db.GetById("user", u2.Id).
						Apply(u2.MatchedUpdate(AddMatch(u1.Id, u2.Matches)), &u2); err != nil {
						fmt.Println(err)
					}

				} else {
					fmt.Println("You said no")
				}
			}
			fmt.Println("**********************************************")
		}
	}
	fmt.Println()
	for _, mail := range emails {
		fmt.Println(mail)
	}
	fmt.Println(matches)
	fmt.Println("Total", maleMale+femaleFemale+crossGender, "matches")
	fmt.Println("Male-Male matches: ", maleMale)
	fmt.Println("Female-Female matches: ", femaleFemale)
	fmt.Println("Male-Female matches: ", crossGender)
	fmt.Println()
}
