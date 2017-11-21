import Customer from "../models/Customer";
import Warehouse from "../models/Warehouse";
import District from "../models/District";
import pick from "lodash.pick";

async function getTopBalanceCustomer() {
  const customers = await Customer.find()
    .sort({ c_balance: -1 })
    .limit(1);
  return customers && customers.length > 0 ? customers[0] : null;
}

async function topBalance() {
  const customer = await getTopBalanceCustomer();
  if (!customer) {
    return null;
  }
  const { c_w_id, c_d_id } = customer;
  const warehouse = await Warehouse.findOne({ w_id: c_w_id });
  const district = await District.findOne({ d_w_id: c_w_id, d_id: c_d_id });
  if (!warehouse || !district) {
    return null;
  }
  return {
    ...pick(customer, ["c_first", "c_middle", "c_last", "c_balance"]),
    w_name: warehouse.w_name,
    d_name: district.d_name,
  };
}

export default topBalance;
