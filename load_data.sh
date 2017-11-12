#!/usr/bin/env bash

# Import all json file into db, require json file path as first argument

HOST=192.168.51.13
PORT=30020

echo "----------Drop and create wholesaler DB----------"
mongo wholesaler --host $HOST --port $PORT --eval "db.dropDatabase()"
echo "use wholesaler" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.enableSharding('wholesaler')" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.customer', { c_w_id: 1, c_d_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.district', { d_w_id: 1, d_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.item', { i_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.order', { o_w_id: 1, o_d_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.stock', { s_w_id: 1, s_i_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT
echo "sh.shardCollection('wholesaler.warehouse', { w_id: 1 } )" | $MONGO_DIR/mongo --host $HOST --port $PORT

echo "----------Import model----------"
HOST=$HOST PORT=$PORT DB=wholesaler npm run import-models

echo "----------Import json file into MongoDB----------"
for model in "warehouse" "district" "customer" "item" "stock" "order"
do
  $MONGO_DIR/mongoimport --host $HOST --port $PORT --numInsertionWorkers 16 --jsonArray --type json --db wholesaler --file $1/$model.
json --collection $model
done


echo "----------Done----------"