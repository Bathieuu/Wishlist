import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use dummy values for development if env vars are not set
const defaultUrl = supabaseUrl || 'https://your-project.supabase.co';
const defaultKey = supabaseAnonKey || 'your-anon-key-here';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured. Using dummy values for development.');
} else {
  console.log('Supabase configured with URL:', supabaseUrl);
}

export const supabase = createClient(defaultUrl, defaultKey);

export interface WishlistItem {
  id: string;
  user_id: string;
  url: string;
  domain: string;
  title: string;
  image_url: string | null;
  price_cents: number | null;
  currency: string | null;
  price: string | null;  // Prix en format texte
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
  status: 'active' | 'deleted';
}

export interface Item {
  id: string;
  user_id: string;
  url: string;
  title: string;
  price: string | null;
  image_url: string | null;
  domain: string | null;
  created_at: string;
  updated_at: string;
}
