import app from "./app.js";
import { fetchOrders } from "./service/orders.service.js";

const port = 3000;
const oneDay = 24 * 60 * 60 * 1000;
const oneHour = 60 * 60 * 1000;

try {
    await fetchOrders(oneDay);
} catch (error) {
    console.error("Failed to fetch orders data:", error.message);
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

scheduleFetchOrders();

async function scheduleFetchOrders() {
    try {
        await fetchOrders(oneDay);
    } catch (error) {
        console.error("Failed to fetch orders data:", error.message);
    } finally {
        setTimeout(() => {
            scheduleFetchOrders();
        }, oneHour);
    }
}
