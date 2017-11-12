import mongoose from "mongoose";
const Schema = mongoose.Schema;

const warehouseSchema = new Schema(
  {
    w_id: {
      type: Number,
      unique: true,
    },
    w_name: String,
    w_street_1: String,
    w_street_2: String,
    w_city: String,
    w_state: String,
    w_zip: String,
    w_tax: Number,
    w_ytd: Number,
  },
  { collection: "warehouse", shardKey: { w_id: 1 } },
);

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
