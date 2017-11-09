// const fs = require("fs");

// console.log(`${HOST}:${PORT}`);

// fs.readFile("./data/test.txt", "utf8", (err, data) => {
//   if (err) {
//     return;
//   }
//   console.log(data.split("\n"));
// });

const Warehouse = require("./models/Warehouse");
const District = require("./models/District");
const Item = require("./models/Item");

const mongoose = require("mongoose");

const { PORT = 27017, HOST = "localhost", DB = "supplier" } = process.env;

mongoose.connect(`mongodb://${HOST}:${PORT}/${DB}`, {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("connected!");
});
