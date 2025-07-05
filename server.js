import app from "./app.js";
import { fetchOrders } from "./service/orders.service.js";

const port = 3000;

fetchOrders().then(
  console.log(`Fetched orders data at ${new Date().toLocaleString()}`)
);

// Fetch data daily
setInterval(() => {
  fetchOrders().then(
    console.log(`Fetched orders data at ${new Date().toLocaleString()}`)
  );
}, 24 * 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
