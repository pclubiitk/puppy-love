package models

type (
	Heart struct {
		Id     string `json:"roll" bson:"roll"`
		Gender string `json:"gender" bson:"gender"`
		Time   uint64 `json:"time" bson:"time"`
		Value  string `json:"v" bson:"v"`
		Data   string `json:"data" bson:"data"`
	}

	GotHeart struct {
		Value          string `json:"v" bson:"v"`
		Data           string `json:"data" bson:"data"`
		GenderOfSender string `json:"genderOfSender" bson:"genderOfSender"`
	}
)
