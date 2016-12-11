package router

import (
	"github.com/sakshamsharma/puppy-love/controllers"
	"github.com/sakshamsharma/puppy-love/db"

	"github.com/kataras/iris"
)

func PuppyRoute(db db.PuppyDb) {

	iris.Get("/", func(ctx *iris.Context) {
		ctx.JSON(iris.StatusAccepted, "Hello from the other side!")
	})

	// User administration
	uPre := "/users"
	iris.Handle("POST", uPre+"/new", controllers.UserNew{db})
	iris.Handle("POST", uPre+"/login/first", controllers.UserFirst{db})
	iris.Handle("POST", uPre+"/data/update", controllers.UserUpdateData{db})

	iris.Handle("GET", uPre+"/data/info", controllers.UserLoginGet{db})
	iris.Handle("GET", uPre+"/get/:id", controllers.UserGet{db})

	iris.Get(uPre+"/mail/:id", controllers.UserMail)

	// Listing users
	lPre := "/list"
	iris.Handle("GET", lPre+"/gender/:gender", controllers.ListAll{db})

	// Compute
	cPre := "/compute"
	iris.Handle("POST", cPre+"/new/bulk", controllers.ComputeNewBulk{db})

	// Session administration
	sesPre := "/session"
	iris.Handle("POST", sesPre+"/login", controllers.SessionLogin{db})
	iris.Get(sesPre+"/logout", controllers.SessionLogout)
}
