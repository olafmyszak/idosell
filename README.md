## Installation

1. Clone the repository:

```bash
git clone https://github.com/olafmyszak/idosell.git
cd idosell
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the root directory:

```env
API_URL=your_api_url_here
API_KEY=your_api_key_here
```

4. Start the server with:

```bash
npm run start
```

By default, the server runs at http://localhost:3000.

## API Endpoints

| Method | Endpoint           | Description                                                                                                                   |
| ------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/orders`          | Returns a list of orders in CSV. Accepts optional `minWorth` and `maxWorth` query parameters to filter orders by total worth. |
| GET    | `/orders/:orderId` | Returns a single order by ID in JSON .                                                                                        |

### /orders – Query Parameters

`minWorth (optional)`: Minimum orderWorth value to include.

`maxWorth (optional)`: Maximum orderWorth value to include.

#### Example request:

```http
GET /orders?minWorth=100&maxWorth=500
Authorization: Basic <base64-encoded-credentials>
Accept: text/csv
```

#### Response: A CSV-formatted list of orders matching the filter.

Each order object has the following structure (before CSV formatting):

```json
{
  "orderID": "orderId",
  "products": [
    {
      "productID": 123,
      "quantity": 1
    }
  ],
  "orderWorth": 200
}
```

## Testing

This project uses Jest and Supertest for integration testing.

To run tests:

```bash
npm test
```
