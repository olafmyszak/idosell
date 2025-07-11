import { config } from "dotenv";
import Database from "better-sqlite3";

// Load .env
config();

const db = new Database("data.db");
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        orderID TEXT PRIMARY KEY,
        products TEXT,
        orderWorth REAL
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS fetch_log (
        id INTEGER PRIMARY KEY,
        last_fetch_timestamp INTEGER NOT NULL
    );
`);

export function getOrderById(orderId) {
  const getOrder = db.prepare("SELECT * FROM orders WHERE orderID = ?");
  const order = getOrder.get(orderId);

  if (!order) {
    return null;
  }

  return {
    orderID: order.orderID,
    products: JSON.parse(order.products),
    orderWorth: order.orderWorth,
  };
}

export function getAllOrders() {
  let orders = db.prepare("SELECT * FROM orders").all();

  orders = orders.map((row) => ({
    orderID: row.orderID,
    products: JSON.parse(row.products),
    orderWorth: row.orderWorth,
  }));

  return orders;
}

// 1h
export async function fetchOrders(interval) {
  if (!shouldFetch(interval)) {
    return;
  }

  const url = `https://${process.env.API_URL}/api/admin/v5/orders/orders/search`;

  let page = 0;

  while (true) {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.API_KEY,
      },
      body: JSON.stringify({
        params: {
          ordersStatuses: [
            "finished",
            "on_order",
            "packed",
            "ready",
            "delivery_waiting",
            "finished_ext",
          ],
          resultsPage: page,
        },
      }),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    // Filter entries with null or empty products and extract relevant data
    const filtered = Object.values(json.Results)
      .filter((entry) => {
        const products = entry.orderDetails?.productsResults;
        return products && Array.isArray(products) && products.length > 0;
      })
      .map((entry) => ({
        orderID: entry.orderId,
        products: entry.orderDetails.productsResults.map((product) => ({
          productID: product.productId,
          quantity: product.productQuantity,
        })),
        orderWorth:
          entry.orderDetails.payments.orderBaseCurrency.orderProductsCost,
      }));

    const insert = db.prepare(`
                      INSERT OR REPLACE INTO orders (orderID, products, orderWorth)
                      VALUES (?, ?, ?)
                      `);

    const insertMany = db.transaction((orders) => {
      for (const order of orders) {
        insert.run(
          order.orderID,
          JSON.stringify(order.products),
          order.orderWorth
        );
      }
    });

    insertMany(filtered);

    // Fetch data untill all pages were read
    ++page;
    if (page >= json.resultsNumberPage) {
      break;
    }
  }

  updateFetchLog();
  console.log(`Fetched orders data at ${new Date().toLocaleString()}`);
}

// 20 min
export function ordersToCSV(orders) {
  const csvRows = [];

  csvRows.push("Order ID,Product ID,Quantity,Order Worth");

  orders.forEach((order) => {
    order.products.forEach((product) => {
      csvRows.push(
        `${order.orderID},${product.productID},${product.quantity},${order.orderWorth}`
      );
    });
  });

  return csvRows.join("\n");
}

function getLastFetchTimestamp() {
  const row = db
    .prepare(
      `
      SELECT last_fetch_timestamp FROM fetch_log ORDER BY id DESC LIMIT 1
    `
    )
    .get();

  return row?.last_fetch_timestamp;
}

function updateFetchLog() {
  const timestamp = Date.now();

  const insert = db.prepare(
    `INSERT INTO fetch_log (last_fetch_timestamp) VALUES (?)`
  );

  insert.run(timestamp);
}

function shouldFetch(interval) {
  const lastFetch = getLastFetchTimestamp();

  if (!lastFetch) {
    return true;
  }

  const now = Date.now();
  if (now - lastFetch < interval) {
    console.log("Orders fetched already within the specified time interval");
    return false;
  }

  return true;
}
