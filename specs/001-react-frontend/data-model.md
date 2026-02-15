# Data Model: React Frontend Conversion

**Feature**: 001-react-frontend  
**Date**: 2026-01-15  
**Status**: Complete

## Overview

This document defines the data model for the React frontend application. It includes all entities, their fields, relationships, validation rules, and state transitions based on the feature specification and requirements.

---

## Entity Definitions

### 1. User

**Description**: Represents a person who can authenticate and access the system.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique user identifier (UUID) | UUID format |
| email | string | Yes | User email address | Valid email format, unique |
| password | string | Yes | User password (hashed) | Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number |
| name | string | Yes | User's full name | Min 2 chars, max 100 chars |
| role | enum | Yes | User role (seller or buyer) | Must be 'seller' or 'buyer' |
| avatarUrl | string | No | Profile picture URL | Valid URL or null |
| phone | string | No | Phone number | Valid phone format or null |
| createdAt | datetime | Yes | Account creation timestamp | ISO 8601 format |
| updatedAt | datetime | Yes | Last update timestamp | ISO 8601 format |
| isActive | boolean | Yes | Account active status | true or false |

**Relationships**:
- One-to-Many with Product (as seller)
- One-to-Many with Purchase (as buyer)

**Validation Rules**:
- Email must be unique
- Password must meet complexity requirements
- Name cannot be empty
- Role must be either 'seller' or 'buyer'

**State Transitions**:
- `pending` → `active` (on email verification)
- `active` → `inactive` (on account deactivation)
- `inactive` → `active` (on account reactivation)

---

### 2. Authentication Session

**Description**: Represents an active user session after successful login.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| sessionId | string | Yes | Unique session identifier (UUID) | UUID format |
| userId | string | Yes | Reference to User | Valid user ID |
| token | string | Yes | Authentication token | JWT or session token |
| expiresAt | datetime | Yes | Session expiration time | ISO 8601 format |
| createdAt | datetime | Yes | Session creation timestamp | ISO 8601 format |
| deviceInfo | object | No | Device/browser information | JSON object or null |

**Relationships**:
- Many-to-One with User

**Validation Rules**:
- Session ID must be unique
- Token must be valid and not expired
- User ID must reference an existing user

**State Transitions**:
- `active` → `expired` (on expiration)
- `active` → `terminated` (on logout)

---

### 3. Product

**Description**: Represents an item for sale at a garage sale.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique product identifier (UUID) | UUID format |
| sellerId | string | Yes | Reference to seller User | Valid user ID |
| name | string | Yes | Product name | Min 3 chars, max 200 chars |
| description | string | Yes | Product description | Min 10 chars, max 2000 chars |
| price | number | Yes | Product price | Positive number, max 2 decimal places |
| currency | string | Yes | Currency code | ISO 4217 format (e.g., BRL, USD) |
| imageUrl | string | No | Product image URL | Valid URL or null |
| qrCode | string | Yes | QR code data | Unique string |
| qrCodeUrl | string | No | QR code image URL | Valid URL or null |
| category | string | No | Product category | Predefined category or null |
| condition | enum | No | Product condition | 'new', 'like-new', 'good', 'fair', 'poor' |
| isAvailable | boolean | Yes | Availability status | true or false |
| isSold | boolean | Yes | Sold status | true or false |
| createdAt | datetime | Yes | Product creation timestamp | ISO 8601 format |
| updatedAt | datetime | Yes | Last update timestamp | ISO 8601 format |

**Relationships**:
- Many-to-One with User (seller)
- One-to-Many with Purchase

**Validation Rules**:
- Product ID must be unique
- QR code must be unique
- Price must be positive
- Seller must have role 'seller'

**State Transitions**:
- `available` → `sold` (on purchase)
- `sold` → `available` (on cancellation - if allowed)
- `available` → `unavailable` (on seller action)

---

### 4. Purchase

