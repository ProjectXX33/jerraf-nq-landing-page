// WooCommerce API Configuration
// Replace these with your actual WooCommerce credentials

interface WooCommerceConfig {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  demoMode?: boolean; // Enable demo mode for testing
}

// 🔧 CONFIGURE YOUR WOOCOMMERCE API HERE 🔧
const WOOCOMMERCE_CONFIG: WooCommerceConfig = {
  // Your WordPress/WooCommerce site URL (without trailing slash)
  siteUrl: 'https://nooralqmar.com/',
  
  // Your WooCommerce API Consumer Key
  consumerKey: 'ck_d3ee14bd864fc7579d7188fc2ab793ceca4ee41d',
  
  // Your WooCommerce API Consumer Secret
  consumerSecret: 'cs_fc5331b243582579cc92c0027b85c877482cf022',
  
  // API Version
  apiVersion: 'v3',
  
  // 🧪 Demo Mode - Set to false when you have real WooCommerce API configured
  demoMode: false
};

// WooCommerce API Service
export class WooCommerceService {
  private config: WooCommerceConfig;

  constructor(config: WooCommerceConfig = WOOCOMMERCE_CONFIG) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.config.demoMode) {
      console.log('🧪 WooCommerce Demo Mode Enabled - Orders will be simulated');
      return;
    }

    if (!this.config.siteUrl || this.config.siteUrl === 'https://your-site.com') {
      console.warn('⚠️ WooCommerce site URL not configured');
    }
    if (!this.config.consumerKey || this.config.consumerKey.startsWith('ck_xxx')) {
      console.warn('⚠️ WooCommerce Consumer Key not configured');
    }
    if (!this.config.consumerSecret || this.config.consumerSecret.startsWith('cs_xxx')) {
      console.warn('⚠️ WooCommerce Consumer Secret not configured');
    }
  }

  private getApiUrl(): string {
    return `${this.config.siteUrl}/wp-json/wc/${this.config.apiVersion}`;
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
    return `Basic ${credentials}`;
  }

  // Demo mode simulation
  private async simulateOrder(orderData: any): Promise<any> {
    console.log('🧪 Demo Mode: Simulating order creation...', orderData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fake order response
    const fakeOrder = {
      id: Date.now(),
      number: `WC-${Math.floor(Math.random() * 10000)}`,
      status: 'pending',
      currency: 'SAR',
      total: orderData.line_items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * 75); // Assume 75 SAR per item
      }, 0) + (orderData.shipping_lines.length > 0 ? 10 : 0),
      billing: orderData.billing,
      shipping: orderData.shipping,
      line_items: orderData.line_items.map((item: any) => ({
        id: Math.floor(Math.random() * 1000),
        product_id: item.product_id,
        quantity: item.quantity,
        price: 75,
        total: item.quantity * 75
      })),
      date_created: new Date().toISOString(),
      payment_method: orderData.payment_method,
      payment_method_title: orderData.payment_method_title
    };

    console.log('✅ Demo Order Created:', fakeOrder);
    return fakeOrder;
  }

  // Create a new order
  async createOrder(orderData: any): Promise<any> {
    try {
      // Use demo mode if enabled
      if (this.config.demoMode) {
        return await this.simulateOrder(orderData);
      }

      // Real WooCommerce API call
      const response = await fetch(`${this.getApiUrl()}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WooCommerce API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Order created successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ WooCommerce API Error:', error);
      throw error;
    }
  }

  // Get product details
  async getProduct(productId: number): Promise<any> {
    try {
      // Demo mode simulation
      if (this.config.demoMode) {
        console.log(`🧪 Demo Mode: Getting product ${productId}`);
        const demoProducts: { [key: number]: any } = {
          28427: {
            id: 28427,
            name: 'إن كيو أرجيتون شراب',
            price: '75',
            description: 'مكمل غذائي لدعم النمو وزيادة الطول للأطفال',
            status: 'publish',
            in_stock: true
          },
          28431: {
            id: 28431,
            name: 'إن كيو أرجيتون أقراص 30 قرص',
            price: '75',
            description: 'مكمل غذائي في شكل أقراص لدعم النمو الصحي',
            status: 'publish',
            in_stock: true
          }
        };
        return demoProducts[productId] || null;
      }

      // Real API call
      const response = await fetch(`${this.getApiUrl()}/products/${productId}`, {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product ${productId}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Demo mode always returns true
      if (this.config.demoMode) {
        console.log('🧪 Demo Mode: Connection test successful');
        return true;
      }

      // Real connection test
      const response = await fetch(`${this.getApiUrl()}/products?per_page=1`, {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Toggle demo mode
  setDemoMode(enabled: boolean): void {
    this.config.demoMode = enabled;
    console.log(`🔧 Demo Mode ${enabled ? 'Enabled' : 'Disabled'}`);
    this.validateConfig();
  }

  // Get current mode
  isDemoMode(): boolean {
    return this.config.demoMode || false;
  }

  // Get orders with filtering options
  async getOrders(params: { 
    per_page?: number; 
    page?: number; 
    status?: string;
    source_filter?: boolean; // Filter only orders from quick_order_form
  } = {}): Promise<any> {
    try {
      // Demo mode simulation
      if (this.config.demoMode) {
        console.log('🧪 Demo Mode: Getting orders');
        const demoOrders = Array.from({length: params.per_page || 10}, (_, i) => ({
          id: Date.now() + i,
          number: `WC-${1000 + i}`,
          status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
          date_created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          total: (75 + Math.random() * 100).toFixed(2),
          currency: 'SAR',
          billing: {
            first_name: `عميل ${i + 1}`,
            last_name: 'الكريم',
            phone: `+966501234${String(i).padStart(3, '0')}`,
            city: ['الرياض', 'جدة', 'الدمام', 'مكة'][Math.floor(Math.random() * 4)],
            email: `customer${i + 1}@example.com`
          },
          line_items: [{
            name: Math.random() > 0.5 ? 'إن كيو أرجيتون شراب' : 'إن كيو أرجيتون أقراص',
            quantity: Math.floor(Math.random() * 3) + 1,
            price: 75,
            product_id: Math.random() > 0.5 ? 28427 : 28431
          }],
          meta_data: [
            {
              key: '_order_source',
              value: 'quick_order_form'
            }
          ]
        }));
        
        // Filter by source if requested
        if (params.source_filter) {
          return demoOrders.filter(order => 
            order.meta_data.some(meta => 
              meta.key === '_order_source' && meta.value === 'quick_order_form'
            )
          );
        }
        
        return demoOrders;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.status) queryParams.append('status', params.status);

      // Real API call
      const response = await fetch(`${this.getApiUrl()}/orders?${queryParams}`, {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      let orders = await response.json();
      
      // Filter by source if requested (only orders from quick_order_form)
      if (params.source_filter) {
        orders = orders.filter((order: any) => 
          order.meta_data && order.meta_data.some((meta: any) => 
            meta.key === '_order_source' && meta.value === 'quick_order_form'
          )
        );
      }
      
      console.log('✅ Orders fetched successfully:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      // Demo mode simulation
      if (this.config.demoMode) {
        console.log(`🧪 Demo Mode: Updating order ${orderId} status to ${status}`);
        const result = {
          id: orderId,
          status: status,
          date_modified: new Date().toISOString()
        };
        
        // Trigger order status change event for auto-unlock functionality
        window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
          detail: { orderId, status, order: result }
        }));
        
        return result;
      }

      // Real API call
      const response = await fetch(`${this.getApiUrl()}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order status updated successfully:', result);
      
      // Trigger order status change event for auto-unlock functionality
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId, status, order: result }
      }));
      
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const wooCommerceService = new WooCommerceService();

// Development helper functions
if (import.meta.env.DEV) {
  (window as any).wooCommerceService = wooCommerceService;
  console.log('🛒 WooCommerce Service available in console as: wooCommerceService');
  console.log('📝 Available commands:');
  console.log('  - wooCommerceService.testConnection()');
  console.log('  - wooCommerceService.getProduct(28427)');
  console.log('  - wooCommerceService.setDemoMode(false)');
  console.log('  - wooCommerceService.isDemoMode()');
} 