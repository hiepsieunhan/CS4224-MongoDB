import fs, { write } from "fs";
import readline from "readline";
import { toASCII } from "punycode";
import { resolve } from "path";
import { print } from "util";

const { DATA_DIR } = process.env;

if (!DATA_DIR) {
  console.error("Data dir is not provided!");
  process.exit(1);
}

/**
 * Utils methods
 */

const getFileNameFromDir = fileDir => {
  const tokens = fileDir.split("/");
  return tokens.length ? tokens[tokens.length - 1] : fileDir;
};

async function convertCSVtoJSON(inputFileDir, outputFileDir, modelConvert) {
  return new Promise((resolve, reject) => {
    const outputStream = fs.createWriteStream(outputFileDir);
    outputStream.write("[\n");
    let isFirstElement = true;
    const inputStream = fs.createReadStream(inputFileDir);
    const rl = readline.createInterface({
      input: inputStream,
    });
    rl.on("line", function(line) {
      const model = modelConvert(line);
      if (model) {
        let convertedLine = JSON.stringify(model);
        if (!isFirstElement) {
          convertedLine = ",\n" + convertedLine;
        } else {
          isFirstElement = false;
        }
        outputStream.write(convertedLine);
      }
    });

    rl.on("close", function() {
      console.log(
        `Finish convert ${getFileNameFromDir(
          inputFileDir,
        )} to ${getFileNameFromDir(outputFileDir)}`,
      );
      outputStream.write("\n]");
      outputStream.end();
      resolve();
    });
  });
}

/**
 *  Normal convert CSV to JSON methods
 */

async function convertWarehouses() {
  const convertModel = row => {
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
  };

  await convertCSVtoJSON(
    `${DATA_DIR}/warehouse.csv`,
    `${DATA_DIR}/warehouse.json`,
    convertModel,
  );
}

async function convertCustomers() {
  const convertModel = row => {
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
  };
  await convertCSVtoJSON(
    `${DATA_DIR}/customer.csv`,
    `${DATA_DIR}/customer.json`,
    convertModel,
  );
}

async function convertItems() {
  const convertModel = row => {
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
  };

  await convertCSVtoJSON(
    `${DATA_DIR}/item.csv`,
    `${DATA_DIR}/item.json`,
    convertModel,
  );
}

// Note that this method read from tmp-stock.csv where the item name and item price are added
async function convertStocks() {
  const convertModel = row => {
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
  };
  await convertCSVtoJSON(
    `${DATA_DIR}/tmp-stock.csv`,
    `${DATA_DIR}/stock.json`,
    convertModel,
  );
}

/**
 * Special methods:
 *  - Fix Order by adding Order Lines and then write to JSON
 *  - Fix District by countint number of delivered orders then write to JSOn
 */

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
      resolve(data);
    });
  });
}

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

const orderlineModelConvert = row => {
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
};

const orderModelConvert = row => {
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
};

// Fix the value of d_next_deliver_o_id
async function fixDistricts(districts) {
  return new Promise((resolve, reject) => {
    const districtMap = new Map();
    districts.forEach(district => {
      const key = `${district.d_w_id}_${district.d_id}`;
      districtMap.set(key, district);
    });

    const inputStream = fs.createReadStream(`${DATA_DIR}/tmp-order.csv`);
    const rl = readline.createInterface({
      input: inputStream,
    });
    rl.on("line", function(line) {
      const order = orderModelConvert(line);
      if (order) {
        const key = `${order.o_w_id}_${order.o_d_id}`;
        if (order.o_carrier_id) {
          const district = districtMap.get(key);
          if (district) {
            district.d_next_deliver_o_id += 1;
          }
        }
      }
    });
    rl.on("close", function() {
      resolve(districts);
    });
  });
}

async function convertDistricts() {
  try {
    // Note: We can read the whole file district as the number of district is small
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

    const fixedDistricts = await fixDistricts(districts);

    await writeToJSONFile(fixedDistricts, `${DATA_DIR}/district.json`);
    console.log(
      "Finish convert district.csv to district.json by fixing value next_deliver_o_id",
    );
  } catch (err) {
    process.exit(1);
  }
}

// Note: This method is very complicated because we need to read 2 large file parallel...
async function convertOrders() {
  return new Promise((resolve, reject) => {
    const outputStream = fs.createWriteStream(`${DATA_DIR}/order.json`);
    outputStream.write("[\n");
    let isFirstElement = true;

    const orderlineStream = fs.createReadStream(
      `${DATA_DIR}/tmp-order-line.csv`,
    );
    const orderStream = fs.createReadStream(`${DATA_DIR}/tmp-order.csv`);

    const orderlineRl = readline.createInterface({
      input: orderlineStream,
    });
    orderlineRl.pause();

    const orderRl = readline.createInterface({
      input: orderStream,
    });

    let currentOrder = null;
    let currentOrderlineToRead = 0;

    const finishConvertCurrentOrder = () => {
      if (!currentOrder || currentOrderlineToRead != 0) {
        return;
      }

      let convertedLine = JSON.stringify(currentOrder);
      if (!isFirstElement) {
        convertedLine = ",\n" + convertedLine;
      } else {
        isFirstElement = false;
      }
      outputStream.write(convertedLine);

      orderRl.resume();
    };

    const processOrderLine = line => {
      if (!currentOrder || currentOrderlineToRead <= 0) {
        return;
      }
      const order = currentOrder;
      const orderline = orderlineModelConvert(line);
      if (orderline) {
        const { ol_delivery_d, ol_w_id, ol_d_id, ol_o_id, ...rest } = orderline;
        if (
          ol_w_id != order.o_w_id ||
          ol_d_id != order.o_d_id ||
          ol_o_id != order.o_id
        ) {
          throw new Error(
            "Order and order-lines are not matching",
            ol_w_id,
            ol_d_id,
            ol_o_id,
            order.o_w_id,
            order.o_d_id,
            order.o_id,
          );
        }
        // Assign delivery_d into order and remove from all orderlines
        order.o_delivery_d = ol_delivery_d;
        order.o_order_lines.push({ ...rest });
      }
      currentOrderlineToRead -= 1;
      if (currentOrderlineToRead > 0) {
        orderlineRl.resume();
      } else {
        finishConvertCurrentOrder();
      }
    };

    const processOrder = line => {
      currentOrder = orderModelConvert(line);
      if (currentOrder) {
        currentOrder.o_order_lines = [];
        currentOrderlineToRead = currentOrder.o_ol_cnt;
        if ((currentOrderlineToRead = 0)) {
          finishConvertCurrentOrder();
        }
      }
    };

    orderlineRl.on("line", line => {
      orderlineRl.pause();
      processOrderLine(line);
    });

    orderRl.on("line", line => {
      orderRl.pause();
      processOrder(line);
    });

    orderRl.on("close", () => {
      orderlineRl.close();
      outputStream.write("\n]");
      outputStream.end();
      console.log(
        "Finish convert tmp-order.csv to order.json by embeding ordr-lines",
      );
      resolve();
    });
  });
}

convertWarehouses();
convertDistricts();
convertCustomers();
convertOrders();
convertItems();
convertStocks();
