package models

type (
	Vote struct {
		Time  uint64 `json:"time" bson:"time"`
		Value string `json:"v" bson:"v"`
	}
)
