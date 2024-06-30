#!/bin/bash

UP="docker compose -f docker-compose.yml up -d"
BUILD="docker compose -f docker-compose.yml exec build-dict"
EXC="docker compose -f docker-compose.yml exec run-node"
CMD="$@"

$UP
$EXC node /app/scripts/check.mjs
if [ ! -e ./variables/same ]; then
  $BUILD cp /app/csv/dict.csv /app/kuromoji.js/node_modules/mecab-ipadic-seed/lib/dict/
  $BUILD npm run build-dict
  $BUILD rm -rf /app/dict/*
  $BUILD cp -aT /app/kuromoji.js/dict /app/dict
  $BUILD chmod -R +wx /app/dict
fi

if [ -e ./variables/same ]; then
  $EXC rm -rf /app/variables/same
fi

$EXC node /app/scripts/run.mjs
$EXC chmod -R 777 /app/results