import Warehouse from "../models/Warehouse";
import District from "../models/District";
import Order from "../models/Order";
import Customer from "../models/Customer";
import Stock from "../models/Stock";
import pick from "lodash.pick";

async function getOrderIdAndUpdateDistrict(w_id, d_id) {
  const district = await District.findOne({ d_w_id: w_id, d_id });
  if (district) {
    const { d_next_o_id } = district;
    district.d_next_o_id += 1;
    await district.save();
    return d_next_o_id;
  }
  return null;
}

async function prepareOrderlines(w_id, d_id, itemsData) {
  let totalAmount = 0;
  const orderLines = await Promise.all(
    itemsData.map(async (data, index) => {
      const { i_id, supply_w_id, quantity } = data;
      const stock = await Stock.findOne({ s_w_id: supply_w_id, s_i_id: i_id });
      if (!stock) return null;
      stock.s_quantity -= quantity;
      if (stock.s_quantity < 10) {
        stock.s_quantity += 100;
      }
      stock.s_ytd += quantity;
      stock.s_order_cnt += 1;
      stock.s_remote_cnt += supply_w_id != w_id;
      await stock.save();
      const itemAmount = quantity * stock.s_i_price;
      totalAmount += itemAmount;
      return {
        ol_number: index + 1,
        ol_i_id: i_id,
        ol_amount: itemAmount,
        ol_supply_w_id: supply_w_id,
        ol_quantity: quantity,
        ol_dist_info: `S_DIST_${d_id}`,
        ol_i_name: stock.s_i_name,
      };
    }),
  );
  return {
    totalAmount,
    orderLines,
  };
}

async function newOrder(w_id, d_id, c_id, itemsData) {
  const o_id = await getOrderIdAndUpdateDistrict(w_id, d_id);
  if (isNaN(o_id)) {
    return null;
  }
  const [warehouse, district, customer] = await Promise.all([
    Warehouse.findOne({ w_id }),
    District.findOne({ d_w_id: w_id, d_id }),
    Customer.findOne({ c_w_id: w_id, c_d_id: d_id, c_id }),
  ]);
  if (!warehouse || !district || !customer) {
    return null;
  }
  const {
    totalAmount: originTotalAmount,
    orderLines,
  } = await prepareOrderlines(w_id, d_id, itemsData);
  const isAllLocal = !itemsData.some(item => item.supply_w_id != w_id);
  const order = new Order({
    o_w_id: w_id,
    o_d_id: d_id,
    o_id,
    o_c_id: c_id,
    o_carrier_id: 0,
    o_ol_cnt: itemsData.length,
    o_all_local: isAllLocal,
    o_entry_d: new Date().toString(),
    o_delivery_d: "",
    o_order_lines: orderLines,
  });
  await order.save();
  const totalAmount =
    originTotalAmount *
    (1 + district.d_tax + warehouse.w_tax) *
    (1 - customer.c_discount);
  return {
    customer: {
      w_id,
      d_id,
      c_id,
      ...pick(customer, ["c_last", "c_credit", "c_discount"]),
    },
    w_tax: warehouse.w_tax,
    d_tax: district.d_tax,
    o_id,
    o_entry_d: order.o_entry_d,
    num_items: itemsData.length,
    total_amount: totalAmount,
    items: orderLines,
  };
}

export default newOrder;
