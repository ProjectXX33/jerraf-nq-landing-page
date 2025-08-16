// Per-order Growth System access management

export interface OrderGrowthAccess {
  orderId: number;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  isGrowthEnabled: boolean;
  enabledAt?: number;
  enabledBy?: string; // Admin who enabled it
  usageCount: number;
  maxUsage: number; // Based on quantity purchased
  notes?: string;
}

export interface OrderGrowthData {
  [orderId: string]: OrderGrowthAccess;
}

export class OrderGrowthUtils {
  private static readonly STORAGE_KEY = 'nq_order_growth_access';

  // Get all order growth access data
  static getOrderGrowthData(): OrderGrowthData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading order growth data:', error);
      return {};
    }
  }

  // Save order growth data
  static saveOrderGrowthData(data: OrderGrowthData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      // Trigger custom event for settings change
      window.dispatchEvent(new CustomEvent('orderGrowthAccessChanged', { 
        detail: data 
      }));
    } catch (error) {
      console.error('Error saving order growth data:', error);
    }
  }

  // Enable Growth System for a specific order
  static enableGrowthForOrder(
    orderId: number,
    orderNumber: string,
    customerEmail: string,
    customerName: string,
    quantity: number = 1,
    adminName: string = 'admin',
    notes?: string
  ): void {
    const data = this.getOrderGrowthData();
    
    data[orderId.toString()] = {
      orderId,
      orderNumber,
      customerEmail,
      customerName,
      isGrowthEnabled: true,
      enabledAt: Date.now(),
      enabledBy: adminName,
      usageCount: 0,
      maxUsage: quantity, // Each purchased item gives 1 usage
      notes
    };
    
    this.saveOrderGrowthData(data);
  }

  // Disable Growth System for a specific order
  static disableGrowthForOrder(orderId: number): void {
    const data = this.getOrderGrowthData();
    
    if (data[orderId.toString()]) {
      data[orderId.toString()].isGrowthEnabled = false;
      this.saveOrderGrowthData(data);
    }
  }

  // Check if customer can use Growth System based on their orders
  static canCustomerUseGrowthSystem(customerEmail: string): {
    canUse: boolean;
    availableUsages: number;
    enabledOrders: OrderGrowthAccess[];
  } {
    const data = this.getOrderGrowthData();
    const customerOrders = Object.values(data).filter(order => 
      order.customerEmail === customerEmail && order.isGrowthEnabled
    );
    
    const availableUsages = customerOrders.reduce((total, order) => {
      return total + (order.maxUsage - order.usageCount);
    }, 0);
    
    return {
      canUse: customerOrders.length > 0, // Can use if they have enabled orders, regardless of remaining usages
      availableUsages,
      enabledOrders: customerOrders
    };
  }

  // Use one Growth System attempt for a customer
  static useGrowthSystemForCustomer(customerEmail: string): boolean {
    const data = this.getOrderGrowthData();
    const customerOrders = Object.values(data).filter(order => 
      order.customerEmail === customerEmail && 
      order.isGrowthEnabled && 
      order.usageCount < order.maxUsage
    );
    
    if (customerOrders.length === 0) return false;
    
    // Use from the most recent order first
    const orderToUse = customerOrders.sort((a, b) => 
      (b.enabledAt || 0) - (a.enabledAt || 0)
    )[0];
    
    orderToUse.usageCount++;
    data[orderToUse.orderId.toString()] = orderToUse;
    
    this.saveOrderGrowthData(data);
    return true;
  }

  // Get order access status
  static getOrderAccess(orderId: number): OrderGrowthAccess | null {
    const data = this.getOrderGrowthData();
    return data[orderId.toString()] || null;
  }

  // Get all enabled orders
  static getEnabledOrders(): OrderGrowthAccess[] {
    const data = this.getOrderGrowthData();
    return Object.values(data).filter(order => order.isGrowthEnabled);
  }

  // Get all disabled orders
  static getDisabledOrders(): OrderGrowthAccess[] {
    const data = this.getOrderGrowthData();
    return Object.values(data).filter(order => !order.isGrowthEnabled);
  }

  // Get customer identifier from order
  static getCustomerEmailFromOrder(order: any): string {
    return order.billing?.email || 
           `${order.billing?.first_name}_${order.billing?.last_name}_${order.billing?.phone}`.toLowerCase().replace(/\s+/g, '_');
  }

  // Calculate max usage from order line items
  static calculateMaxUsageFromOrder(order: any): number {
    if (!order.line_items) return 1;
    
    return order.line_items.reduce((total: number, item: any) => {
      // Each product gives usages based on quantity
      return total + (item.quantity || 1);
    }, 0);
  }

  // Get statistics
  static getStatistics(): {
    totalOrders: number;
    enabledOrders: number;
    disabledOrders: number;
    totalUsages: number;
    remainingUsages: number;
  } {
    const data = this.getOrderGrowthData();
    const orders = Object.values(data);
    
    const totalUsages = orders.reduce((sum, order) => sum + order.usageCount, 0);
    const remainingUsages = orders.reduce((sum, order) => 
      sum + (order.isGrowthEnabled ? order.maxUsage - order.usageCount : 0), 0
    );
    
    return {
      totalOrders: orders.length,
      enabledOrders: orders.filter(o => o.isGrowthEnabled).length,
      disabledOrders: orders.filter(o => !o.isGrowthEnabled).length,
      totalUsages,
      remainingUsages
    };
  }

  // Reset all order access (for development)
  static resetAllOrderAccess(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('orderGrowthAccessChanged'));
  }



  // Import orders and set up access automatically
  static setupAccessFromOrder(order: any, autoEnable: boolean = false): void {
    const customerEmail = this.getCustomerEmailFromOrder(order);
    const customerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim();
    const maxUsage = this.calculateMaxUsageFromOrder(order);
    
    if (autoEnable) {
      this.enableGrowthForOrder(
        order.id,
        order.number,
        customerEmail,
        customerName,
        maxUsage,
        'auto',
        'تم التفعيل تلقائياً عند إتمام الطلب'
      );
    }
  }
}

// Development helper functions
if (import.meta.env.DEV) {
  (window as any).OrderGrowthUtils = OrderGrowthUtils;
  console.log('📦 Order Growth Utils available in console as: OrderGrowthUtils');
  console.log('📝 Available commands:');
  console.log('  - OrderGrowthUtils.enableGrowthForOrder(orderId, "WC-1234", "email", "name", 2)');
  console.log('  - OrderGrowthUtils.canCustomerUseGrowthSystem("email")');
  console.log('  - OrderGrowthUtils.getStatistics()');


}
