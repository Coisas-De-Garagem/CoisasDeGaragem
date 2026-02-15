import {
  mockUsers,
  mockProducts,
  mockPurchases,
  mockTestimonials,
  mockAnalyticsData,
  mockNotifications,
} from './mockData';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
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
  ApiResponse,
  ApiError,
} from '@/types';

// Simulate network delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Authentication
export const mockApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse> | ApiError> => {
    await delay();
    const user = mockUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password,
    );

    if (!user) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
      return error;
    }

    const success: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user,
        token: 'mock-jwt-token-' + Date.now(),
        expiresIn: 3600,
      },
    };
    return success;
  },

  // Logout
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    await delay(200);
    return {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse> | ApiError> => {
    await delay();
    const existingUser = mockUsers.find((u) => u.email === data.email);

    if (existingUser) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already registered',
        },
      };
      return error;
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    mockUsers.push(newUser);

    const success: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now(),
        expiresIn: 3600,
      },
    };
    return success;
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<User>> => {
    await delay(300);
    // Return first mock user for demo
    return {
      success: true,
      data: mockUsers[0],
    };
  },

  // Get products
  getProducts: async (filters?: ProductFilters): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
    await delay();
    let filteredProducts = [...mockProducts];

    if (filters?.sellerId) {
      filteredProducts = filteredProducts.filter((p) => p.sellerId === filters.sellerId);
    }

    if (filters?.category) {
      filteredProducts = filteredProducts.filter((p) => p.category === filters.category);
    }

    if (filters?.condition) {
      filteredProducts = filteredProducts.filter((p) => p.condition === filters.condition);
    }

    if (filters?.isAvailable !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.isAvailable === filters.isAvailable);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(start, start + limit);

    return {
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      },
    };
  },

  // Get product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product> | ApiError> => {
    await delay(200);
    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      };
      return error;
    }

    const success: ApiResponse<Product> = {
      success: true,
      data: product,
    };
    return success;
  },

  // Create product
  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    await delay();
    const newProduct: Product = {
      id: 'product-' + Date.now(),
      sellerId: 'user-1', // Mock seller ID
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      imageUrl: data.imageUrl,
      category: data.category,
      condition: data.condition,
      qrCode: 'QR-PRODUCT-' + Date.now(),
      isAvailable: true,
      isReserved: false,
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    return {
      success: true,
      data: newProduct,
    };
  },

  // Update product
  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
  ): Promise<ApiResponse<Product> | ApiError> => {
    await delay();
    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      };
      return error;
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const success: ApiResponse<Product> = {
      success: true,
      data: mockProducts[productIndex],
    };
    return success;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<{ message: string }> | ApiError> => {
    await delay(200);
    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      };
      return error;
    }

    mockProducts.splice(productIndex, 1);

    return {
      success: true,
      data: {
        message: 'Product deleted successfully',
      },
    };
  },

  // Get QR code for product
  getQRCode: async (productId: string): Promise<ApiResponse<any> | ApiError> => {
    await delay(200);
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'QR_CODE_NOT_FOUND',
          message: 'QR code not found',
        },
      };
      return error;
    }

    return {
      success: true,
      data: {
        id: 'qr-' + productId,
        productId,
        code: product.qrCode,
        imageUrl: product.qrCodeUrl,
        generatedAt: new Date().toISOString(),
        scanCount: 0,
      },
    };
  },

  // Scan QR code
  scanQRCode: async (
    data: ScanQRCodeRequest,
  ): Promise<ApiResponse<{ product: Product; seller: User }> | ApiError> => {
    await delay(300);
    const product = mockProducts.find((p) => p.qrCode === data.qrCode);

    if (!product) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'QR_CODE_INVALID',
          message: 'Invalid QR code',
        },
      };
      return error;
    }

    const seller = mockUsers.find((u) => u.id === product.sellerId);

    return {
      success: true,
      data: {
        product,
        seller: seller!,
      },
    };
  },

  // Get purchases
  getPurchases: async (filters?: PurchaseFilters): Promise<ApiResponse<{ purchases: Purchase[]; pagination: any }>> => {
    await delay();
    let filteredPurchases = [...mockPurchases];

    if (filters?.status) {
      filteredPurchases = filteredPurchases.filter((p) => p.status === filters.status);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const paginatedPurchases = filteredPurchases.slice(start, start + limit);

    return {
      success: true,
      data: {
        purchases: paginatedPurchases,
        pagination: {
          page,
          limit,
          total: filteredPurchases.length,
          totalPages: Math.ceil(filteredPurchases.length / limit),
        },
      },
    };
  },

  // Get purchase by ID
  getPurchase: async (id: string): Promise<ApiResponse<Purchase> | ApiError> => {
    await delay(200);
    const purchase = mockPurchases.find((p) => p.id === id);

    if (!purchase) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'PURCHASE_NOT_FOUND',
          message: 'Purchase not found',
        },
      };
      return error;
    }

    const success: ApiResponse<Purchase> = {
      success: true,
      data: purchase,
    };
    return success;
  },

  // Create purchase
  createPurchase: async (
    data: CreatePurchaseRequest,
  ): Promise<ApiResponse<Purchase> | ApiError> => {
    await delay();
    const product = mockProducts.find((p) => p.id === data.productId);

    if (!product) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      };
      return error;
    }

    const newPurchase: Purchase = {
      id: 'purchase-' + Date.now(),
      productId: data.productId,
      buyerId: 'user-2', // Mock buyer ID
      sellerId: product.sellerId,
      price: product.price,
      currency: product.currency,
      purchaseDate: new Date().toISOString(),
      status: 'pending',
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      qrCodeScanned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPurchases.push(newPurchase);

    const success: ApiResponse<Purchase> = {
      success: true,
      data: newPurchase,
    };
    return success;
  },

  // Get analytics
  getSellerAnalytics: async (
    _params?: AnalyticsParams,
  ): Promise<ApiResponse<AnalyticsData>> => {
    await delay(300);
    return {
      success: true,
      data: mockAnalyticsData,
    };
  },

  // Get testimonials
  getTestimonials: async (
    filters?: TestimonialFilters,
  ): Promise<ApiResponse<Testimonial[]>> => {
    await delay();
    let filteredTestimonials = [...mockTestimonials];

    if (filters?.isFeatured !== undefined) {
      filteredTestimonials = filteredTestimonials.filter((t) => t.isFeatured === filters.isFeatured);
    }

    if (filters?.isVisible !== undefined) {
      filteredTestimonials = filteredTestimonials.filter((t) => t.isVisible === filters.isVisible);
    }

    const limit = filters?.limit || 10;
    const paginatedTestimonials = filteredTestimonials.slice(0, limit);

    return {
      success: true,
      data: paginatedTestimonials,
    };
  },

  // Get notifications
  getNotifications: async (
    filters?: NotificationFilters,
  ): Promise<ApiResponse<Notification[]>> => {
    await delay();
    let filteredNotifications = [...mockNotifications];

    if (filters?.isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter((n) => n.isRead === filters.isRead);
    }

    const limit = filters?.limit || 20;
    const paginatedNotifications = filteredNotifications.slice(0, limit);

    return {
      success: true,
      data: paginatedNotifications,
    };
  },

  // Mark notification as read
  markNotificationAsRead: async (id: string): Promise<ApiResponse<Notification> | ApiError> => {
    await delay(200);
    const notification = mockNotifications.find((n) => n.id === id);

    if (!notification) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
        },
      };
      return error;
    }

    notification.isRead = true;

    const success: ApiResponse<Notification> = {
      success: true,
      data: notification,
    };
    return success;
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    await delay(200);
    mockNotifications.forEach((n) => (n.isRead = true));

    return {
      success: true,
      data: {
        message: 'All notifications marked as read',
      },
    };
  },
};
