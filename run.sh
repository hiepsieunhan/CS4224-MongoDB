#!/usr/bin/env bash
# Run an experiment, run on one of 5 nodes

# required variables:
# -   NC: number of clients to run
# -   CONCERN: read and write concerns, either "local" or "majority"
# -   MAX_XACT: maximum number of transaction to run, this is optional

NC=$1
CONCERN=$2
MAX_XACT=$3

accs=`tail -1 nodes.txt`
acc_arr=($(tail -1 nodes.txt))

# Set n flag
if [ -z "$MAX_XACT" ]; then
    nflag=""
else
    nflag=" $MAX_XACT"
fi

# Go to home dir

run_id=$NC-$CONCERN

# create log folder
for serverId in $(seq 0 4); do
    acc=${acc_arr[serverId]}
    ssh $acc "cd; mkdir -p log/${run_id}"
done
 
ssh ${acc_arr[0]} "source .bash_profile; cd; ~/CS4224-MongoDB/load_data.sh"

for i in $(seq 1 $NC)
do
    serverId=$(( $i % 5 ))
    ssh ${acc_arr[serverId]} "source .bash_profile; cd; dir=\$(pwd); cd CS4224-MongoDB; PORT=30020 ${nflag} CONCERN=${CONCERN} XACT_FILE=\$dir/data/xact-files/${i}.txt SUMMARY_FILE=\$dir/log/${run_id}-stats.txt npm start > \$dir/log/${run_id}/${i}.log" &
done

wait

echo "Running summary"

ssh ${acc_arr[0]} "source .bash_profile;  cd; dir=\$(pwd); cd CS4224-MongoDB; STATS_FILE=~/log/${run_id}-stats.txt npm run summarize" > summary-${run_id}.txt

echo "Done with NC=${NC} CONCERN=${CONCERN}"

