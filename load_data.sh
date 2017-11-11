#!/usr/bin/env bash

# Import all json file into db, require json file path as first argument

echo "----------Import json file into MongoDB----------"
for model in "warehouse" "district" "customer" "order" "item" "stock"
do
  mongoimport --host 192.168.51.13 --port 30020 --jsonArray --type json --file $1/$model.json --collection $model
done


echo "----------Done----------"
