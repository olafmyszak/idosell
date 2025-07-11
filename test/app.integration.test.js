import app from "../app.js";
import request from "supertest";
import { fetchOrders } from "../service/orders.service.js";

describe("Integration tests", () => {
    beforeAll(async () => {
        await fetchOrders();
    });

    const validAuth = "Basic " + Buffer.from("admin:admin").toString("base64");

    describe("GET /orders", () => {
        it("should return 200 and csv body", async () => {
            await request(app)
                .get("/orders")
                .set("Authorization", validAuth)
                .expect("Content-Type", "text/csv; charset=utf-8")
                .expect(200);
        });

        it("should return 401 with invalid auth", async () => {
            await request(app).get("/orders").expect(401);
        });
    });

    describe("GET /orders/:orderId", () => {
        const validId = "admin-3";
        const invalidId = "-1";

        it("should return 200 and json body", async () => {
            await request(app)
                .get(`/orders/${validId}`)
                .set("Authorization", validAuth)
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(200);
        });

        it("should return 401 with invalid auth", async () => {
            await request(app).get(`/orders/${validId}`);
        });

        it("should return 404 with invalid id", async () => {
            await request(app)
                .get(`/orders/${invalidId}`)
                .set("Authorization", validAuth)
                .expect(404);
        });
    });
});
