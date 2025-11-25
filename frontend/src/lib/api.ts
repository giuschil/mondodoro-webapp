import axios from 'axios';
import { 
  User, 
  GiftList, 
  GiftListPublic, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  Contribution,
  GiftListItem,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/');
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ token: string; message: string }> => {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  },
};

// Gift Lists API
export const giftListsAPI = {
  getAll: async (params?: {
    status?: string;
    is_public?: boolean;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<GiftList>> => {
    const response = await api.get('/gift-lists/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<GiftList> => {
    const response = await api.get(`/gift-lists/${id}/`);
    return response.data;
  },

  getPublic: async (id: string): Promise<GiftListPublic> => {
    const response = await api.get(`/gift-lists/public/${id}/`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    target_amount: number;
    status?: string;
    is_public?: boolean;
    allow_anonymous_contributions?: boolean;
    start_date?: string;
    end_date?: string;
    cover_image?: File;
    list_type?: string;
    fixed_contribution_amount?: number;
    max_contributors?: number;
    products?: any[];
  }): Promise<GiftList> => {
    // For now, exclude cover_image and products to use JSON
    const { cover_image, products, ...jsonData } = data;
    
    // Set default values for public visibility
    const createData = {
      ...jsonData,
      status: 'active',
      is_public: true,
    };

    const response = await api.post('/gift-lists/', createData);
    return response.data;
  },

  update: async (id: string, data: Partial<GiftList>): Promise<GiftList> => {
    const response = await api.patch(`/gift-lists/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gift-lists/${id}/`);
  },

  // Contributions
  getContributions: async (giftListId: string, params?: {
    payment_status?: string;
    is_anonymous?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<Contribution>> => {
    const response = await api.get(`/gift-lists/${giftListId}/contributions/`, { params });
    return response.data;
  },

  createContribution: async (giftListId: string, data: {
    contributor_name: string;
    contributor_email: string;
    contributor_message?: string;
    is_anonymous: boolean;
    amount: number;
  }): Promise<Contribution> => {
    const response = await api.post(`/gift-lists/${giftListId}/contributions/`, data);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: async (data: {
    contribution_id: string;
    amount: number;
  }): Promise<{ checkout_url: string; session_id: string }> => {
    const response = await api.post('/payments/create-payment-intent/', data);
    return response.data;
  },

  confirmPayment: async (data: {
    payment_intent_id: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/payments/confirm-payment/', data);
    return response.data;
  },

  createStripeOnboarding: async (): Promise<{ onboarding_url: string; account_id: string }> => {
    const response = await api.post('/payments/stripe/onboard/');
    return response.data;
  },

  checkStripeOnboardingStatus: async (): Promise<{ 
    success: boolean; 
    onboarding_completed: boolean; 
    charges_enabled: boolean; 
    payouts_enabled: boolean 
  }> => {
    const response = await api.get('/payments/stripe/onboard/return/');
    return response.data;
  },
};

export default api;
