#!/usr/bin/env bash

read -p "Roll: " roll
read -p "Name: " name
read -p "Gender (0/1): " gender
read -p "Image: " image

http -v 'localhost:3000/admin/user/new' roll="$roll" name="$name" email="test@test" gender="$gender" image="$image" passHash="aaaa" "$CADMIN"
