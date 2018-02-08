// Note: Redis is not used anymore.
package db

import (
	"github.com/milindl/puppy-love/config"

	"gopkg.in/kataras/go-sessions.v0/sessiondb/redis"
	"gopkg.in/kataras/go-sessions.v0/sessiondb/redis/service"
)

func RedisSession() *redis.Database {
	return redis.New(service.Config{Network: service.DefaultRedisNetwork,
		Addr:          config.CfgRedisUrl,
		Password:      "",
		Database:      "",
		MaxIdle:       0,
		MaxActive:     0,
		IdleTimeout:   service.DefaultRedisIdleTimeout,
		Prefix:        "",
		MaxAgeSeconds: service.DefaultRedisMaxAgeSeconds})
	// optionally configure the bridge between your redis server
}