**Description**: Represents a completed transaction where a buyer purchased a product.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique purchase identifier (UUID) | UUID format |
| productId | string | Yes | Reference to Product | Valid product ID |
| buyerId | string | Yes | Reference to buyer User | Valid user ID |
| sellerId | string | Yes | Reference to seller User | Valid user ID |
| price | number | Yes | Purchase price | Positive number, max 2 decimal places |
| currency | string | Yes | Currency code | ISO 4217 format |
| purchaseDate | datetime | Yes | Purchase timestamp | ISO 8601 format |
| status | enum | Yes | Purchase status | 'pending', 'completed', 'cancelled', 'refunded' |
| paymentMethod | string | No | Payment method | 'cash', 'card', 'pix', 'other' |
| notes | string | No | Additional notes | Max 500 chars |
| qrCodeScanned | boolean | Yes | QR code scanned flag | true or false |

**Relationships**:
- Many-to-One with Product
- Many-to-One with User (buyer)
- Many-to-One with User (seller)

**Validation Rules**:
- Purchase ID must be unique
- Product must be available at time of purchase
- Buyer and seller must be different users
- Buyer must have role 'buyer'
- Seller must have role 'seller'

**State Transitions**:
- `pending` → `completed` (on confirmation)
- `pending` → `cancelled` (on cancellation)
- `completed` → `refunded` (on refund - if allowed)

---

### 5. QR Code

**Description**: Represents a unique code associated with a product for scanning at physical garage sales.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique QR code identifier (UUID) | UUID format |
| productId | string | Yes | Reference to Product | Valid product ID |
| code | string | Yes | QR code data | Unique string |
| imageUrl | string | No | QR code image URL | Valid URL or null |
| generatedAt | datetime | Yes | Generation timestamp | ISO 8601 format |
| expiresAt | datetime | No | Expiration timestamp | ISO 8601 format or null |
| scanCount | number | Yes | Number of times scanned | Non-negative integer |

**Relationships**:
- Many-to-One with Product

**Validation Rules**:
- QR code ID must be unique
- Code must be unique
- Product must exist
- Scan count cannot be negative

---

### 6. Dashboard Page

**Description**: Represents a page within the buyer or seller dashboard accessible via sidebar navigation.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique page identifier | Unique string |
| dashboardType | enum | Yes | Dashboard type | 'seller' or 'buyer' |
| path | string | Yes | Route path | Valid route path |
| title | string | Yes | Page title | Min 2 chars, max 50 chars |
| icon | string | Yes | Icon name | Valid icon identifier |
| order | number | Yes | Display order in sidebar | Positive integer |
| isVisible | boolean | Yes | Visibility flag | true or false |

**Validation Rules**:
- Page ID must be unique per dashboard type
- Path must be unique
- Order must be unique per dashboard type

**Predefined Pages**:

**Seller Dashboard Pages**:
1. Dashboard (`/seller/dashboard`) - Overview and statistics
2. Products (`/seller/products`) - Product management
3. Sales (`/seller/sales`) - Sales history
4. QR Codes (`/seller/qr-codes`) - QR code generation
5. Analytics (`/seller/analytics`) - Performance analytics
6. Settings (`/seller/settings`) - Account settings

**Buyer Dashboard Pages**:
1. QR Scanner (`/buyer/qr-scanner`) - QR code scanning
2. My Purchases (`/buyer/purchases`) - Purchase history
3. Profile Settings (`/buyer/profile`) - Profile configuration
4. History (`/buyer/history`) - Transaction history

---

### 7. Navigation Item

**Description**: Represents an item in the sidebar navigation menu.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique navigation item identifier | Unique string |
| dashboardType | enum | Yes | Dashboard type | 'seller' or 'buyer' |
| label | string | Yes | Display label | Min 2 chars, max 30 chars |
| path | string | Yes | Target route path | Valid route path |
| icon | string | Yes | Icon name | Valid icon identifier |
| order | number | Yes | Display order | Positive integer |
| isActive | boolean | Yes | Active state flag | true or false |
| isDisabled | boolean | Yes | Disabled state flag | true or false |

**Validation Rules**:
- Navigation item ID must be unique
- Path must be valid
- Order must be unique per dashboard type

---

### 8. Testimonial

