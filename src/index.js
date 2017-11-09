// const fs = require("fs");

// console.log(`${HOST}:${PORT}`);

// fs.readFile("./data/test.txt", "utf8", (err, data) => {
//   if (err) {
//     return;
//   }
//   console.log(data.split("\n"));
// });

import Warehouse from "./models/Warehouse";
import District from "./models/District";
import Item from "./models/Item";

import mongoose from "mongoose";

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
