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

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },

  resetPassword: async (data: {
    uid: string;
    token: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password/', data);
    return response.data;
  },
};

// Gift Lists API
export const giftListsAPI = {
  getAll: async (params?: {
    status?: string;
    is_public?: boolean;
    show_in_public_gallery?: boolean;
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
    show_in_public_gallery?: boolean;
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

// Events API
export const eventsAPI = {
  getAll: async (params?: { status?: string; page?: number }): Promise<{ results: EventItem[]; count: number }> => {
    const response = await api.get('/events/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<EventItem> => {
    const response = await api.get(`/events/${id}/`);
    return response.data;
  },

  getPublic: async (id: string): Promise<EventItem> => {
    const response = await api.get(`/events/${id}/public/`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    location?: string;
    date: string;
    status: string;
  }): Promise<EventItem> => {
    const response = await api.post('/events/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<EventItem>): Promise<EventItem> => {
    const response = await api.patch(`/events/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/`);
  },

  getBookings: async (eventId: string): Promise<{ results: Booking[] }> => {
    const response = await api.get(`/events/${eventId}/bookings/`);
    return response.data;
  },

  getSlots: async (eventId: string): Promise<EventSlot[]> => {
    const response = await api.get(`/events/${eventId}/slots/`);
    return response.data;
  },

  createSlot: async (eventId: string, data: {
    start_time: string;
    end_time?: string;
    price: number;
    max_attendees: number;
    notes?: string;
  }): Promise<EventSlot> => {
    const response = await api.post(`/events/${eventId}/slots/`, data);
    return response.data;
  },

  createSlots: async (eventId: string, data: Array<{
    start_time: string;
    end_time?: string;
    price: number;
    max_attendees: number;
    notes?: string;
  }>): Promise<EventSlot[]> => {
    const response = await api.post(`/events/${eventId}/slots/`, data);
    return response.data;
  },

  updateSlot: async (eventId: string, slotId: string, data: Partial<{
    start_time: string;
    end_time: string;
    price: number;
    max_attendees: number;
    notes: string;
  }>): Promise<EventSlot> => {
    const response = await api.patch(`/events/${eventId}/slots/${slotId}/`, data);
    return response.data;
  },

  deleteSlot: async (eventId: string, slotId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/slots/${slotId}/`);
  },

  createBooking: async (eventId: string, data: {
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    guest_message?: string;
    slot_id: string;
    payment_method: 'online' | 'in_person';
  }): Promise<{ booking: Booking; checkout_url: string | null }> => {
    const response = await api.post(`/events/${eventId}/book/`, data);
    return response.data;
  },

  updateBookingStatus: async (eventId: string, bookingId: string, paymentStatus: string): Promise<Booking> => {
    const response = await api.patch(`/events/${eventId}/bookings/${bookingId}/status/`, { payment_status: paymentStatus });
    return response.data;
  },
};

export interface EventSlot {
  id: string;
  start_time: string;
  end_time?: string;
  price: string;
  max_attendees: number;
  notes?: string;
  is_free: boolean;
  booked_count: number;
  available_spots: number;
  is_available: boolean;
  bookings?: Booking[];
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: string;
  status: string;
  status_display: string;
  slots: EventSlot[];
  slots_count: number;
  bookings_count: number;
  created_at: string;
  updated_at: string;
  jeweler_name?: string;
}

export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_message?: string;
  slot_time: string;
  payment_method: 'online' | 'in_person';
  payment_method_display: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_status_display: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export default api;
