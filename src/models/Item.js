const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  i_id: {
    type: Number,
    unique: true,
  },
  i_name: String,
  i_price: Number,
  i_im_id: Number,
  i_data: String,
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;