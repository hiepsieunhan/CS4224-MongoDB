import mongoose from "mongoose";
const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    i_id: {
      type: Number,
      unique: true,
    },
    i_name: String,
    i_price: Number,
    i_im_id: Number,
    i_data: String,
  },
  { collection: "item" },
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
