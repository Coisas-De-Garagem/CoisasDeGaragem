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

  ApiResult,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// Helper function to build query string
function buildQueryString(params?: Record<string, any>): string {
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
      console.error(`API Error [${endpoint}]:`, response.status, errorData);
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

  logout: async (): Promise<ApiResult<{ message: string }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.logout();
    }
    return fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
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

  // Products
  getProducts: async (filters?: ProductFilters): Promise<ApiResult<{ products: Product[]; pagination: any }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getProducts(filters);
    }
    return fetchApi<{ products: Product[]; pagination: any }>(
      `/products${buildQueryString(filters)}`,
      {
        method: 'GET',
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
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
  },

  reserveProduct: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, { isAvailable: false, isReserved: true } as any);
    }
    return fetchApi<Product>(`/products/${id}/reserve`, {
      method: 'PATCH',
    });
  },

  unreserveProduct: async (id: string): Promise<ApiResult<Product>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.updateProduct(id, { isAvailable: true, isReserved: false } as any);
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
      return mockApi.updateProduct(id, { isAvailable: false, isReserved: false, isSold: true } as any);
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
  getQRCode: async (productId: string): Promise<ApiResult<any>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getQRCode(productId);
    }
    return fetchApi<any>(`/qr-codes/${productId}`, {
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
  getPurchases: async (filters?: PurchaseFilters): Promise<ApiResult<{ purchases: Purchase[]; pagination: any }>> => {
    if (ENABLE_MOCK_DATA) {
      return mockApi.getPurchases(filters);
    }
    return fetchApi<{ purchases: Purchase[]; pagination: any }>(
      `/purchases${buildQueryString(filters)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  },

  getSales: async (filters?: PurchaseFilters): Promise<ApiResult<{ purchases: Purchase[]; pagination: any }>> => {
    if (ENABLE_MOCK_DATA) {
      // Fallback or specific mock impl
      return mockApi.getPurchases(filters);
    }
    return fetchApi<{ purchases: Purchase[]; pagination: any }>(
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
  ): Promise<ApiResult<Purchase>> => {
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

    return fetchApi<Purchase>('/purchases', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
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
    // Always use mock for testimonials
    return mockApi.getTestimonials(filters);
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
};