**Description**: Represents user feedback displayed on the landing page.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique testimonial identifier (UUID) | UUID format |
| userId | string | Yes | Reference to User | Valid user ID |
| userName | string | Yes | User's display name | Min 2 chars, max 100 chars |
| userAvatarUrl | string | No | User avatar URL | Valid URL or null |
| content | string | Yes | Testimonial content | Min 20 chars, max 500 chars |
| rating | number | Yes | User rating | Integer 1-5 |
| isFeatured | boolean | Yes | Featured flag | true or false |
| isVisible | boolean | Yes | Visibility flag | true or false |
| createdAt | datetime | Yes | Creation timestamp | ISO 8601 format |

**Relationships**:
- Many-to-One with User

**Validation Rules**:
- Testimonial ID must be unique
- Rating must be between 1 and 5
- Content cannot be empty

---

### 9. Analytics Data

**Description**: Represents analytics data for seller dashboard.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique analytics identifier (UUID) | UUID format |
| sellerId | string | Yes | Reference to seller User | Valid user ID |
| period | enum | Yes | Time period | 'daily', 'weekly', 'monthly', 'yearly' |
| startDate | datetime | Yes | Period start date | ISO 8601 format |
| endDate | datetime | Yes | Period end date | ISO 8601 format |
| totalSales | number | Yes | Total sales count | Non-negative integer |
| totalRevenue | number | Yes | Total revenue | Non-negative number |
| averagePrice | number | Yes | Average product price | Non-negative number |
| productsSold | number | Yes | Products sold count | Non-negative integer |
| productsListed | number | Yes | Products listed count | Non-negative integer |
| uniqueBuyers | number | Yes | Unique buyers count | Non-negative integer |

**Relationships**:
- Many-to-One with User (seller)

**Validation Rules**:
- Analytics ID must be unique
- Start date must be before end date
- All numeric values must be non-negative

---

### 10. Notification

**Description**: Represents a system notification for users.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique notification identifier (UUID) | UUID format |
| userId | string | Yes | Reference to User | Valid user ID |
| type | enum | Yes | Notification type | 'info', 'success', 'warning', 'error' |
| title | string | Yes | Notification title | Min 2 chars, max 100 chars |
| message | string | Yes | Notification message | Min 5 chars, max 500 chars |
| isRead | boolean | Yes | Read status flag | true or false |
| createdAt | datetime | Yes | Creation timestamp | ISO 8601 format |
| actionUrl | string | No | Action URL | Valid URL or null |

**Relationships**:
- Many-to-One with User

**Validation Rules**:
- Notification ID must be unique
- Type must be one of the predefined values
- Title and message cannot be empty

---

## Entity Relationships Diagram

```
User (1) ----< (N) Product
User (1) ----< (N) Purchase (as buyer)
User (1) ----< (N) Purchase (as seller)
User (1) ----< (N) Authentication Session
User (1) ----< (N) Testimonial
User (1) ----< (N) Analytics Data
User (1) ----< (N) Notification

Product (1) ----< (N) Purchase
Product (1) ----< (1) QR Code
```

---

## State Machine Definitions

### User Account State

```
[pending] --email verified--> [active]
[active] --deactivated--> [inactive]
[inactive] --reactivated--> [active]
```

### Authentication Session State

```
[active] --expired--> [expired]
[active] --logout--> [terminated]
```

### Product State

```
[available] --sold--> [sold]
[available] --unlisted--> [unavailable]
[sold] --cancelled--> [available] (if allowed)
[unavailable] --relisted--> [available]
```

### Purchase State

```
[pending] --confirmed--> [completed]
[pending] --cancelled--> [cancelled]
[completed] --refunded--> [refunded]
```

---

## Validation Rules Summary

### Common Validations

| Rule | Description | Applies To |
|------|-------------|------------|
| UUID | Must be valid UUID format | All ID fields |
| Email | Must be valid email format | User.email |
| Phone | Must be valid phone format | User.phone |
| URL | Must be valid URL format | All URL fields |
| Datetime | Must be ISO 8601 format | All datetime fields |
| Positive | Must be greater than 0 | Price fields |
| Non-negative | Must be >= 0 | Count fields |
| Enum | Must be one of predefined values | All enum fields |

### Field-Specific Validations

