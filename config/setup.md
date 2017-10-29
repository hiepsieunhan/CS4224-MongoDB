// setup config server

xcnd50: mongod --config ~/CS4224-MongoDB/config/config_server/xcnd50.config
xcnd51: mongod --config ~/CS4224-MongoDB/config/config_server/xcnd51.config
xcnd52: mongod --config ~/CS4224-MongoDB/config/config_server/xcnd52.config

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