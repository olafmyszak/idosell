import express from "express";
import { getOrdersData, ordersToCSV } from "../service/order.service.js";

const router = express.Router();

// 5 min
router.get("/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
    const order = getOrdersData().find((o) => o.orderID === orderId);

    if (!order) {
        return res.status(404).json({ error: `Order ${orderId} not found` });
    }

    res.json(order);
})

// 10 min
router.get("/", async (req, res) => {
    const minWorth = Number(req.query.minWorth);
    const maxWorth = Number(req.query.maxWorth);

    let filtered = getOrdersData();

    if (!Number.isNaN(minWorth)) {
        filtered = filtered.filter((entry) => entry.orderWorth >= minWorth);
    }

    if (!Number.isNaN(maxWorth)) {
        filtered = filtered.filter((entry) => entry.orderWorth <= maxWorth);
    }

    const csvContent = ordersToCSV(filtered);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="orders_${Date.now()}.csv"`
    );
    res.send(csvContent);
});

export default router;