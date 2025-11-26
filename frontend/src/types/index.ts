export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'jeweler' | 'guest';
  phone?: string;
  business_name?: string;
  business_address?: string;
  stripe_account_id?: string;
  stripe_onboarding_completed: boolean;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftList {
  id: string;
  title: string;
  description?: string;
  list_type: 'money_collection' | 'product_list';
  target_amount: number;
  fixed_contribution_amount?: number;
  max_contributors?: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  is_public: boolean;
  show_in_public_gallery: boolean;
  allow_anonymous_contributions: boolean;
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  jeweler_name: string;
  business_name?: string;
  items: GiftListItem[];
  products: GiftListProduct[];
  contributions: Contribution[];
  total_contributions: number;
  progress_percentage: number;
  contributors_count: number;
  is_completed: boolean;
  public_url: string;
  created_at: string;
  updated_at: string;
}

export interface GiftListItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity_available: number;
  quantity_contributed: number;
  is_available: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface GiftListProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  status: 'available' | 'purchased' | 'reserved';
  order: number;
  purchased_by?: string;
  purchased_at?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  contributor_name: string;
  contributor_email: string;
  contributor_message?: string;
  is_anonymous: boolean;
  amount: number;
  product?: GiftListProduct;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  display_name: string;
  created_at: string;
  completed_at?: string;
}

export interface GiftListPublic {
  id: string;
  title: string;
  description?: string;
  list_type: 'money_collection' | 'product_list';
  target_amount: number;
  fixed_contribution_amount?: number;
  max_contributors?: number;
  cover_image?: string;
  jeweler_name: string;
  business_name?: string;
  items: GiftListItem[];
  products: GiftListProduct[];
  recent_contributions: {
    display_name: string;
    amount: number;
    message?: string;
    created_at: string;
  }[];
  total_contributions: number;
  progress_percentage: number;
  contributors_count: number;
  is_completed: boolean;
  end_date?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'jeweler' | 'guest';
  phone?: string;
  business_name?: string;
  business_address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
