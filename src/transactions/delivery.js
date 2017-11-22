import District from "../models/District";
import Order from "../models/Order";
import Customer from "../models/Customer";
import pick from "lodash.pick";

async function getOrderToDeliverAndupdateDistrict(w_id, d_id) {
  const district = await District.findOne({ d_w_id: w_id, d_id });
  if (!district) {
    return null;
  }
  const { d_next_o_id, d_next_deliver_o_id } = district;
  if (d_next_o_id <= d_next_deliver_o_id) {
    return null;
  }
  district.d_next_deliver_o_id += 1;
  await district.save();
  return d_next_deliver_o_id;
}

async function deliveryDistrict(w_id, d_id, carrier_id) {
  const orderIdToDeliver = await getOrderToDeliverAndupdateDistrict(w_id, d_id);
  if (!orderIdToDeliver) {
    return;
  }

  const order = await Order.findOne({
    o_w_id: w_id,
    o_d_id: d_id,
    o_id: orderIdToDeliver,
  });
  if (!order) {
    return;
  }
  order.o_delivery_d = new Date().toString();
  order.o_carrier_id = carrier_id;
  await order.save();

  const customer = await Customer.findOne({
    c_w_id: w_id,
    c_d_id: d_id,
    c_id: order.o_c_id,
  });
  if (customer) {
    const totalAmount = order.o_order_lines.reduce(
      (total, orderline) => total + orderline.ol_amount,
      0,
    );
    customer.c_balance += totalAmount;
    customer.c_delivery_cnt += 1;
    await customer.save();
  }
}

async function delivery(w_id, carrier_id) {
  try {
    const jobs = [];
    for (let i = 1; i < 11; i++) {
      jobs.push(deliveryDistrict(w_id, i, carrier_id));
    }
    await Promise.all(jobs);
  } catch (err) {
    return err;
  }
}

export default delivery;
