# API Contract: NestJS Backend

**Version**: v1
**Base URL**: `/api`

## Authentication

### Register
`POST /auth/register`
- **Body**: `{ email, password, name, role }`
- **Response**: `201 Created`
  ```json
  {
    "user": { "id": "...", "email": "..." },
    "token": "jwt_token"
  }
  ```

### Login
`POST /auth/login`
- **Body**: `{ email, password }`
- **Response**: `200 OK`
  ```json
  {
    "user": { "id": "...", "email": "..." },
    "token": "jwt_token"
  }
  ```

### Get Profile
`GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "id": "...",
    "email": "...",
    "role": "SELLER"
  }
  ```

## Products (Seller)

### List My Products
`GET /products/my-products` (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` `[ { "id": "...", "name": "..." }, ... ]`

### Create Product
`POST /products` (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Bicycle",
    "description": "Red bike",
    "price": 100.00,
    "qrCode": "GeneratedUUID"
  }
  ```
- **Response**: `201 Created` `{ "id": "..." }`

### Get Product Details
`GET /products/:id`
- **Params**: `id`
- **Response**: `200 OK` `{ "id": "...", "seller": { ... } }`

## Transactions (Sales & Purchases)

### Create Purchase (Buy Item)
`POST /sales` (Buyer only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "productId": "...",
    "qrCodeScanned": true
  }
  ```
- **Response**: `201 Created` `{ "id": "...", "status": "PENDING" }`

### Buyer History
`GET /sales/history` (Buyer only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` `[ ... ]`

### Seller Sales
`GET /sales/seller` (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` `[ ... ]`

## Analytics (Seller)

### Get Overview
`GET /analytics/overview` (Seller only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "totalSales": 10,
    "totalRevenue": 1500.00
  }
  ```
