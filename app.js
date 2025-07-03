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

      result.push(...filtered);

      // Fetch data untill all pages were read
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

let ordersData = null;
getOrders().then((data) => {
  ordersData = data
  console.log("Fetched orders data");
})

// Update daily
setInterval(async () => {
  data = await getOrders();

}, 24 * 60 * 60 * 1000);

function ordersToCSV(orders) {
  const csvRows = [];

  csvRows.push('Order ID,Product ID,Quantity,Order Worth');

  orders.forEach(order => {
    order.products.forEach(product => {
      csvRows.push(`${order.orderID},${product.productID},${product.quantity},${order.orderWorth}`);
    });
  });

  return csvRows.join('\n');
}

app.get('/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const order = ordersData.find(o => o.orderID === orderId);

  if (!order) {
    return res.status(404).json({ error: `Order ${orderId} not found` })
  }

  res.json(order);
})

app.get('/orders', (req, res) => {
  const { minWorth, maxWorth } = req.query;

  const filtered = structuredClone(ordersData);

  if(minWorth){

  }

  const csvContent = ordersToCSV(ordersData);



  res.setHeader('Content-Type', 'text/plain');
  res.send(csvContent);
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});

