#!/usr/bin/env bash
echo "Init config dir"
for i in 50 51 52
do
    echo "Init config dir on node $i"
    ssh xcnd$i "mkdir -p /temp/mongodb_storage/config_server"
done


echo "Init shard dir"
for i in 50 51 52 53 54
do
    echo "Init shard dir on node $i"
    ssh xcnd$i "rm -r /temp/mongdb_log && rm -r /temp/log && mkdir -p /temp/mongodb_log"
    ssh xcnd$i "mkdir -p /temp/mongodb_storage/repl0 && mkdir -p /temp/mongodb_storage/repl1 && mkdir -p /temp/mongodb_storage/repl2"
done

echo "Done."

