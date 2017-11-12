#!/usr/bin/env bash

# Import all json file into db, require json file path as first argument

HOST=192.168.51.13
PORT=30020

echo "----------Drop and create wholesaler DB----------"
mongo wholesaler --host $HOST --port $PORT --eval "db.dropDatabase()"
echo "use wholesaler" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.enableSharding('wholesaler')" | $MONGO_DIR/mongo --host $HOST --port $PORT

echo "----------Import model----------"
HOST=$HOST PORT=$PORT DB=wholesaler npm run import-models

echo "----------Import json file into MongoDB----------"
for model in "warehouse" "district" "customer" "item" "stock" "order"
do
  $MONGO_DIR/mongoimport --host $HOST --port $PORT --numInsertionWorkers 16 --jsonArray --type json --db wholesaler --file $1/$model.
json --collection $model
done


echo "----------Done----------"