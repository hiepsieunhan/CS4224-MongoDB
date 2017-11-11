import mongoose from "mongoose";
const Schema = mongoose.Schema;

const stockSchema = new Schema(
  {
    s_w_id: Number,
    s_i_id: Number,
    s_quantity: Number,
    s_ytd: Number,
    s_order_cnt: Number,
    s_remote_cnt: Number,
    s_dist_01: String,
    s_dist_02: String,
    s_dist_03: String,
    s_dist_04: String,
    s_dist_05: String,
    s_dist_06: String,
    s_dist_07: String,
    s_dist_08: String,
    s_dist_09: String,
    s_dist_10: String,
    s_data: String,
    s_i_name: String,
    s_i_price: Number,
  },
  { collection: "stock" },
);

stockSchema.index({ s_w_id: 1, s_i_id: 1 }, { unique: true });

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
