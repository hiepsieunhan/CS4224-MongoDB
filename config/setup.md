// setup config server

mongo --host 192.168.51.13 --port 30010

rs.initiate(
  {
    _id: "configServerReplicaSet",
    configsvr: true,
    members: [
      { _id : 0, host : "192.168.51.13:30010" },
      { _id : 1, host : "192.168.51.14:30010" },
      { _id : 2, host : "192.168.51.15:30010" },
    ]
  }
)

// setup shards - for each node, e.g xcnd50 with ip 192.168.51.13

// xcnd50
mongo --host 192.168.51.13 --port 30000
rs.initiate(
  {
    _id: "xcnd50ReplicaSet",
    members: [
      { _id : 0, host : "192.168.51.13:30000" },
      { _id : 1, host : "192.168.51.13:30001" },
      { _id : 2, host : "192.168.51.13:30002" },
    ]
  }
)

// xcnd51
mongo --host 192.168.51.14 --port 30000
rs.initiate(
  {
    _id: "xcnd51ReplicaSet",
    members: [
      { _id : 0, host : "192.168.51.14:30000" },
      { _id : 1, host : "192.168.51.14:30001" },
      { _id : 2, host : "192.168.51.14:30002" },
    ]
  }
)

// xcnd52
mongo --host 192.168.51.15 --port 30000
rs.initiate(
  {
    _id: "xcnd52ReplicaSet",
    members: [
      { _id : 0, host : "192.168.51.15:30000" },
      { _id : 1, host : "192.168.51.15:30001" },
      { _id : 2, host : "192.168.51.15:30002" },
    ]
  }
)

// xcnd53
mongo --host 192.168.51.16 --port 30000
rs.initiate(
  {
    _id: "xcnd53ReplicaSet",
    members: [
      { _id : 0, host : "192.168.51.16:30000" },
      { _id : 1, host : "192.168.51.16:30001" },
      { _id : 2, host : "192.168.51.16:30002" },
    ]
  }
)

// xcnd54
mongo --host 192.168.51.17 --port 30000
rs.initiate(
  {
    _id: "xcnd54ReplicaSet",
    members: [
      { _id : 0, host : "192.168.51.17:30000" },
      { _id : 1, host : "192.168.51.17:30001" },
      { _id : 2, host : "192.168.51.17:30002" },
    ]
  }
)


// connect to mongos and run add shard