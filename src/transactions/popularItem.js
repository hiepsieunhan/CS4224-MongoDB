import Order from "../models/Order";
import Customer from "../models/Customer";
import pick from "lodash.pick";

function getPopularOrderlines(orderlines) {
  const maxQuantity = orderlines.reduce(
    (curMax, orderline) => Math.max(curMax, orderline.ol_quantity),
    0,
  );
  return orderlines.filter(orderline => orderline.ol_quantity == maxQuantity);
}

function countOrderContainItem(orders, itemId) {
  return orders.reduce((count, order) => {
    count += order.o_order_lines.some(orderline => orderline.ol_i_id == itemId);
    return count;
  }, 0);
}

function getDistinctPopularItemsData(orders) {
  const itemMap = orders.reduce((map, order) => {
    const popularItems = getPopularOrderlines(order.o_order_lines);
    return popularItems.reduce((map, orderline) => {
      map[orderline.ol_i_id] = orderline.ol_i_name;
      return map;
    }, map);
  }, {});
  return Object.keys(itemMap).map(itemId => {
    const count = countOrderContainItem(orders, itemId);
    return {
      i_name: itemMap[itemId],
      percentage: count / orders.length,
    };
  });
}

async function popularItem(w_id, d_id, lastOrderCnt) {
  const orders = await Order.find({ o_w_id: w_id, o_d_id: d_id })
    .sort({
      o_id: -1,
    })
    .limit(lastOrderCnt);
  const customers = await Promise.all(
    orders.map(async order => {
      const customer = await Customer.findOne({
        c_w_id: w_id,
        c_d_id: d_id,
        c_id: order.o_c_id,
      });
      return customer;
    }),
  );
  const ordersPopularItems = orders.map((order, index) => {
    const popularItems = getPopularOrderlines(order.o_order_lines);
    return {
      o_id: order.o_id,
      o_entry_d: order.o_entry_d,
      ...pick(customers[index], ["c_first", "c_middle", "c_last"]),
      popularItems: popularItems.map(item =>
        pick(item, ["ol_i_name", "ol_quantity"]),
      ),
    };
  });

  const distinctPopularItems = getDistinctPopularItemsData(orders);
  return {
    w_id,
    d_id,
    L: lastOrderCnt,
    ordersPopularItems,
    distinctPopularItems,
  };
}

export default popularItem;
