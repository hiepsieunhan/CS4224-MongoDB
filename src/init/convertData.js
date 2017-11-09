import fs from "fs";
import readline from "readline";
import stream from "stream";

const { DATA_DIR } = process.env;

if (!DATA_DIR) {
  console.error("Data dir is not provided!");
  process.exit(1);
}

/**
 * Utils methods
 */

async function writeToJSONFile(data, filename) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data), function(err) {
      if (err) {
        console.error(`Can not save ${filename}! - error `, err);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function readFile(filename) {
  return new Promise((resolve, reject) => {
    let data = [];
    const instream = fs.createReadStream(filename);
    const rl = readline.createInterface({
      input: instream,
    });
    rl.on("line", function(line) {
      if (line.length) {
        data.push(line);
      }
    });

    rl.on("close", function() {
      console.log("Finish", data.length);
      resolve(data);
    });
  });
}

/**
 * Read csv and convert into JSON methods
 */

// Note that this method does not write to file
async function convertOrderLines() {
  try {
    const rows = await readFile(`${DATA_DIR}/tmp-order-line.csv`);
    const orderLines = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 11) {
          return null;
        }
        return {
          ol_w_id: parseInt(values[0]) || 0,
          ol_d_id: parseInt(values[1]) || 0,
          ol_o_id: parseInt(values[2]) || 0,
          ol_number: parseInt(values[3]) || 0,
          ol_i_id: parseInt(values[4]) || 0,
          ol_delivery_d: values[5],
          ol_amount: parseFloat(values[6]) || 0,
          ol_supply_w_id: parseInt(values[7]) || 0,
          ol_quantity: parseFloat(values[8]) || 0,
          ol_dist_info: values[9],
          ol_i_name: values[10],
        };
      })
      .filename(row => row);
    return orderLines;
  } catch (err) {
    process.exit(1);
  }
}

// Put in all order lines into its corresponding orders.
async function fixOrders(orders) {
  const orderLines = await convertOrderLines();
  const orderMap = new Map();
  // put all orders into map
  orders.forEach(order => {
    const { o_w_id, o_d_id, o_id } = order;
    const key = `${o_w_id}_${o_d_id}_${o_id}`;
    orderMap.set(key, order);
  });
  orderLines.forEach(orderLine => {
    const { ol_w_id, ol_d_id, ol_o_id, ol_delivery_d, ...rest } = orderLine;
    const key = `${ol_w_id}_${ol_d_id}_${ol_o_id}`;
    const order = orderMap.get(key);
    if (!order) {
      return;
    }
    // If this is the first order line of this order
    if (!order.o_order_lines) {
      order.o_order_lines = [];
      order.o_delivery_d = ol_delivery_d;
    }
    order.o_order_lines.push({ ...rest });
  });
  return orders;
}

async function convertOrders() {
  try {
    const rows = await readFile(`${DATA_DIR}/order.csv`);
    const orders = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 8) {
          return null;
        }
        return {
          o_w_id: parseInt(values[0]) || 0,
          o_d_id: parseInt(values[1]) || 0,
          o_id: parseInt(values[2]) || 0,
          o_c_id: parseInt(values[3]) || 0,
          o_carrier_id: parseInt(values[4]) || 0,
          o_ol_cnt: parseInt(values[5]) || 0,
          o_all_local: parseInt(values[6]) || 0,
          o_entry_d: values[7],
          o_delivery_d: "",
        };
      })
      .filename(row => row);

    const fixedOrders = await fixOrders(orders);
    await writeToJSONFile(fixedOrders, `${DATA_DIR}/orders.json`);
    return fixedOrders;
  } catch (err) {
    process.exit(1);
  }
}

// Fix the value of d_next_deliver_o_id
async function fixDistricts(districts) {
  const orders = await convertOrders();
  const districtMap = new Map();
  districts.forEach(district => {
    const key = `${district.d_w_id}_${district.d_id}`;
    districtMap.set(key, district);
  });
  orders.forEach(order => {
    const key = `${order.o_w_id}_${order.o_d_id}`;
    if (order.o_carrier_id) {
      const district = districtMap.get(key);
      if (district) {
        district.d_next_deliver_o_id += 1;
      }
    }
  });
  return districts;
}

