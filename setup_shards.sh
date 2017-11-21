#!/usr/bin/env bash
# Experiment scripts to be run in sunfire node

accs=`tail -1 nodes.txt`
acc_arr=($(tail -1 nodes.txt))

for acc in $accs; do
    ssh ${acc} "source .bash_profile; ~/CS4224-MongoDB/setup_mongodb.sh"
done

for accId in `seq 0 2`; do
  acc=${acc_arr[accId]}
  ssh $acc "source .bash_profile; \$MONGO_DIR/mongod --storageEngine wiredTiger --enableMajorityReadConcern --fork --configsvr --directoryperdb --pidfilepath /temp/mongodb/pid --dbpath /temp/mongodb/data/cfgsvr --logpath /temp/mongodb/log/cfgsvr.log --replSet cfg --port 30010"
done

ssh ${acc_arr[0]} "source .bash_profile; mongo --port 30010 <<EOF
rs.initiate(
        {
                _id: \"cfg\",
                configsvr: true,
                members: [
                        { _id : 0, host : \"${acc_arr[0]}:30010\" },
                        { _id : 1, host : \"${acc_arr[1]}:30010\" },
                        { _id : 2, host : \"${acc_arr[2]}:30010\" }
                ]
        }
)
EOF"

for shardId in `seq 0 4`; do
  # Run shard mongod
  for repId in `seq 0 2`; do
    port=$((30000 + $repId))
    echo "Running source .bash_profile; \$MONGO_DIR/mongod --storageEngine wiredTiger --enableMajorityReadConcern --fork --shardsvr --directoryperdb --pidfilepath /temp/mongodb/pidshard${shardId} --dbpath /temp/mongodb/data/repl${repId} --logpath /temp/mongodb/log/repl${repId}.log --replSet shard${shardId} --port ${port}"
    ssh ${acc_arr[shardId]} "source .bash_profile; \$MONGO_DIR/mongod --storageEngine wiredTiger --enableMajorityReadConcern --fork --shardsvr --directoryperdb --pidfilepath /temp/mongodb/pidshard${shardId} --dbpath /temp/mongodb/data/repl${repId} --logpath /temp/mongodb/log/repl${repId}.log --replSet shard${shardId} --port ${port}"
  done

  # Create rs
  ssh ${acc_arr[shardId]} "source .bash_profile; \$MONGO_DIR/mongo --port 30000 <<EOF
rs.initiate(
        {
                _id: \"shard${shardId}\",
                members: [
                        { _id : 0, host : \"${acc_arr[$shardId]}:30000\" },
                        { _id : 1, host : \"${acc_arr[$shardId]}:30001\" },
                        { _id : 2, host : \"${acc_arr[$shardId]}:30002\" }
                ]
        }
)
EOF"

  ssh ${acc_arr[$shardId]} "source .bash_profile; \$MONGO_DIR/mongos --fork --pidfilepath /temp/mongodb/pidmongos --logpath /temp/mongodb/log/mongos_${shardId}.log --configdb cfg/${acc_arr[0]}:30010,${acc_arr[1]}:30010,${acc_arr[2]}:30010 --port 30020"
done

for shardId in `seq 0 4`; do
  ssh ${acc_arr[0]} "source .bash_profile; \$MONGO_DIR/mongo --port 30020 <<EOF
sh.addShard(\"shard${shardId}/${acc_arr[$shardId]}:30000,${acc_arr[$shardId]}:30001,${acc_arr[$shardId]}:30002\")
EOF"
done