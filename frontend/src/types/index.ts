// User Types
export type UserRole = 'user' | 'admin';

export interface User {
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

// Authentication Session Types
export interface AuthSession {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  deviceInfo?: object;
}

// Product Types
export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface Product {
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
  isReserved: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

// Purchase Types
export type PurchaseStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'pix' | 'other';

export interface Purchase {
  id: string;
  productId: string;
  product?: Product;
  buyerId: string;
  sellerId: string;
  price: number;
  currency: string;
  purchaseDate: string;
  status: PurchaseStatus | string; // Allow string for backend uppercase values
  paymentMethod?: PaymentMethod;
  notes?: string;
  qrCodeScanned: boolean;
  createdAt: string;
  updatedAt: string;
}

// QR Code Types
export interface QRCode {
  id: string;
  productId: string;
  code: string;
  imageUrl?: string;
  generatedAt: string;
  expiresAt?: string;
  scanCount: number;
}

// Dashboard Page Types
export type DashboardType = 'seller' | 'buyer';

export interface DashboardPage {
  id: string;
  dashboardType: DashboardType;
  path: string;
  title: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

// Navigation Item Types
export interface NavigationItem {
  id: string;
  dashboardType: DashboardType;
  label: string;
  path: string;
  icon: string;
  order: number;
  isActive: boolean;
  isDisabled: boolean;
}

// Testimonial Types
export interface Testimonial {
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

// Analytics Data Types
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AnalyticsData {
  id: string;
  sellerId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  productsSold: number;
  productsListed: number;
  uniqueBuyers: number;
  totalListingsValue: number;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  condition?: ProductCondition;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  condition?: ProductCondition;
  isAvailable?: boolean;
}

export interface CreatePurchaseRequest {
  productId: string;
  qrCode: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface ScanQRCodeRequest {
  qrCode: string;
}

export interface ProductFilters {
  sellerId?: string;
  category?: string;
  condition?: ProductCondition;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  page?: number;
  limit?: number;
}

export interface TestimonialFilters {
  isFeatured?: boolean;
  isVisible?: boolean;
  limit?: number;
}

export interface NotificationFilters {
  isRead?: boolean;
  limit?: number;
}

export interface AnalyticsParams {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Utility Types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
