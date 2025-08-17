import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit events to prevent spam
    },
  },
});

// Database types for TypeScript
export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
  updated_by: string;
}

export interface AdminSession {
  id: string;
  session_token: string;
  is_active: boolean;
  login_timestamp: string;
  logout_timestamp?: string;
  session_duration: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CustomerGrowthAccess {
  id: string;
  customer_email: string;
  is_enabled: boolean;
  blocked_reason?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface OrderGrowthAccess {
  id: string;
  order_id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  is_growth_enabled: boolean;
  usage_count: number;
  max_usage: number;
  enabled_at?: string;
  disabled_at?: string;
  enabled_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthSystemUsage {
  id: string;
  customer_email: string;
  order_number?: string;
  child_name: string;
  child_age: number;
  child_age_unit: 'months' | 'years';
  child_gender: 'male' | 'female';
  child_weight: number;
  child_height: number;
  report_generated: boolean;
  usage_timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SystemActivityLog {
  id: string;
  activity_type: string;
  description: string;
  metadata?: any;
  performed_by: string;
  ip_address?: string;
  created_at: string;
}
