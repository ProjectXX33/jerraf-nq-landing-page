// Customer-specific Growth System management utilities

export interface CustomerGrowthSettings {
  isEnabled: boolean;
  blockedAt?: number;
  reason?: string;
  adminNote?: string;
}

export interface CustomerGrowthData {
  [customerEmail: string]: CustomerGrowthSettings;
}

export class CustomerGrowthUtils {
  private static readonly STORAGE_KEY = 'nq_customer_growth_settings';

  // Get all customer growth settings
  static getCustomerGrowthData(): CustomerGrowthData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading customer growth data:', error);
      return {};
    }
  }

  // Save customer growth data
  static saveCustomerGrowthData(data: CustomerGrowthData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      // Trigger custom event for settings change
      window.dispatchEvent(new CustomEvent('customerGrowthSettingsChanged', { 
        detail: data 
      }));
    } catch (error) {
      console.error('Error saving customer growth data:', error);
    }
  }

  // Get customer's Growth System status
  static getCustomerStatus(customerEmail: string): CustomerGrowthSettings {
    const data = this.getCustomerGrowthData();
    return data[customerEmail] || { isEnabled: true };
  }

  // Set customer's Growth System status
  static setCustomerStatus(
    customerEmail: string, 
    isEnabled: boolean, 
    reason?: string,
    adminNote?: string
  ): void {
    const data = this.getCustomerGrowthData();
    
    data[customerEmail] = {
      isEnabled,
      blockedAt: isEnabled ? undefined : Date.now(),
      reason,
      adminNote
    };
    
    this.saveCustomerGrowthData(data);
  }

  // Check if customer can use Growth System (combines global and individual settings)
  static canCustomerUseGrowthSystem(customerEmail: string): boolean {
    // First check global admin setting
    const { AdminUtils } = require('./adminUtils');
    if (!AdminUtils.isGrowthSystemEnabled()) {
      return false;
    }
    
    // Then check individual customer setting
    const customerStatus = this.getCustomerStatus(customerEmail);
    return customerStatus.isEnabled;
  }

  // Get blocked customers list
  static getBlockedCustomers(): Array<{
    email: string;
    settings: CustomerGrowthSettings;
  }> {
    const data = this.getCustomerGrowthData();
    return Object.entries(data)
      .filter(([_, settings]) => !settings.isEnabled)
      .map(([email, settings]) => ({ email, settings }));
  }

  // Get enabled customers list
  static getEnabledCustomers(): Array<{
    email: string;
    settings: CustomerGrowthSettings;
  }> {
    const data = this.getCustomerGrowthData();
    return Object.entries(data)
      .filter(([_, settings]) => settings.isEnabled)
      .map(([email, settings]) => ({ email, settings }));
  }

  // Get customer email from order billing data
  static getCustomerEmailFromOrder(order: any): string {
    return order.billing?.email || 
           `${order.billing?.first_name}_${order.billing?.last_name}_${order.billing?.phone}`.toLowerCase();
  }

  // Reset all customer settings (for development)
  static resetAllCustomerSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('customerGrowthSettingsChanged'));
  }

  // Get statistics
  static getStatistics(): {
    totalCustomers: number;
    enabledCustomers: number;
    blockedCustomers: number;
  } {
    const data = this.getCustomerGrowthData();
    const customers = Object.values(data);
    
    return {
      totalCustomers: customers.length,
      enabledCustomers: customers.filter(c => c.isEnabled).length,
      blockedCustomers: customers.filter(c => !c.isEnabled).length
    };
  }

  // Format block reason for display
  static formatBlockReason(reason?: string): string {
    if (!reason) return 'غير محدد';
    
    const reasonMap: Record<string, string> = {
      'abuse': 'سوء استخدام',
      'excessive_usage': 'استخدام مفرط',
      'violation': 'مخالفة الشروط',
      'admin_decision': 'قرار إداري',
      'technical_issue': 'مشكلة تقنية',
      'other': 'أخرى'
    };
    
    return reasonMap[reason] || reason;
  }
}

// Development helper functions
if (import.meta.env.DEV) {
  (window as any).CustomerGrowthUtils = CustomerGrowthUtils;
  console.log('👥 Customer Growth Utils available in console as: CustomerGrowthUtils');
  console.log('📝 Available commands:');
  console.log('  - CustomerGrowthUtils.setCustomerStatus("email", false, "abuse")');
  console.log('  - CustomerGrowthUtils.getBlockedCustomers()');
  console.log('  - CustomerGrowthUtils.resetAllCustomerSettings()');
}
