#!/usr/bin/env bash

# Import all json file into db, require json file path as first argument

HOST=192.168.51.13
PORT=30020

echo "----------Drop and create wholesaler DB----------"
mongo wholesaler --host $HOST --port $PORT --eval "db.dropDatabase()"
echo "use wholesaler" | mongo --host $HOST --port $PORT
echo "sh.enableSharding('wholesaler')" mongo --host $HOST --port $PORT

echo "----------Import model----------"
HOST=$HOST PORT=$PORT DB=wholesaler npm run import-models

echo "----------Import json file into MongoDB----------"
for model in "warehouse" "district" "customer" "order" "item" "stock"
do
  mongoimport --host $HOST --port $PORT --jsonArray --type json --db wholesaler --file $1/$model.json --collection $model
done


echo "----------Done----------"