| Entity | Field | Validation |
|--------|-------|------------|
| User | password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| User | name | Min 2 chars, max 100 chars |
| Product | name | Min 3 chars, max 200 chars |
| Product | description | Min 10 chars, max 2000 chars |
| Purchase | notes | Max 500 chars |
| Testimonial | content | Min 20 chars, max 500 chars |
| Notification | title | Min 2 chars, max 100 chars |
| Notification | message | Min 5 chars, max 500 chars |

---

## TypeScript Interfaces

```typescript
// User
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'seller' | 'buyer';
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Authentication Session
interface AuthSession {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  deviceInfo?: object;
}

// Product
interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  qrCode: string;
  qrCodeUrl?: string;
  category?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  isAvailable: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

// Purchase
interface Purchase {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  currency: string;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'pix' | 'other';
  notes?: string;
  qrCodeScanned: boolean;
}

// QR Code
interface QRCode {
  id: string;
  productId: string;
  code: string;
  imageUrl?: string;
  generatedAt: string;
  expiresAt?: string;
  scanCount: number;
}

// Dashboard Page
interface DashboardPage {
  id: string;
  dashboardType: 'seller' | 'buyer';
  path: string;
  title: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

// Navigation Item
interface NavigationItem {
  id: string;
  dashboardType: 'seller' | 'buyer';
  label: string;
  path: string;
  icon: string;
  order: number;
  isActive: boolean;
  isDisabled: boolean;
}

// Testimonial
interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  rating: number;
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string;
}

// Analytics Data
interface AnalyticsData {
  id: string;
  sellerId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  productsSold: number;
  productsListed: number;
  uniqueBuyers: number;
}

// Notification
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
```

---

## Mock Data Structure

For the initial development phase, mock data will be structured as follows:

```typescript
// Mock Users
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'seller@example.com',
    password: 'hashed_password',
    name: 'João Silva',
    role: 'seller',
    avatarUrl: '/avatars/seller-1.jpg',
    phone: '+55 11 98765-4321',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    isActive: true,
  },
  {
    id: 'user-2',
    email: 'buyer@example.com',
    password: 'hashed_password',
    name: 'Maria Santos',
    role: 'buyer',
    avatarUrl: '/avatars/buyer-1.jpg',
    phone: '+55 11 91234-5678',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    isActive: true,
  },
];

// Mock Products
const mockProducts: Product[] = [
  {
    id: 'product-1',
    sellerId: 'user-1',
    name: 'Bicicleta infantil',
    description: 'Bicicleta em ótimo estado, pouco usada.',
    price: 150.00,
    currency: 'BRL',
    imageUrl: '/products/bike.jpg',
    qrCode: 'QR-PRODUCT-1',
    qrCodeUrl: '/qr-codes/qr-product-1.png',
    category: 'Brinquedos',
    condition: 'good',
    isAvailable: true,
    isSold: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  // ... more products
];

// Mock Purchases
const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    productId: 'product-1',
    buyerId: 'user-2',
    sellerId: 'user-1',
    price: 150.00,
    currency: 'BRL',
    purchaseDate: '2026-01-15T10:30:00Z',
    status: 'completed',
    paymentMethod: 'cash',
    notes: 'Compra realizada no garage sale.',
    qrCodeScanned: true,
  },
  // ... more purchases
];

// Mock Testimonials
const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    userId: 'user-2',
    userName: 'Maria Santos',
    userAvatarUrl: '/avatars/buyer-1.jpg',
    content: 'Ótimo sistema! Consegui encontrar produtos incríveis nos garage sales da minha região.',
    rating: 5,
    isFeatured: true,
    isVisible: true,
    createdAt: '2026-01-10T00:00:00Z',
  },
  // ... more testimonials
];
```

---

## Next Steps

1. **Generate API Contracts**: Define API endpoints and request/response schemas
2. **Create Quickstart Guide**: Provide step-by-step setup instructions
3. **Update Agent Context**: Add new technologies to agent context
4. **Create Implementation Tasks**: Break down the plan into actionable tasks

---

## References

- [Feature Specification](./spec.md)
- [Research Document](./research.md)
- [Constitution](../../.specify/memory/constitution.md)
