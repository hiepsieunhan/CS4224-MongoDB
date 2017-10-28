 #!/usr/bin/env bash
for i in 50 51 52 53 54
do
    echo "start download on node $i"
    ssh xcnd$i "cd && curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.4.7.tgz && tar -zxvf mongodb-linux-x86_64-3.4.7.tgz && cp -R -n mongodb-linux-x86_64-3.4.7/ /temp/mongodb" &
done

wait

echo "Done."

