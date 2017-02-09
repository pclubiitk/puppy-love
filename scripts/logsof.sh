#!/usr/bin/env bash

LOGFILE=$(docker inspect --format='{{.LogPath}}' $1)
APP=${2:-vim}
$APP $LOGFILE
