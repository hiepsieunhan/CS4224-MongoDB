#!/usr/bin/env bash

# Import all json file into db

HOST=localhost
PORT=30020

echo "Drop and create wholesaler DB"
$MONGO_DIR/mongo --host $HOST --port $PORT <<EOF
use wholesaler;
db.dropDatabase();
use wholesaler;
sh.enableSharding('wholesaler');
EOF

cd ~/CS4224-MongoDB

echo "Import model"
HOST=$HOST PORT=$PORT DB=wholesaler npm run import-models

$MONGO_DIR/mongo --host $HOST --port $PORT <<EOF
use wholesaler;
sh.shardCollection('wholesaler.customer', { c_w_id: 1, c_d_id: 1 } )
sh.shardCollection('wholesaler.district', { d_w_id: 1, d_id: 1 } )
sh.shardCollection('wholesaler.item', { i_id: 1 } )
sh.shardCollection('wholesaler.order', { o_w_id: 1, o_d_id: 1 } )
sh.shardCollection('wholesaler.stock', { s_w_id: 1, s_i_id: 1 } )
sh.shardCollection('wholesaler.warehouse', { w_id: 1 } )
EOF

cd

echo "Import json file into MongoDB"
for model in "warehouse" "district" "customer" "item" "stock" "order"
do
  $MONGO_DIR/mongoimport --host $HOST --port $PORT --numInsertionWorkers 16 --jsonArray --type json --db wholesaler --file $(pwd)/data/data-files/$model.json --collection $model
done

# sleep before data is balance for 30 minutes
echo "wating for data balancing..."

sleep 1800

echo "Done"