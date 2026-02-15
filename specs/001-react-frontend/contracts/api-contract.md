# API Contract: React Frontend Conversion

**Feature**: 001-react-frontend  
**Date**: 2026-01-15  
**Status**: Complete

## Overview

This document defines the API contracts for the React frontend application. Since this is a frontend-only application with mock data initially, the contracts define the expected API interface that will be implemented later. The contracts follow RESTful conventions and will be used to generate the service layer.

**Note**: For the initial development phase, all endpoints will return mock data. The actual backend implementation will follow these contracts.

---

## Base URL

```
https://api.coisasdegaragem.com/api/v1
```

**Development/Mock URL**:
```
http://localhost:3001/api/v1
```

---

## Authentication

All protected endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## API Endpoints

### Authentication Endpoints

#### POST /auth/login

Authenticate a user and return an authentication token.

**Request**:

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response** (200 OK):

```typescript
interface LoginResponse {
  success: true;
  data: {
    user: User;
    token: string;
    expiresIn: number; // seconds
  };
}
```

**Response** (401 Unauthorized):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'INVALID_CREDENTIALS';
    message: 'Invalid email or password';
  };
}
```

**Response** (400 Bad Request):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: 'Invalid request data';
    details: Record<string, string[]>;
  };
}
```

---

#### POST /auth/logout

Invalidate the current session.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response** (200 OK):

```typescript
interface LogoutResponse {
  success: true;
  message: 'Logged out successfully';
}
```

---

#### POST /auth/register

Register a new user account.

**Request**:

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'seller' | 'buyer';
  phone?: string;
}
```

**Response** (201 Created):

```typescript
interface RegisterResponse {
  success: true;
  data: {
    user: User;
    token: string;
    expiresIn: number;
  };
}
```

**Response** (409 Conflict):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'EMAIL_ALREADY_EXISTS';
    message: 'Email already registered';
  };
}
```

---

#### GET /auth/me

Get the current authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response** (200 OK):

```typescript
interface MeResponse {
  success: true;
  data: User;
}
```

**Response** (401 Unauthorized):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'UNAUTHORIZED';
    message: 'Authentication required';
  };
}
```

---

### User Endpoints

#### GET /users/:id

Get user details by ID.

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): User ID

**Request**: None

**Response** (200 OK):

```typescript
interface UserResponse {
  success: true;
  data: User;
}
```

**Response** (404 Not Found):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'USER_NOT_FOUND';
    message: 'User not found';
  };
}
```

---

#### PUT /users/:id

Update user profile.

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): User ID

**Request**:

```typescript
interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}
```

**Response** (200 OK):

```typescript
interface UpdateUserResponse {
  success: true;
  data: User;
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'You can only update your own profile';
  };
}
```

---

### Product Endpoints

#### GET /products

Get all products with optional filtering.

**Headers**: `Authorization: Bearer <token>` (optional for public products)

**Query Parameters**:
- `sellerId` (optional): Filter by seller ID
- `category` (optional): Filter by category
- `condition` (optional): Filter by condition
- `isAvailable` (optional): Filter by availability
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (createdAt, price, name)
- `sortOrder` (optional): Sort order (asc, desc)

**Request**: None

**Response** (200 OK):

```typescript
interface ProductsResponse {
  success: true;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

---

#### GET /products/:id

Get product details by ID.

**Headers**: `Authorization: Bearer <token>` (optional for public products)

**Parameters**:
- `id` (path, required): Product ID

**Request**: None

**Response** (200 OK):

```typescript
interface ProductResponse {
  success: true;
  data: Product;
}
```

**Response** (404 Not Found):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'PRODUCT_NOT_FOUND';
    message: 'Product not found';
  };
}
```

---

#### POST /products

Create a new product (seller only).

**Headers**: `Authorization: Bearer <token>`

**Request**:

```typescript
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
}
```

**Response** (201 Created):

```typescript
interface CreateProductResponse {
  success: true;
  data: Product;
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'Only sellers can create products';
  };
}
```

---

#### PUT /products/:id

Update a product (seller only).

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): Product ID

**Request**:

```typescript
interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  isAvailable?: boolean;
}
```

**Response** (200 OK):

```typescript
interface UpdateProductResponse {
  success: true;
  data: Product;
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'You can only update your own products';
  };
}
```

