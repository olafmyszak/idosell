const express = require("express");
const app = express();
const port = 3000;

const dotenv = require("dotenv");
dotenv.config();

// 1h
async function getOrders() {
  const url = `https://${process.env.API_URL}/api/admin/v5/orders/orders/search`;

  let page = 0;
  const result = [];

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

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      const filtered = Object.values(json.Results)
        .filter((entry) => {
          const products = entry.orderDetails?.productsResults;
          return products;
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

      result.push(...filtered);

      ++page;

      if (page >= json.resultsNumberPage) {
        break;
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  return result;
}

getOrders().then(function (val) {
  console.dir(val, { depth: null, maxArrayLength: null });
});