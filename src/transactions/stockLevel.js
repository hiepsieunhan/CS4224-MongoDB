import District from "../models/District";
import Stock from "../models/Stock";
import Order from "../models/Order";
import pick from "lodash.pick";

async function stockLevel(w_id, d_id, threshold, lastOrderCnt) {
  try {
    const district = await District.findOne({ d_w_id: w_id, d_id });
    if (!district) {
      return null;
    }

    const orders = await Order.find({ o_w_id: w_id, o_d_id: d_id })
      .sort({ o_id: -1 })
      .limit(lastOrderCnt);

    const itemIdMap = orders.reduce((map, order) => {
      const orderLines = order.o_order_lines || [];
      return orderLines.reduce((map, orderLine) => {
        map[orderLine.ol_i_id] = true;
        return map;
      }, map);
    }, {});
    const itemIds = Object.keys(itemIdMap);

    const stocks = await Stock.find({ s_w_id: w_id, s_i_id: { $in: itemIds } });
    return stocks.reduce((count, stock) => {
      count += stock.s_quantity < threshold;
      return count;
    }, 0);
  } catch (err) {
    return err;
  }
}

export default stockLevel;
