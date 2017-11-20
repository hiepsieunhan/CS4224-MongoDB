import fs from "fs";
import mongoose from "mongoose";
import LineByLine from "n-readlines";

import newOrder from "./transactions/newOrder";
import payment from "./transactions/payment";
import delivery from "./transactions/delivery";
import orderStatus from "./transactions/orderStatus";
import popularItem from "./transactions/popularItem";
import stockLevel from "./transactions/stockLevel";
import topBalance from "./transactions/topBalance";

const {
  PORT = 27017,
  HOST = "localhost",
  DB = "wholesaler",
  READ_CONCERN = "local",
  WRITE_CONCERN = 1,
  W_TIMEOUT = 5000,
  MAX_TRANSACTION = 100000000,
  XACT_FILE,
  SUMMARY_FILE,
} = process.env;

mongoose.connect(`mongodb://${HOST}:${PORT}/${DB}`, {
  useMongoClient: true,
  readConcern: READ_CONCERN,
  w: WRITE_CONCERN,
  wtimeout: W_TIMEOUT,
});
mongoose.Promise = global.Promise;

async function main() {
  const reader = new LineByLine(XACT_FILE);
  const startTime = Date.now() / 1000;
  let xactCount = 0;
  while (xactCount < MAX_TRANSACTION) {
    xactCount++;
    let line = reader.next();
    if (line === false) {
      break;
    }
    const values = line.split(",");
    if (values.length > 0) {
      let result;
      switch (values[0]) {
        case "N": {
          const itemNums = parseInt(values[4]);
          const itemsData = [];
          for (let i = 0; i < itemNums; i++) {
            line = reader.next();
            const itemValues = line.split(",");
            itemsData.push({
              i_id: parseInt(itemValues[0]),
              supply_w_id: parseInt(itemValues[1]),
              quantity: parseInt(itemValues[2]),
            });
          }
          result = await newOrder(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3]),
            itemsData,
          );
          break;
        }
        case "P": {
          result = await payment(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3]),
            parseInt(values[4]),
          );
          break;
        }
        case "D": {
          result = await delivery(parseInt(values[1]), parseInt(values[2]));
          break;
        }
        case "O": {
          result = await orderStatus(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3]),
          );
          break;
        }
        case "S": {
          result = await stockLevel(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3]),
            parseInt(values[4]),
          );
          break;
        }
        case "I": {
          result = await popularItem(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3]),
          );
          break;
        }
        case "T": {
          result = await topBalance();
          break;
        }
        default:
          break;
      }
      console.log(`Transaction: ${values[0]}:`);
      console.log(result);
    }
  }
  const endTime = Date.now() / 1000;
  const throughput = xactCount / (endTime - startTime);
  fs.appendFileSync(SUMMARY_FILE, `${throughput}\n`);
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", main);
