#!/usr/bin/env bash

until glide --debug install
do
    echo "Retrying"
done
