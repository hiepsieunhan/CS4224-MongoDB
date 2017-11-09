const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const districtSchema = new Schema({
  d_w_id: Number,
  d_id: Number,
  d_name: String,
  d_street_1: String,
  d_street_2: String,
  d_city: String,
  d_state: String,
  d_zip: String,
  d_tax: Number,
  d_ytd: Number,
  d_next_o_id: Number,
  d_next_deliver_o_id: Number,
});

districtSchema.index({ d_w_id: 1, d_id: 1 }, { unique: true });

const District = mongoose.model("District", districtSchema);

module.exports = District;
