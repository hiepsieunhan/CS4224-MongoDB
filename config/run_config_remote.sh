 #!/usr/bin/env bash
for i in 50 51 52
do
    echo "Run config server in node $i"
    ssh xcnd$i "/temp/mongodb/bin/mongod --config ~/CS4224-MongoDB/config/config_server/xcnd$i.config --fork --logpath /temp/mongodb_log/config_server.log"
done

wait

echo "Done."

