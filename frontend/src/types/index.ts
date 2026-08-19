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

// Location Types
export interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
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
  images?: string[];
  qrCode: string;
  qrCodeUrl?: string;
  category?: string;
  condition?: ProductCondition;
  isAvailable: boolean;
  isReserved: boolean;
  isSold: boolean;
  eventId?: string;
  locationId?: string;
  location?: Location;
  seller?: User;
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
  seller?: User;
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

/** Resposta da geração de QR Code de um produto (endpoint /qr-codes/:productId). */
export interface ProductQRCode {
  url: string;
  code: string;
  productUrl?: string;
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
  images?: string[];
  category?: string;
  condition?: ProductCondition;
  locationId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  condition?: ProductCondition;
  isAvailable?: boolean;
  isReserved?: boolean;
  isSold?: boolean;
  locationId?: string;
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
  search?: string;
  minPrice?: number;
  maxPrice?: number;
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

// Event / Garage Sale Types
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface GarageEvent {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  status: EventStatus;
  startDate?: string;
  endDate?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  zipCode?: string;
  qrCode: string;
  productsCount?: number;
  visitsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventVisit {
  id: string;
  eventId: string;
  createdAt: string;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  isActive?: boolean;
}

export type UpdateLocationRequest = Partial<CreateLocationRequest>;

export interface CreateEventRequest {
  name: string;
  description?: string;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  zipCode?: string;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

export interface ProductRankingItem {
  productId: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface EventInsights {
  metrics: {
    totalRevenue: number;
    salesCount: number;
    ticketAverage: number;
    productsListed: number;
    productsSold: number;
    conversionRate: number;
    scansCount: number;
  };
  productRanking: ProductRankingItem[];
  comparison: {
    previousEventsCount: number;
    previousAverageRevenue: number;
    previousAverageSales: number;
    revenueDelta: number | null;
    salesDelta: number | null;
  };
}

/** Evento público com produtos vinculados + dados do vendedor (vitrine). */
export interface PublicEvent extends GarageEvent {
  products: Product[];
  seller?: { name?: string; phone?: string };
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

/** Resultado da simulação de pagamento no gateway (modo dev). */
export interface PaymentSimulationResult {
  success?: boolean;
  localSync?: boolean;
  data?: unknown;
}

/** Registro criado identificado apenas pelo id (testimonials, reviews). */
export interface CreationResult {
  id: string;
}

// Utility Types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
