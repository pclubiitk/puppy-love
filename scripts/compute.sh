#!/usr/bin/env bash

http -v --timeout=24000 'localhost:3000/admin/compute/prepare' "$CADMIN"