async function convertWarehouses() {
  try {
    const rows = await readFile(`${DATA_DIR}/warehouse.csv`);
    const warehouses = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 9) {
          return null;
        }
        return {
          w_id: parseInt(values[0]) || 0,
          w_name: values[1],
          w_street_1: values[2],
          w_street_2: values[3],
          w_city: values[4],
          w_state: values[5],
          w_zip: values[6],
          w_tax: parseFloat(values[7]) || 0,
          w_ytd: parseFloat(values[8]) || 0,
        };
      })
      .filter(row => row);

    await writeToJSONFile(warehouses, `${DATA_DIR}/warehouse.json`);
    return warehouses;
  } catch (err) {
    process.exit(1);
  }
}

async function convertDistricts() {
  try {
    const rows = await readFile(`${DATA_DIR}/district.csv`);
    const districts = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 11) {
          return null;
        }
        return {
          d_w_id: parseInt(values[0]) || 0,
          d_id: parseInt(values[1]) || 0,
          d_name: values[2],
          d_street_1: values[3],
          d_street_2: values[4],
          d_city: values[5],
          d_state: values[6],
          d_zip: values[7],
          d_tax: parseFloat(values[8]) || 0,
          d_ytd: parseFloat(values[9]) || 0,
          d_next_o_id: parseInt(values[10]) || 0,
          // TODO: fix this value after store order
          d_next_deliver_o_id: 0,
        };
      })
      .filter(row => row);

    const fixedDistricts = fixDistricts(districts);

    await writeToJSONFile(fixedDistricts, `${DATA_DIR}/district.json`);
    return fixedDistricts;
  } catch (err) {
    process.exit(1);
  }
}

async function convertCustomers() {
  try {
    const rows = await readFile(`${DATA_DIR}/customer.csv`);
    const customers = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 21) {
          return null;
        }
        return {
          c_w_id: parseInt(values[0]) || 0,
          c_d_id: parseInt(values[1]) || 0,
          c_id: parseInt(values[2]) || 0,
          c_first: values[3],
          c_middle: values[4],
          c_last: values[5],
          c_street_1: values[6],
          c_street_2: values[7],
          c_city: values[8],
          c_state: values[9],
          c_zip: values[10],
          c_phone: values[11],
          c_since: values[12],
          c_credit: values[13],
          c_credit_limit: parseFloat(values[14]) || 0,
          c_discount: parseFloat(values[15]) || 0,
          c_balance: parseFloat(values[16]) || 0,
          c_ytd_payment: parseFloat(values[17]) || 0,
          c_payment_cnt: parseInt(values[18]) || 0,
          c_delivery_cnt: parseInt(values[19]) || 0,
          c_data: values[20],
        };
      })
      .filter(row => row);

    await writeToJSONFile(customers, `${DATA_DIR}/customer.json`);
    return customers;
  } catch (err) {
    process.exit(1);
  }
}

async function convertItems() {
  try {
    const rows = await readFile(`${DATA_DIR}/item.csv`);
    const items = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 5) {
          return null;
        }
        return {
          i_id: parseInt(values[0]) || 0,
          i_name: values[1],
          i_price: parseFloat(values[2]) || 0,
          i_im_id: parseInt(values[3]),
          i_data: values[4],
        };
      })
      .filter(row => row);

    await writeToJSONFile(items, `${DATA_DIR}/item.json`);
    return items;
  } catch (err) {
    process.exit(1);
  }
}

// Note that this method read from tmp_stock.csv where the item name and item price are added
async function convertStocks() {
  try {
    const rows = await readFile(`${DATA_DIR}/tmp-stock.csv`);
    const stocks = rows
      .map(row => {
        const values = row.split(",");
        if (values.length != 19) {
          return null;
        }
        return {
          s_w_id: parseInt(values[0]) || 0,
          s_i_id: parseInt(values[1]) || 0,
          s_quantity: parseFloat(values[2]) || 0,
          s_ytd: parseFloat(values[3]) || 0,
          s_order_cnt: parseInt(values[4]) || 0,
          s_remote_cnt: parseInt(values[5]) || 0,
          s_dist_01: values[6],
          s_dist_02: values[7],
          s_dist_03: values[8],
          s_dist_04: values[9],
          s_dist_05: values[10],
          s_dist_06: values[11],
          s_dist_07: values[12],
          s_dist_08: values[13],
          s_dist_09: values[14],
          s_dist_10: values[15],
          s_data: values[16],
          s_i_name: values[17],
          s_i_price: parseFloat(values[18]) || 0,
        };
      })
      .filter(row => row);

    await writeToJSONFile(stocks, `${DATA_DIR}/stocks.json`);
    return stocks;
  } catch (err) {
    process.exit(1);
  }
}

convertWarehouses();
convertCustomers();
convertDistricts();
convertItems();
convertStocks();
