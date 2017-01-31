package db

import (
	"gopkg.in/kataras/go-sessions.v0/sessiondb/redis"
	"gopkg.in/kataras/go-sessions.v0/sessiondb/redis/service"
)

func RedisSession() *redis.Database {
	var redisAddr = service.DefaultRedisAddr
	if (os.Getenv("REDIS_PORT_6379_TCP_PORT") != "" && os.Getenv("REDIS_PORT_6379_TCP_ADDR") != "") {
		var port = os.Getenv("REDIS_PORT_6379_TCP_PORT")
		var addr = os.Getenv("REDIS_PORT_6379_TCP_ADDR")
		redisAddr = addr + ":" + port
	}
	return redis.New(service.Config{Network: service.DefaultRedisNetwork,
		Addr:          redisAddr,
		Password:      "",
		Database:      "",
		MaxIdle:       0,
		MaxActive:     0,
		IdleTimeout:   service.DefaultRedisIdleTimeout,
		Prefix:        "",
		MaxAgeSeconds: service.DefaultRedisMaxAgeSeconds})
	// optionally configure the bridge between your redis server
}
