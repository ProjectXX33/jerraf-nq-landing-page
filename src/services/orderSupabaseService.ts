import { supabase } from '../lib/supabase';

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

export class OrderSupabaseService {
  
  // Enable Growth System for a specific order
  static async enableGrowthForOrder(
    orderId: number,
    orderNumber: string,
    customerEmail: string,
    customerName: string,
    quantity: number = 1,
    adminName: string = 'admin',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Enabling growth for order ${orderId} in Supabase...`);
      
      const { data, error } = await supabase
        .from('order_growth_access')
        .upsert({
          order_id: orderId,
          order_number: orderNumber,
          customer_email: customerEmail,
          customer_name: customerName,
          is_growth_enabled: true,
          usage_count: 0,
          max_usage: quantity,
          enabled_at: new Date().toISOString(),
          disabled_at: null,
          enabled_by: adminName,
          notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'order_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error enabling growth for order:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Growth enabled for order in Supabase:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Exception enabling growth for order:', error);
      return { success: false, error: 'Failed to enable growth system' };
    }
  }

  // Disable Growth System for a specific order
  static async disableGrowthForOrder(
    orderId: number,
    adminName: string = 'admin',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Disabling growth for order ${orderId} in Supabase...`);
      
      const { data, error } = await supabase
        .from('order_growth_access')
        .update({
          is_growth_enabled: false,
          disabled_at: new Date().toISOString(),
          enabled_by: adminName,
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error disabling growth for order:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Growth disabled for order in Supabase:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Exception disabling growth for order:', error);
      return { success: false, error: 'Failed to disable growth system' };
    }
  }

  // Get order access status
  static async getOrderAccess(orderId: number): Promise<OrderGrowthAccess | null> {
    try {
      const { data, error } = await supabase
        .from('order_growth_access')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error getting order access:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception getting order access:', error);
      return null;
    }
  }

  // Check if customer can use Growth System (based on orders)
  static async canCustomerUseGrowthSystem(customerEmail: string): Promise<{
    canUse: boolean;
    availableUsages: number;
    enabledOrders: OrderGrowthAccess[];
  }> {
    try {
      const { data, error } = await supabase
        .from('order_growth_access')
        .select('*')
        .eq('customer_email', customerEmail)
        .eq('is_growth_enabled', true);

      if (error) {
        console.error('Error checking customer growth access:', error);
        return { canUse: false, availableUsages: 0, enabledOrders: [] };
      }

      const enabledOrders = data || [];
      const totalUsages = enabledOrders.reduce((sum, order) => sum + order.max_usage, 0);
      const usedUsages = enabledOrders.reduce((sum, order) => sum + order.usage_count, 0);
      const availableUsages = totalUsages - usedUsages;

      return {
        canUse: availableUsages > 0,
        availableUsages,
        enabledOrders
      };
    } catch (error) {
      console.error('Exception checking customer growth access:', error);
      return { canUse: false, availableUsages: 0, enabledOrders: [] };
    }
  }

  // Get all enabled orders
  static async getEnabledOrders(): Promise<OrderGrowthAccess[]> {
    try {
      const { data, error } = await supabase
        .from('order_growth_access')
        .select('*')
        .eq('is_growth_enabled', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting enabled orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting enabled orders:', error);
      return [];
    }
  }

  // Get statistics
  static async getStatistics(): Promise<{
    totalOrders: number;
    enabledOrders: number;
    disabledOrders: number;
    totalUsage: number;
    enabledThisMonth: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('order_growth_access')
        .select('*');

      if (error) {
        console.error('Error getting order statistics:', error);
        return {
          totalOrders: 0,
          enabledOrders: 0,
          disabledOrders: 0,
          totalUsage: 0,
          enabledThisMonth: 0
        };
      }

      const orders = data || [];
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        totalOrders: orders.length,
        enabledOrders: orders.filter(o => o.is_growth_enabled).length,
        disabledOrders: orders.filter(o => !o.is_growth_enabled).length,
        totalUsage: orders.reduce((sum, o) => sum + o.usage_count, 0),
        enabledThisMonth: orders.filter(o => 
          o.enabled_at && new Date(o.enabled_at) >= thisMonth
        ).length
      };
    } catch (error) {
      console.error('Exception getting order statistics:', error);
      return {
        totalOrders: 0,
        enabledOrders: 0,
        disabledOrders: 0,
        totalUsage: 0,
        enabledThisMonth: 0
      };
    }
  }

  // Record usage when customer uses the system
  static async recordUsage(
    customerEmail: string,
    childData: {
      name: string;
      age: number;
      ageUnit: string;
      gender: string;
      weight: number;
      height: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find an enabled order with available usage
      const { data: orders, error } = await supabase
        .from('order_growth_access')
        .select('*')
        .eq('customer_email', customerEmail)
        .eq('is_growth_enabled', true)
        .order('created_at', { ascending: true }); // Use oldest orders first

      if (error || !orders || orders.length === 0) {
        return { success: false, error: 'No enabled orders found' };
      }

      // Find first order with available usage
      const availableOrder = orders.find(order => order.usage_count < order.max_usage);
      
      if (!availableOrder) {
        return { success: false, error: 'No available usages' };
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('order_growth_access')
        .update({
          usage_count: availableOrder.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', availableOrder.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Usage logging temporarily disabled due to table issues
      console.log('📝 Usage logging skipped - main system functionality preserved');

      return { success: true };
    } catch (error) {
      console.error('Exception recording usage:', error);
      return { success: false, error: 'Failed to record usage' };
    }
  }
}
