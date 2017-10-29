#!/usr/bin/env bash

for i in 50 51 52 53 54
do
  echo "Run mongo $i"
  ssh xcnd$i "/temp/mongodb/bin/mongos --config ~/CS4224-MongoDB/config/mongos/xcnd$i.config --fork --logpath /temp/mongodb_log/mongos.log"
done

wait

echo "Done."

