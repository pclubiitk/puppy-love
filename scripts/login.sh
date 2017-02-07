#!/usr/bin/env bash

echo "Username: ${1}"
VAL=$(http 'pclub.cse.iitk.ac.in/api/session/login' username="$1" password="$2" --header | tail -n 2 | head -n1)
echo "Cookie is ${VAL}"

if [ "$1" = "admin" ];
then
    echo "Logging in as admin"
    export CADMIN="Cookie:${VAL:12}"
else
    echo "Logging in as ${1}"
    export COOKIE="Cookie:${VAL:12}"
fi;
