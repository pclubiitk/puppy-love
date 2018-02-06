package router

import (
	"net/http"

	"github.com/milindl/puppy-love/controllers"
	"github.com/milindl/puppy-love/db"

	"github.com/gin-gonic/gin"
)

func PuppyRoute(db db.PuppyDb) *gin.Engine {

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusAccepted, "Hello from the other side!")
	})

	controllers.Db = db

	// User administration
	users := r.Group("/users")
	{
		users.POST("/login/first", controllers.UserFirst)
		users.POST("/data/update/:you", controllers.UserUpdateData)
		users.POST("/data/submit/:you", controllers.UserSubmitTrue)
		users.POST("/image/update/:you", controllers.UserUpdateImage)
		users.POST("/pass/update/:you", controllers.UserSavePass)

		users.GET("/data/info", controllers.UserLoginGet)
		users.GET("/data/match/:you", controllers.MatchGet)
		users.GET("/get/:id", controllers.UserGet)
		users.GET("/mail/:id", controllers.UserMail)
	}

	// Listing users
	list := r.Group("/list")
	{
		list.GET("/gender/:gender", controllers.ListAll)
		list.GET("/pubkey/:gender", controllers.PubkeyList)
		list.GET("/declare", controllers.DeclareList)
	}

	// Declare

	r.POST("/declare/choices", controllers.DeclareStep)

	// Hearts
	hearts := r.Group("/hearts")
	{
		hearts.GET("/hearts/get/:time/:gen/:you", controllers.HeartGet)
		hearts.POST("/hearts/send/:you", controllers.GotHeart)
	}

	// Session administration
	session := r.Group("/session")
	{
		session.POST("/login", controllers.SessionLogin)
		session.GET("/logout", controllers.SessionLogout)
	}

	// Admin
	admin := r.Group("/admin")
	{
		admin.GET("/declare/prepare", controllers.DeclarePrepare)
		admin.GET("/user/drop", controllers.UserDelete)
		admin.POST("/user/new", controllers.UserNew)
	}

	return r
}
