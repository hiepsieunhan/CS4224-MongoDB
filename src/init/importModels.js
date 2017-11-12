import Warehouse from "../models/Warehouse";
import District from "../models/District";
import Item from "../models/Item";
import Order from "../models/Order";
import Stock from "../models/Stock";
import Customer from "../models/Customer";

import mongoose from "mongoose";

const { PORT = 27017, HOST = "localhost", DB = "wholesaler" } = process.env;

mongoose.connect(`mongodb://${HOST}:${PORT}/${DB}`, {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once("open", function() {
  console.log("connected!");
  // Hacky part, wait for 20 seconds to make sure models are imported
  setTimeout(() => {
    mongoose.connection.close();
  }, 4000);
});
