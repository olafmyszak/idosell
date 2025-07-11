import express from "express";
import ordersRouter from "./route/orders.route.js";
import expressBasicAuth from "express-basic-auth";

const app = express();

app.use(express.json());
app.use(
    expressBasicAuth({
        users: { admin: "admin" },
    })
);
app.use("/orders", ordersRouter);

export default app;
