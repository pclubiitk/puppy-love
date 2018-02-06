package utils

import (
	"io"
	"log"
	"net/http"
	"os"

	"github.com/milindl/puppy-love/config"
)

func SignupRequest(id string) error {
	response, err := http.Get(config.SignupUrl + "/" + id)
	if err != nil {
		log.Println("Signup service is faulty")
		log.Println(err)
		return err
	} else {
		defer response.Body.Close()
		_, err := io.Copy(os.Stdout, response.Body)
		if err != nil {
			log.Println("Signup service is faulty")
			log.Println(err)
		}
		return err
	}
}
