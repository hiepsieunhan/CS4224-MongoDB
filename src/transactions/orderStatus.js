import Order from "../models/Order";
import Customer from "../models/Customer";
import pick from "lodash.pick";

async function getLastOrder(w_id, d_id, c_id) {
  const orders = await Order.find({
    o_w_id: w_id,
    o_d_id: d_id,
    o_c_id: c_id,
  })
    .sort({ o_id: -1 })
    .limit(1);
  return orders.length ? orders[0] : null;
}

async function orderStatus(w_id, d_id, c_id) {
  const order = await getLastOrder(w_id, d_id, c_id);
  const customer = await Customer.findOne({
    c_w_id: w_id,
    c_d_id: d_id,
    c_id,
  });
  if (!order || !customer) {
    return null;
  }
  return {
    customer: pick(customer, ["c_first", "c_middle", "c_last", "c_balance"]),
    order: pick(order, ["o_id", "o_entry_d", "o_carrier_id", "o_delivery_d"]),
    orderLines: (order.o_order_lines || []).map(orderline =>
      pick(orderline, ["ol_i_id", "ol_supply_w_id", "ol_quantity"]),
    ),
  };
}

export default orderStatus;
