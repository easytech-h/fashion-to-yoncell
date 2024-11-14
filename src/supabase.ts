import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project-url.supabase.co' && supabaseAnonKey !== 'your-anon-key';
};

// Default data to use when Supabase is not configured
export const defaultProducts = [
  { id: 'PROD-1', name: 'Sample Product 1', description: 'This is a sample product', quantity: 10, price: 19.99 },
  { id: 'PROD-2', name: 'Sample Product 2', description: 'Another sample product', quantity: 5, price: 29.99 },
];

export const defaultSales = [
  {
    id: 'SALE-1',
    items: [{ productId: 'PROD-1', quantity: 2, price: 19.99 }],
    subtotal: 39.98,
    total: 39.98,
    discount: 0,
    paymentReceived: 40,
    change: 0.02,
    date: new Date().toISOString(),
    cashier: 'John Doe',
    storeLocation: 'Main Store'
  },
];