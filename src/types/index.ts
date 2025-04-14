export type UserRole = 'admin' | 'user' | 'store_owner';

export interface Profile {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  total_ratings?: number;
}

export interface Rating {
  id: string;
  store_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}