---

#### DELETE /products/:id

Delete a product (seller only).

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): Product ID

**Request**: None

**Response** (200 OK):

```typescript
interface DeleteProductResponse {
  success: true;
  message: 'Product deleted successfully';
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'You can only delete your own products';
  };
}
```

---

### QR Code Endpoints

#### GET /qr-codes/:productId

Get QR code for a product.

**Headers**: `Authorization: Bearer <token>` (seller only)

**Parameters**:
- `productId` (path, required): Product ID

**Request**: None

**Response** (200 OK):

```typescript
interface QRCodeResponse {
  success: true;
  data: QRCode;
}
```

**Response** (404 Not Found):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'QR_CODE_NOT_FOUND';
    message: 'QR code not found';
  };
}
```

---

#### POST /qr-codes/scan

Scan a QR code (buyer only).

**Headers**: `Authorization: Bearer <token>`

**Request**:

```typescript
interface ScanQRCodeRequest {
  qrCode: string;
}
```

**Response** (200 OK):

```typescript
interface ScanQRCodeResponse {
  success: true;
  data: {
    product: Product;
    seller: User;
  };
}
```

**Response** (404 Not Found):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'QR_CODE_INVALID';
    message: 'Invalid QR code';
  };
}
```

---

### Purchase Endpoints

#### GET /purchases

Get all purchases for the current user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Request**: None

**Response** (200 OK):

```typescript
interface PurchasesResponse {
  success: true;
  data: {
    purchases: Purchase[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

---

#### GET /purchases/:id

Get purchase details by ID.

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): Purchase ID

**Request**: None

**Response** (200 OK):

```typescript
interface PurchaseResponse {
  success: true;
  data: Purchase;
}
```

**Response** (404 Not Found):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'PURCHASE_NOT_FOUND';
    message: 'Purchase not found';
  };
}
```

---

#### POST /purchases

Create a new purchase (buyer only).

**Headers**: `Authorization: Bearer <token>`

**Request**:

```typescript
interface CreatePurchaseRequest {
  productId: string;
  qrCode: string;
  paymentMethod?: 'cash' | 'card' | 'pix' | 'other';
  notes?: string;
}
```

**Response** (201 Created):

```typescript
interface CreatePurchaseResponse {
  success: true;
  data: Purchase;
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'Only buyers can create purchases';
  };
}
```

---

### Analytics Endpoints

#### GET /analytics/seller

Get analytics data for the current seller.

**Headers**: `Authorization: Bearer <token>` (seller only)

**Query Parameters**:
- `period` (optional): Time period (daily, weekly, monthly, yearly)
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Request**: None

**Response** (200 OK):

```typescript
interface AnalyticsResponse {
  success: true;
  data: AnalyticsData;
}
```

**Response** (403 Forbidden):

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'Only sellers can access analytics';
  };
}
```

---

### Testimonial Endpoints

#### GET /testimonials

Get all testimonials (public).

**Headers**: None

**Query Parameters**:
- `isFeatured` (optional): Filter by featured status
- `isVisible` (optional): Filter by visibility status
- `limit` (optional): Items per page (default: 10)

**Request**: None

**Response** (200 OK):

```typescript
interface TestimonialsResponse {
  success: true;
  data: Testimonial[];
}
```

---

### Notification Endpoints

#### GET /notifications

Get all notifications for the current user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `isRead` (optional): Filter by read status
- `limit` (optional): Items per page (default: 20)

**Request**: None

**Response** (200 OK):

```typescript
interface NotificationsResponse {
  success: true;
  data: Notification[];
}
```

---

#### PUT /notifications/:id/read

Mark a notification as read.

**Headers**: `Authorization: Bearer <token>`

**Parameters**:
- `id` (path, required): Notification ID

**Request**: None

**Response** (200 OK):

```typescript
interface MarkReadResponse {
  success: true;
  data: Notification;
}
```

---

#### PUT /notifications/read-all

Mark all notifications as read.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response** (200 OK):

```typescript
interface MarkAllReadResponse {
  success: true;
  message: 'All notifications marked as read';
}
```

---

## Error Response Format

All error responses follow this format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required or invalid |
| FORBIDDEN | 403 | Access denied (wrong role or permissions) |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| CONFLICT | 409 | Resource conflict (e.g., duplicate email) |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705315200
```

