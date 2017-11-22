# CS4224 MongoDB Project - Team 11

Retrive the project from
[this github repo](https://github.com/hiepsieunhan/CS4224-MongoDB)

### Team members

* Nguyen Hung Tam A0112059N
* Bui Do Hiep A0126502U
* Adrian Bratteby A0175596L

### Setup

1. Make sure that you setup all 5 nodes such that they have passwordless ssh
   access to each other. It is required that you have `node 8` and `npm`
   installed. ssh into one server and do following steps
2. Clone this repo into the home dir of the node. Make sure that the folder is
   named `CS4224-MongoDB`. Go inside `CS4224-MongoDB` folder.
3. Update the `nodes.txt` with your nodes ip and hostnames.
4. Go inside `CS4224-MongoDB` folder and run

```sh
$ npm install
```

5. Enable execution for all `.sh` files. Simply run

```sh
$ chmod +x *.sh
```

6. Run following command to install mongodb on 5 nodes (mongodb will be
   installed `/temp/mongodb/`) and start the shard cluster.

```sh
$ ./setup_shards.sh
```

7. Run following command to download the data. If you want to test on other set
   of data, make sure that your data folder is located at home directory and
   named `data` before running the command

```sh
$ ./prepare_data.sh
```

### Running Experiment

Firstly ssh to one node and go inside `CS4224-MongoDB`. Run following command

```sh
$ ./run.sh <number_clients> <concern_level> <max_transactions>
```

Where `number_clients` is either 10, 20 or 40 and `concern_level` is either
`local` or `majority`. `max_transactions` is optional, indicate the maximum
number of transactions you want to run, if not specified, then all transactions
in the input fill will be executed.

Note that `concern_level` = `local` means using `local` for read concern and `1`
for write concern, while `concern_level` = `majority` means using `majority` for
both read and write concern.

### Logging

All log files are located in `~/log/`. Each client will print out in the
corresponding test case log folder named
`~/log/<numner_clients>-<concern_level>`, while the stats file (throughput of
clients of the test case) is inside
`~/log/<numner_clients>-<concern_level>-stats.txt` The summary of the test case
is inside `~/log/summary-<numner_clients>-<concern_level>.txt` which contains
`min` `max` `average` throughput.
