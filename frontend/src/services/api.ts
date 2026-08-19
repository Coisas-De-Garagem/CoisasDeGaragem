import { mockApi } from './mock/mockApi';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UserRole,
  Product,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  Purchase,
  PurchaseFilters,
  CreatePurchaseRequest,
  ScanQRCodeRequest,
  AnalyticsData,
  AnalyticsParams,
  Testimonial,
  TestimonialFilters,
  Notification,
  NotificationFilters,
  GarageEvent,
  EventInsights,
  CreateLocationRequest,
  UpdateLocationRequest,
  Location,
  CreateEventRequest,
  UpdateEventRequest,
  PublicEvent,
  Pagination,
  ProductQRCode,
  PaymentSimulationResult,
  CreationResult,

  ApiResult,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// Helper function to build query string
function buildQueryString(params?: object): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  return `?${queryParams.toString()}`;
}

// Helper function to make API requests
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error [%s]:', endpoint, response.status, errorData);
      return {
        success: false,
        error: {
          code: errorData.error || response.status.toString(),
          message: Array.isArray(errorData.message) ? errorData.message.join(', ') : (errorData.message || response.statusText),
          details: errorData,
        }
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// API service that switches between mock and real API
export const api = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<ApiResult<LoginResponse>> => {
    // Hardcoded credentials have been removed for security reasons.
    // See DELETED_LOGINS.md for details on what was removed.

    if (ENABLE_MOCK_DATA) {
      return mockApi.login(credentials);
    }
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.user) {
      response.data.user.role = response.data.user.role.toLowerCase() as UserRole;
    }
    return response;
  },

  googleLogin: async (token: string): Promise<ApiResult<LoginResponse>> => {
    if (ENABLE_MOCK_DATA) {
      return {
        success: true,
        data: {
          token: 'mock-google-token',
          expiresIn: 3600,
          user: {
            id: 'mock-google-user-id',
            email: 'mock-google-user@example.com',
            name: 'Mock Google User',
            role: 'user' as UserRole,
            password: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          },
        },
      };
    }
    const response = await fetchApi<LoginResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data.user) {
      response.data.user.role = response.data.user.role.toLowerCase() as UserRole;
    }
    return response;
  },

  logout: async (): Promise<ApiResult<{ message: string }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.logout();
    }
    // No backend endpoint exists for logout, handle it client-side
    return { success: true, data: { message: 'Logged out successfully' } };
  },

  register: async (data: RegisterRequest): Promise<ApiResult<LoginResponse>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.register(data);
    }
    const response = await fetchApi<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        role: data.role.toUpperCase(), // Map role to uppercase for backend
      }),
    });

    if (response.success && response.data.user) {
      response.data.user.role = response.data.user.role.toLowerCase() as UserRole;
    }
    return response;
  },

  getMe: async (): Promise<ApiResult<User>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getMe();
    }
    return fetchApi<User>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  updateProfile: async (data: { name?: string; phone?: string; avatarUrl?: string }): Promise<ApiResult<User>> => {
    if (ENABLE_MOCK_DATA) {
      // For mock, just return success with updated data overlaid on a mock user
      return { success: true, data: { id: '1', email: 'mock@example.com', role: 'user', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as unknown as User };
    }
    return fetchApi<User>('/auth/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Products
  getProducts: async (filters?: ProductFilters): Promise<ApiResult<{ products: Product[]; pagination: Pagination }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getProducts(filters);
    }
    return fetchApi<{ products: Product[]; pagination: Pagination }>(
      `/products${buildQueryString(filters)}`,
      {
        method: 'GET',
      },
    );
  },

  getMyProducts: async (filters?: ProductFilters): Promise<ApiResult<{ products: Product[]; pagination: Pagination }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getMyProducts(filters);
    }
    return fetchApi<{ products: Product[]; pagination: Pagination }>(
      `/products/my-products${buildQueryString(filters)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  },

  getProduct: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getProduct(id);
    }
    return fetchApi<Product>(`/products/${id}`, {
      method: 'GET',
    });
  },

  createProduct: async (data: CreateProductRequest): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.createProduct(data);
    }
    return fetchApi<Product>('/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
  ): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, data);
    }
    return fetchApi<Product>(`/products/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  reserveProduct: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, { isAvailable: false, isReserved: true });
    }
    return fetchApi<Product>(`/products/${id}/reserve`, {
      method: 'PATCH',
    });
  },

  unreserveProduct: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, { isAvailable: true, isReserved: false });
    }
    return fetchApi<Product>(`/products/${id}/unreserve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  markProductAsSold: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, { isAvailable: false, isReserved: false, isSold: true });
    }
    return fetchApi<Product>(`/products/${id}/sold`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  deleteProduct: async (id: string): Promise<ApiResult<{ message: string }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.deleteProduct(id);
    }
    return fetchApi<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // QR Codes
  getQRCode: async (productId: string): Promise<ApiResult<ProductQRCode>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getQRCode(productId);
    }
    return fetchApi<ProductQRCode>(`/qr-codes/${productId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  scanQRCode: async (
    data: ScanQRCodeRequest,
  ): Promise<ApiResult<{ product: Product; seller: User }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.scanQRCode(data);
    }
    return fetchApi<{ product: Product; seller: User }>('/qr-codes/scan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Purchases
  getPurchases: async (filters?: PurchaseFilters): Promise<ApiResult<{ purchases: Purchase[]; pagination: Pagination }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getPurchases(filters);
    }
    return fetchApi<{ purchases: Purchase[]; pagination: Pagination }>(
      `/purchases${buildQueryString(filters)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  },

  getSales: async (filters?: PurchaseFilters): Promise<ApiResult<{ purchases: Purchase[]; pagination: Pagination }>> => {
    if (ENABLE_MOCK_DATA) {
      // Fallback or specific mock impl
      return mockApi.getPurchases(filters);
    }
    return fetchApi<{ purchases: Purchase[]; pagination: Pagination }>(
      `/purchases/sales${buildQueryString(filters)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  },

  getPurchase: async (id: string): Promise<ApiResult<Purchase>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getPurchase(id);
    }
    return fetchApi<Purchase>(`/purchases/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  createPurchase: async (
    data: CreatePurchaseRequest,
  ): Promise<ApiResult<Purchase & { paymentUrl?: string; qrCode?: string; pixKey?: string; chargeId?: string; expiresInSeconds?: number }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.createPurchase(data);
    }

    // Explicitly build the payload to avoid sending extra fields like qrCode
    const payload = {
      productId: data.productId,
      paymentMethod: data.paymentMethod?.toUpperCase(),
      notes: data.notes,
    };

    console.log('Sending purchase payload:', payload);

    return fetchApi<Purchase & { paymentUrl?: string; qrCode?: string; pixKey?: string; chargeId?: string; expiresInSeconds?: number }>('/purchases', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });
  },

  simulatePayment: async (chargeId: string, purchaseId?: string): Promise<ApiResult<PaymentSimulationResult>> => {
    return fetchApi<PaymentSimulationResult>('/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({ chargeId, purchaseId }),
    });
  },

  // Analytics
  getSellerAnalytics: async (
    params?: AnalyticsParams,
  ): Promise<ApiResult<AnalyticsData>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getSellerAnalytics(params);
    }
    return fetchApi<AnalyticsData>(`/analytics/seller${buildQueryString(params)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Testimonials
  getTestimonials: async (
    filters?: TestimonialFilters,
  ): Promise<ApiResult<Testimonial[]>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getTestimonials(filters);
    }
    return fetchApi<Testimonial[]>('/reviews/public', {
      method: 'GET',
    });
  },

  createTestimonial: async (data: { rating: number; content: string }): Promise<ApiResult<CreationResult>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: { id: 'mock-testimonial' } };
    }
    return fetchApi<CreationResult>('/reviews/testimonials', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Notifications
  getNotifications: async (
    filters?: NotificationFilters,
  ): Promise<ApiResult<Notification[]>> => {
    // Always use mock for notifications
    return mockApi.getNotifications(filters);
  },

  markNotificationAsRead: async (id: string): Promise<ApiResult<Notification>> => {
    return mockApi.markNotificationAsRead(id);
  },

  markAllNotificationsAsRead: async (): Promise<ApiResult<{ message: string }>> => {
    return mockApi.markAllNotificationsAsRead();
  },

  // Reviews
  getPendingReviews: async (): Promise<ApiResult<Purchase[]>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: [] };
    }
    return fetchApi<Purchase[]>('/reviews/pending', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  createReview: async (data: { purchaseId: string; rating: number; comment?: string }): Promise<ApiResult<CreationResult>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: { id: 'mock-review' } };
    }
    return fetchApi<CreationResult>('/reviews', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  // ---- Events / Garage Sales ----
  getEvents: async (): Promise<ApiResult<GarageEvent[]>> => {
    const response = await fetchApi<GarageEvent[]>('/events', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  getEvent: async (id: string): Promise<ApiResult<GarageEvent>> => {
    const response = await fetchApi<GarageEvent>(`/events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  /** Vitrine pública do evento (sem auth — para compradores escaneando o QR). */
  getPublicEvent: async (id: string): Promise<ApiResult<PublicEvent>> => {
    const response = await fetchApi<PublicEvent>(`/events/${id}/public`, {});
    return response;
  },

  createEvent: async (data: CreateEventRequest): Promise<ApiResult<GarageEvent>> => {
    const response = await fetchApi<GarageEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  updateEvent: async (id: string, data: UpdateEventRequest): Promise<ApiResult<GarageEvent>> => {
    const response = await fetchApi<GarageEvent>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  deleteEvent: async (id: string): Promise<ApiResult<{ message: string }>> => {
    const response = await fetchApi<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  linkProductToEvent: async (eventId: string, productId: string): Promise<ApiResult<Product>> => {
    const response = await fetchApi<Product>(`/events/${eventId}/products/${productId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  unlinkProductFromEvent: async (eventId: string, productId: string): Promise<ApiResult<Product>> => {
    const response = await fetchApi<Product>(`/events/${eventId}/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  getEventQR: async (eventId: string): Promise<ApiResult<{ url: string; eventUrl: string; code: string }>> => {
    const response = await fetchApi<{ url: string; eventUrl: string; code: string }>(
      `/events/${eventId}/qr`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    );
    return response;
  },

  recordEventVisit: async (eventId: string): Promise<ApiResult<{ success: boolean }>> => {
    const response = await fetchApi<{ success: boolean }>(`/events/${eventId}/visit`, {
      method: 'POST',
    });
    return response;
  },

  getEventInsights: async (eventId: string): Promise<ApiResult<EventInsights>> => {
    const response = await fetchApi<EventInsights>(`/events/${eventId}/insights`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response;
  },

  // Locations API
  getLocations: async (): Promise<ApiResult<Location[]>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: [] }; // Mock if needed
    }
    return fetchApi<Location[]>('/locations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  createLocation: async (data: CreateLocationRequest): Promise<ApiResult<Location>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: { id: 'mock-id', ...data, sellerId: 'seller', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Location };
    }
    return fetchApi<Location>('/locations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    });
  },

  updateLocation: async (id: string, data: UpdateLocationRequest): Promise<ApiResult<Location>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: { id, name: data.name || '', address: data.address || '', isActive: data.isActive ?? true, sellerId: 'seller', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
    }
    return fetchApi<Location>(`/locations/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    });
  },

  toggleLocationStatus: async (id: string): Promise<ApiResult<Location>> => {
    if (ENABLE_MOCK_DATA) {
      return { success: true, data: { id, name: 'Mock', address: 'Mock', isActive: false, sellerId: 'seller', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
    }
    return fetchApi<Location>(`/locations/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },
};