---

## Pagination

List endpoints support pagination using `page` and `limit` query parameters:

- `page`: Page number (default: 1, minimum: 1)
- `limit`: Items per page (default: 20, minimum: 1, maximum: 100)

Pagination metadata is included in the response:

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

## Filtering and Sorting

List endpoints support filtering and sorting:

### Filtering

Use query parameters to filter results:

```
GET /products?sellerId=user-1&category=Brinquedos&isAvailable=true
```

### Sorting

Use `sortBy` and `sortOrder` query parameters:

```
GET /products?sortBy=price&sortOrder=asc
```

Available sort fields:
- `createdAt`
- `price`
- `name`

Sort order values:
- `asc` (ascending)
- `desc` (descending)

---

## TypeScript Type Definitions

```typescript
// Common Types
type UserRole = 'seller' | 'buyer';
type ProductCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';
type PurchaseStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type PaymentMethod = 'cash' | 'card' | 'pix' | 'other';

// API Response Types
type ApiResponse<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

// Entity Types (from data-model.md)
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

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
  condition?: ProductCondition;
  isAvailable: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  currency: string;
  purchaseDate: string;
  status: PurchaseStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  qrCodeScanned: boolean;
}

interface QRCode {
  id: string;
  productId: string;
  code: string;
  imageUrl?: string;
  generatedAt: string;
  expiresAt?: string;
  scanCount: number;
}

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

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Request/Response Types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  condition?: ProductCondition;
}

interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  condition?: ProductCondition;
  isAvailable?: boolean;
}

interface CreatePurchaseRequest {
  productId: string;
  qrCode: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

interface ScanQRCodeRequest {
  qrCode: string;
}

interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

// Pagination Types
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
```

---

## Mock Service Implementation

For the initial development phase, a mock service will implement these contracts:

```typescript
// frontend/src/services/mock/mockApi.ts
import { 
  mockUsers, 
  mockProducts, 
  mockPurchases, 
  mockTestimonials 
} from './mockData';

export const mockApi = {
  // Authentication
  login: async (email: string, password: string) => {
    // Mock implementation
  },
  
  logout: async () => {
    // Mock implementation
  },
  
  register: async (data: RegisterRequest) => {
    // Mock implementation
  },
  
  getMe: async () => {
    // Mock implementation
  },
  
  // Products
  getProducts: async (filters?: ProductFilters) => {
    // Mock implementation
  },
  
  getProduct: async (id: string) => {
    // Mock implementation
  },
  
  createProduct: async (data: CreateProductRequest) => {
    // Mock implementation
  },
  
  updateProduct: async (id: string, data: UpdateProductRequest) => {
    // Mock implementation
  },
  
  deleteProduct: async (id: string) => {
    // Mock implementation
  },
  
  // QR Codes
  getQRCode: async (productId: string) => {
    // Mock implementation
  },
  
  scanQRCode: async (qrCode: string) => {
    // Mock implementation
  },
  
  // Purchases
  getPurchases: async (filters?: PurchaseFilters) => {
    // Mock implementation
  },
  
  getPurchase: async (id: string) => {
    // Mock implementation
  },
  
  createPurchase: async (data: CreatePurchaseRequest) => {
    // Mock implementation
  },
  
  // Analytics
  getSellerAnalytics: async (params?: AnalyticsParams) => {
    // Mock implementation
  },
  
  // Testimonials
  getTestimonials: async (filters?: TestimonialFilters) => {
    // Mock implementation
  },
  
  // Notifications
  getNotifications: async (filters?: NotificationFilters) => {
    // Mock implementation
  },
  
  markNotificationAsRead: async (id: string) => {
    // Mock implementation
  },
  
  markAllNotificationsAsRead: async () => {
    // Mock implementation
  },
};
```

---

## Next Steps

1. **Create Quickstart Guide**: Provide step-by-step setup instructions
2. **Update Agent Context**: Add new technologies to agent context
3. **Create Implementation Tasks**: Break down the plan into actionable tasks

---

## References

- [Data Model](./data-model.md)
- [Research Document](./research.md)
- [Feature Specification](./spec.md)
- [Constitution](../../.specify/memory/constitution.md)
