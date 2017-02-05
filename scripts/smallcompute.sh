#!/usr/bin/env bash

read -p "Roll: " id
read -p "Required gender: " req

http -v --timeout=24000 "localhost:3000/admin/compute/preparesmall/${id}/${req}" "$CADMIN"
