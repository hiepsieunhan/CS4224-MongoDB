import Warehouse from "../models/Warehouse";
import District from "../models/District";
import Customer from "../models/Customer";
import pick from "lodash.pick";

async function updateWarehouse(w_id, amount) {
  const warehouse = await Warehouse.findOne({ w_id });
  if (warehouse) {
    warehouse.w_ytd += amount;
    await warehouse.save();
  }
  return warehouse;
}

async function updateDistrict(w_id, d_id, amount) {
  const district = await District.findOne({ d_w_id: w_id, d_id });
  if (district) {
    district.d_ytd += amount;
    await district.save();
  }
  return district;
}

async function updateCustomer(w_id, d_id, c_id, amount) {
  const customer = await Customer.findOne({ c_w_id: w_id, c_d_id: d_id, c_id });
  if (customer) {
    customer.c_balance -= amount;
    customer.c_ytd_payment += amount;
    customer.c_payment_cnt += 1;
    await customer.save();
  }
  return customer;
}

async function payment(w_id, d_id, c_id, amount) {
  try {
    const [warehouse, district, customer] = await Promise.all([
      updateWarehouse(w_id, amount),
      updateDistrict(w_id, d_id, amount),
      updateCustomer(w_id, d_id, c_id, amount),
    ]);
    return {
      warehouse: pick(warehouse, [
        "w_street_1",
        "w_street_2",
        "w_city",
        "w_state",
        "w_zip",
      ]),
      district: pick(district, [
        "d_street_1",
        "d_street_2",
        "d_city",
        "d_state",
        "d_zip",
      ]),
      customer: customer ? customer.toObject() : null,
      payment: amount,
    };
  } catch (err) {
    return err;
  }
}

export default payment;
