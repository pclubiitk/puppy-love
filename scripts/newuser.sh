#!/usr/bin/env bash

read -p "Roll: " roll
read -p "Name: " name
read -p "Gender (0/1): " gender
read -p "Image: " image
read -p "Email: " email

http -v 'pclub.cse.iitk.ac.in/api/admin/user/new' roll="$roll" name="$name" email="$email" gender="$gender" image="$image" passHash="aaaa" "$CADMIN"
