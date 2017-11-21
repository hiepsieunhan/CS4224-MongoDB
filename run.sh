#!/usr/bin/env bash

# required variables:
# -   node_id: id of this server, from 1-5
# -   host: ip of the server where the mongos we want to connect running
# -   num_clients: number of clients to run
# -   concern: read and write concerns, either "local" or "majority"

node_id=$1
host=$2
num_clients=$3
read_concern=$4
write_concern=$5

port=30020

xact_dir=$(pwd)/data/xact-files
log_dir=$(pwd)/log
run_id=$num_clients-$read_concern-$write_concern

mkdir -p $log_dir/$run_id

echo "Spawn NC / 5 process ..."
 
for i in $(seq 1 $num_clients)
do
    if [ $((i%5 + 1)) == $node_id ]
    then
        stats_file=$log_dir/$run_id-stats.txt
        log_file=$log_dir/$run_id/xact-$i.log
        touch $stats_file
        PORT=$port HOST=$host READ_CONCERN=$read_concern WRITE_CONCERN=$write_concern XACT_FILE=$xact_dir/$i.txt SUMMARY_FILE=$stats_file npm start > $log_file &
    fi
done

echo "Join NC / 5 process"

wait

echo "done xacts on node $node_id with num_clients $num_clients, read concern $read_concern and  write concern $write_concern"

