#!/usr/bin/env bash

VAL=$(http 'localhost:3000/session/login' username="$1" password="$2" --header | tail -n 2 | head -n1)

if [ $1 -eq "admin" ];
then
    CADMIN="Cookie:${VAL:12}";
else
    COOKIE="Cookie:${VAL:12}";
fi;
