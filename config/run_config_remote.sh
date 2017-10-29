 #!/usr/bin/env bash
for i in 50 51 52
do
    echo "Run config server in node $i"
    ssh xcnd$i "mongod --config ~/CS4224-MongoDB/config/config_server/xcnd$i.config"
done

wait

echo "Done."

