#!/usr/bin/env bash

killall -9 node
killall -9 mongod
killall -9 mongos

rm -rf /temp/mongodb
mkdir /temp/mongodb

echo "Download Mongo"

curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.4.7.tgz
tar -zxvf mongodb-linux-x86_64-3.4.7.tgz
rm mongodb-linux-x86_64-3.4.7.tgz
cp -R -n mongodb-linux-x86_64-3.4.7/ /temp/mongodb

echo "Create db path"
mkdir -p /temp/mongodb/log
mkdir -p /temp/mongodb/data/cfgsvr
mkdir -p /temp/mongodb/data/repl0
mkdir -p /temp/mongodb/data/repl1
mkdir -p /temp/mongodb/data/repl2

if [[ -z "${MONGO_DIR}" ]]; then
    echo 'export MONGO_DIR=/temp/mongodb/bin' >> ~/.bash_profile
fi

echo "Done"