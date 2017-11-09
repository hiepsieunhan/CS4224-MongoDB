import mongoose from "mongoose";
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  c_w_id: Number,
  c_d_id: Number,
  c_id: Number,
  c_first: String,
  c_middle: String,
  c_last: String,
  c_street_1: String,
  c_street_2: String,
  c_city: String,
  c_state: String,
  c_zip: String,
  c_phone: String,
  // store as String instead of Date
  c_since: String,
  c_credit: String,
  c_credit_limit: Number,
  c_discount: Number,
  c_balance: Number,
  c_ytd_payment: Number,
  c_payment_cnt: Number,
  c_delivery_cnt: Number,
  c_data: String,
});

// unique index
customerSchema.index({ c_w_id: 1, c_d_id: 1, c_id: 1 }, { unique: true });

// top balance index descending
customerSchema.index({ c_balance: -1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
