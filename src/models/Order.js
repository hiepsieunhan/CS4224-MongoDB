const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  o_w_id: Number,
  o_d_id: Number,
  o_id: Number,
  o_c_id: Number,
  o_carrier_id: Number,
  o_ol_cnt: Number,
  o_all_local: Number,
  o_entry_d: String,
  // State this to report - serialize data
  o_delivery_d: String,
  o_order_lines: [
    {
      ol_number: Number,
      ol_i_id: Number,
      ol_amount: Number,
      ol_supply_w_id: Number,
      ol_quantity: Number,
      ol_dist_info: String,
      ol_i_name: String,
    },
  ],
});

orderSchema.index({ o_w_id: 1, o_d_id: 1, o_id: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
