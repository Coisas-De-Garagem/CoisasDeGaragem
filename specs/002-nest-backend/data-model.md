# Data Model: NestJS Backend (Prisma)

**Feature**: `002-nest-backend`
**Spec**: [spec.md](./spec.md)

## Overview

This schema defines the database structure for the CoisasDeGaragem backend using Prisma and PostgreSQL.

## Enums

```prisma
enum UserRole {
  BUYER
  SELLER
  ADMIN // Optional future use
}

enum ProductCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CASH
  CARD
  PIX
  OTHER
}
```

## Models

### User

Represents a system user (Buyer or Seller).

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed
  name      String
  role      UserRole
  avatarUrl String?
  phone     String?
  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  products  Product[]  @relation("SellerProducts")
  sales     Purchase[] @relation("SellerSales")
  purchases Purchase[] @relation("BuyerPurchases")
  
  // Optional: System notifications, testimonials, etc.
}
```

### Product

Represents an item for sale.

```prisma
model Product {
  id          String           @id @default(uuid())
  sellerId    String
  seller      User             @relation("SellerProducts", fields: [sellerId], references: [id])
  
  name        String
  description String
  price       Decimal          @db.Decimal(10, 2)
  currency    String           @default("BRL")
  imageUrl    String?
  
  category    String?
  condition   ProductCondition?
  
  // QR Code data (can be generated on the fly, but storing the unique code string is useful)
  qrCode      String           @unique
  
  isAvailable Boolean          @default(true)
  isSold      Boolean          @default(false)
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relations
  purchases   Purchase[]
}
```

### Purchase

Represents a transaction.

```prisma
model Purchase {
  id            String         @id @default(uuid())
  
  productId     String
  product       Product        @relation(fields: [productId], references: [id])
  
  buyerId       String
  buyer         User           @relation("BuyerPurchases", fields: [buyerId], references: [id])
  
  sellerId      String
  seller        User           @relation("SellerSales", fields: [sellerId], references: [id])
  
  price         Decimal        @db.Decimal(10, 2)
  currency      String         @default("BRL")
  
  status        PurchaseStatus @default(PENDING)
  paymentMethod PaymentMethod?
  
  purchaseDate  DateTime       @default(now())
  notes         String?
  
  qrCodeScanned Boolean        @default(false)

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

## Relationships Summary

- **User (Seller)** 1 -> N **Product**
- **User (Seller)** 1 -> N **Purchase** (Sales history)
- **User (Buyer)** 1 -> N **Purchase** (Purchase history)
- **Product** 1 -> N **Purchase** (Usually 1-1 if unique item, but 1-N if stock > 1, assuming 1 item for now so effectively 1-1 for a specific item instance, but keeping 1-N allows history if deal falls through).

## Notes

- All IDs are UUIDs.
- Prices are stored as `Decimal` to avoid floating point errors.
- Authentication will use the `User` table.
