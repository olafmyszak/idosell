import express from "express";
import { fetchOrders } from "./service/order.service.js"
import ordersRouter from "./route/order.route.js"
import expressBasicAuth from "express-basic-auth";

const app = express();
const port = 3000;

fetchOrders().then(
  console.log(`Fetched orders data at ${new Date().toLocaleString()}`)
)

// Fetch data daily
setInterval(() => {
  fetchOrders().then(
    console.log(`Fetched orders data at ${new Date().toLocaleString()}`)
  )
}, 24 * 60 * 60 * 1000);

app.use(express.json())
app.use(expressBasicAuth({
  users: { 'admin': 'admin' }
}))
app.use("/orders", ordersRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})