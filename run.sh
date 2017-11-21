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
for serverId  $(seq 0 4); do
    acc=${acc_arr[serverId]}
    ssh $acc "cd; mkdir -p log/${run_id}"
done
 
for i in $(seq 1 $NC)
do
    serverId=$(( $i % 5 ))
    ssh ${acc_arr[serverId]} "source .bash_profile; ~/CS4224-MongoDB/load_data.sh ~/data/data-files"
    ssh ${acc_arr[serverId]} "source .bash_profile; cd; PORT=30020 CONCERN=${CONCERN} XACT_FILE=\$(pwd)/data/xact-files/${i}.txt SUMMARY_FILE=\$(pwd)/log/${run_id}-stats.txt npm start > \$(pwd)/log/${run_id}/${i}.log" &
done

wait

echo "Running summary"

ssh ${acc_arr[0]} "source .bash_profile; STATS_FILE=~/log/${run_id}-stats.txt" > summary-${run_id}.txt

echo "Done with NC=${NC} CONCERN=${CONCERN}"

