 #!/usr/bin/env bash
for node in 50 51 52 53 54
do
  for i in 0 1 2
  do
    echo "Run shard $node with node $i"
    ssh xcnd$node "/temp/mongodb/bin/mongod --config ~/CS4224-MongoDB/config/shards/xcnd$node/node$i.config --fork --logpath /temp/mongodb_log/repl$node.log"
  done
done

wait

echo "Done."

