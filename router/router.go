package router

import (
	"github.com/pclubiitk/puppy-love/controllers"
	"github.com/pclubiitk/puppy-love/db"

	"github.com/kataras/iris"
)

func PuppyRoute(db db.PuppyDb) {

	iris.Get("/", func(ctx *iris.Context) {
		ctx.JSON(iris.StatusAccepted, "Hello from the other side!")
	})

	// User administration
	uPre := "/users"
	iris.Handle("POST", uPre+"/login/first", controllers.UserFirst{db})
	iris.Handle("POST", uPre+"/data/update/:you", controllers.UserUpdateData{db})
	iris.Handle("POST", uPre+"/data/submit/:you", controllers.UserSubmitTrue{db})
	iris.Handle("POST", uPre+"/image/update/:you", controllers.UserUpdateImage{db})
	iris.Handle("POST", uPre+"/pass/update/:you", controllers.UserSavePass{db})
	iris.Handle("POST", uPre+"/name/update/:id", controllers.UserUpdateName{db})

	iris.Handle("GET", uPre+"/data/info", controllers.UserLoginGet{db})
	iris.Handle("GET", uPre+"/data/match/:you", controllers.MatchGet{db})
	iris.Handle("GET", uPre+"/get/:id", controllers.UserGet{db})
	iris.Handle("GET", uPre+"/mail/:id", controllers.UserMail{db})

	// Listing users
	lPre := "/list"
	iris.Handle("GET", lPre+"/gender/:gender", controllers.ListAll{db})
	iris.Handle("GET", lPre+"/compute", controllers.ComputeList{db})
	iris.Handle("GET", lPre+"/pubkey/:gender", controllers.PubkeyList{db})
	iris.Handle("GET", lPre+"/declare", controllers.DeclareList{db})

	// Compute
	cPre := "/compute"
	iris.Handle("POST", cPre+"/token", controllers.ComputeStep{db, 0})

	// Declare
	iris.Handle("POST", "/declare/choices", controllers.DeclareStep{db, "declare"})
	iris.Handle("POST", "/declare/dec1", controllers.DeclareStep{db, "declare"})
	iris.Handle("POST", "/declare/dec2", controllers.DeclareStep{db, "declare2"})
	iris.Handle("POST", "/declare/dec3", controllers.DeclareStep{db, "declare3"})

	// Votes
	iris.Handle("GET", "/votes/get/:time/:you", controllers.VoteGet{db})
	iris.Handle("GET", "/hearts/get/:time/:gen/:you", controllers.HeartGet{db})
	iris.Handle("POST", "/votes/send/:you", controllers.VoteSend{db})
	iris.Handle("POST", "/hearts/send/:you", controllers.GotHeart{db})

	// Session administration
	sesPre := "/session"
	iris.Handle("POST", sesPre+"/login", controllers.SessionLogin{db})
	iris.Get(sesPre+"/logout", controllers.SessionLogout)

	// Admin
	aPre := "/admin"
	iris.Handle("GET", aPre+"/compute/drop", controllers.ComputeDelete{db})
	iris.Handle("GET", aPre+"/compute/list", controllers.ComputeListAdmin{db})
	iris.Handle("GET", aPre+"/compute/prepare/:bulk", controllers.ComputePrepare{db})
	iris.Handle("GET", aPre+"/compute/preparesmall/:id/:gender",
		controllers.ComputePrepareSmall{db})
	iris.Handle("GET", aPre+"/declare/prepare", controllers.DeclarePrepare{db})

	iris.Handle("GET", aPre+"/user/drop", controllers.UserDelete{db})
	iris.Handle("POST", aPre+"/user/new", controllers.UserNew{db})
}
