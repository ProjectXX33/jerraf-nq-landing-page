import React, { useState, useEffect } from 'react';
import { AdminUtils } from '../utils/adminUtils';
import { CustomerGrowthUtils } from '../utils/customerGrowthUtils';
import { OrderGrowthUtils } from '../utils/orderGrowthUtils';
import { wooCommerceService } from '../services/woocommerceService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  LogOut, 
  RefreshCw, 
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Users,
  UserX,
  Edit3,
  Trash2
} from 'lucide-react';

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  billing: {
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    email?: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    price: number;
    product_id: number;
  }>;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(AdminUtils.isLoggedIn());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [growthSystemEnabled, setGrowthSystemEnabled] = useState(AdminUtils.isGrowthSystemEnabled());
  const [sessionInfo, setSessionInfo] = useState(AdminUtils.getSessionInfo());
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [customerGrowthStats, setCustomerGrowthStats] = useState(CustomerGrowthUtils.getStatistics());
  const [onlyFormOrders, setOnlyFormOrders] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerAction, setCustomerAction] = useState<{ action: 'block' | 'unblock', reason: string }>({
    action: 'block',
    reason: ''
  });
  const [orderGrowthStats, setOrderGrowthStats] = useState(OrderGrowthUtils.getStatistics());

  // Update session info every minute
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const info = AdminUtils.getSessionInfo();
      setSessionInfo(info);
      
      if (!info.isValid) {
        setIsLoggedIn(false);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Listen for admin settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      setIsLoggedIn(AdminUtils.isLoggedIn());
      setGrowthSystemEnabled(AdminUtils.isGrowthSystemEnabled());
    };

    const handleCustomerSettingsChange = () => {
      setCustomerGrowthStats(CustomerGrowthUtils.getStatistics());
    };

    const handleOrderGrowthAccessChange = () => {
      setOrderGrowthStats(OrderGrowthUtils.getStatistics());
    };

    // Auto-unlock Growth System when order is completed
    const handleOrderStatusUpdated = (event: any) => {
      const { orderId, status } = event.detail;
      
      if (status === 'completed') {
        console.log(`✅ Order ${orderId} completed - will be auto-enabled on next admin dashboard reload`);
        
        // Trigger order growth access change to update statistics
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('orderGrowthAccessChanged'));
        }, 100);
      }
    };

    window.addEventListener('adminSettingsChanged', handleSettingsChange);
    window.addEventListener('customerGrowthSettingsChanged', handleCustomerSettingsChange);
    window.addEventListener('orderGrowthAccessChanged', handleOrderGrowthAccessChange);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdated);
    
    return () => {
      window.removeEventListener('adminSettingsChanged', handleSettingsChange);
      window.removeEventListener('customerGrowthSettingsChanged', handleCustomerSettingsChange);
      window.removeEventListener('orderGrowthAccessChanged', handleOrderGrowthAccessChange);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdated);
    };
  }, []); // No dependencies to avoid circular dependency issues

  // Load orders when logged in or filter changes
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn, onlyFormOrders]);

  const handleLogin = () => {
    setLoginError('');
    
    if (AdminUtils.login(password)) {
      setIsLoggedIn(true);
      setPassword('');
      setSessionInfo(AdminUtils.getSessionInfo());
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    AdminUtils.logout();
    setIsLoggedIn(false);
    setPassword('');
    setOrders([]);
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError('');
    
    try {
      const fetchedOrders = await wooCommerceService.getOrders({ 
        per_page: 50,
        page: 1,
        source_filter: onlyFormOrders
      });
      setOrders(fetchedOrders);
    } catch (error) {
      setOrdersError('فشل في تحميل الطلبات: ' + (error as Error).message);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await wooCommerceService.updateOrderStatus(orderId, newStatus);
      
      // Update local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Auto-unlock Growth System when order becomes completed
      if (newStatus === 'completed') {
        const completedOrder = orders.find(order => order.id === orderId);
        if (completedOrder) {
          const customerEmail = OrderGrowthUtils.getCustomerEmailFromOrder(completedOrder);
          const customerName = `${completedOrder.billing.first_name} ${completedOrder.billing.last_name}`;
          const maxUsage = OrderGrowthUtils.calculateMaxUsageFromOrder(completedOrder);
          
          // Auto-enable Growth System for this completed order
          OrderGrowthUtils.enableGrowthForOrder(
            completedOrder.id,
            completedOrder.number,
            customerEmail,
            customerName,
            maxUsage,
            'auto-system',
            `تم التفعيل تلقائياً عند إتمام الطلب - ${maxUsage} استخدام متاح`
          );
          
          console.log(`✅ Auto-enabled Growth System for order ${completedOrder.number} - ${maxUsage} usages`);
          
          // Update statistics
          setOrderGrowthStats(OrderGrowthUtils.getStatistics());
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleCustomerGrowthToggle = (customerEmail: string, enabled: boolean, reason?: string) => {
    CustomerGrowthUtils.setCustomerStatus(customerEmail, enabled, reason);
    setCustomerGrowthStats(CustomerGrowthUtils.getStatistics());
    setSelectedCustomer(null);
    setCustomerAction({ action: 'block', reason: '' });
  };

  const handleOrderGrowthToggle = (order: Order, enabled: boolean) => {
    const customerEmail = OrderGrowthUtils.getCustomerEmailFromOrder(order);
    const customerName = `${order.billing.first_name} ${order.billing.last_name}`;
    const maxUsage = OrderGrowthUtils.calculateMaxUsageFromOrder(order);
    
    if (enabled) {
      OrderGrowthUtils.enableGrowthForOrder(
        order.id,
        order.number,
        customerEmail,
        customerName,
        maxUsage,
        'admin',
        'تم التفعيل من لوحة التحكم'
      );
    } else {
      OrderGrowthUtils.disableGrowthForOrder(order.id);
    }
    
    setOrderGrowthStats(OrderGrowthUtils.getStatistics());
  };

  const handleGrowthSystemToggle = (enabled: boolean) => {
    AdminUtils.toggleGrowthSystem(enabled);
    setGrowthSystemEnabled(enabled);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      pending: { label: 'في الانتظار', variant: 'destructive' },
      processing: { label: 'قيد المعالجة', variant: 'default' },
      completed: { label: 'مكتمل', variant: 'default' },
      'on-hold': { label: 'في الانتظار', variant: 'secondary' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
      refunded: { label: 'مسترد', variant: 'secondary' },
      failed: { label: 'فاشل', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueCustomers = (): Array<{
    email: string;
    name: string;
    phone: string;
    orderCount: number;
    lastOrderDate: string;
    isGrowthEnabled: boolean;
  }> => {
    const customerMap = new Map();
    
    orders.forEach(order => {
      const email = CustomerGrowthUtils.getCustomerEmailFromOrder(order);
      const name = `${order.billing.first_name} ${order.billing.last_name}`;
      
      if (customerMap.has(email)) {
        const existing = customerMap.get(email);
        existing.orderCount++;
        if (new Date(order.date_created) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.date_created;
        }
      } else {
        customerMap.set(email, {
          email,
          name,
          phone: order.billing.phone,
          orderCount: 1,
          lastOrderDate: order.date_created,
          isGrowthEnabled: CustomerGrowthUtils.getCustomerStatus(email).isEnabled
        });
      }
    });
    
    return Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              لوحة التحكم الإدارية
            </CardTitle>
            <p className="text-gray-600">
              تسجيل الدخول للوصول إلى لوحة التحكم
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm text-center">
                {loginError}
              </div>
            )}
            
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!password.trim()}
            >
              تسجيل الدخول
            </Button>
            
            <div className="text-xs text-gray-500 text-center">

            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">لوحة التحكم الإدارية</CardTitle>
                  <p className="text-gray-600">إدارة الطلبات ونظام النمو</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {sessionInfo.isValid && (
                  <div className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline ml-1" />
                    باقي من الجلسة: {AdminUtils.formatTimeRemaining(sessionInfo.timeRemaining)}
                  </div>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Growth System Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {growthSystemEnabled ? (
                <Unlock className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-red-600" />
              )}
              التحكم في نظام النمو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Global Control */}
              <div>
                <h4 className="font-semibold mb-2">التحكم العام</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      حالة النظام: {growthSystemEnabled ? (
                        <span className="text-green-600 font-bold">مُفعَّل</span>
                      ) : (
                        <span className="text-red-600 font-bold">مُعطَّل</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {growthSystemEnabled 
                        ? 'النظام متاح للعملاء المصرح لهم'
                        : 'النظام معطل بالكامل'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={growthSystemEnabled}
                    onCheckedChange={handleGrowthSystemToggle}
                  />
                </div>
              </div>
              
              {/* Per-Order Statistics */}
              <div>
                <h4 className="font-semibold mb-2">إحصائيات الطلبات</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>طلبات مُفعلة:</span>
                    <span className="font-bold text-green-600">{orderGrowthStats.enabledOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طلبات مُعطلة:</span>
                    <span className="font-bold text-red-600">{orderGrowthStats.disabledOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>استخدامات متبقية:</span>
                    <span className="font-bold text-blue-600">{orderGrowthStats.remainingUsages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الاستخدامات:</span>
                    <span className="font-bold">{orderGrowthStats.totalUsages}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={activeTab === 'orders' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  الطلبات
                </Button>
                <Button
                  variant={activeTab === 'customers' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('customers')}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  العملاء ({customerGrowthStats.totalCustomers})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'orders' && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="form-orders" className="text-sm">
                      طلبات النموذج فقط
                    </Label>
                    <Switch
                      id="form-orders"
                      checked={onlyFormOrders}
                      onCheckedChange={setOnlyFormOrders}
                    />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={loadOrders}
                  disabled={isLoadingOrders}
                >
                  <RefreshCw className={`w-4 h-4 ml-2 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Orders Section */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                الطلبات {onlyFormOrders ? '(من النموذج فقط)' : '(جميع الطلبات)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p>جاري تحميل الطلبات...</p>
                </div>
              ) : ordersError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                  <p className="text-red-600">{ordersError}</p>
                  <Button variant="outline" onClick={loadOrders} className="mt-4">
                    المحاولة مرة أخرى
                  </Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">لا توجد طلبات</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">طلب #{order.number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {order.total} {order.currency}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p><strong>العميل:</strong> {order.billing.first_name} {order.billing.last_name}</p>
                          <p><strong>الهاتف:</strong> {order.billing.phone}</p>
                          <p><strong>المدينة:</strong> {order.billing.city}</p>
                          {order.billing.email && (
                            <p><strong>البريد:</strong> {order.billing.email}</p>
                          )}
                        </div>
                        <div>
                          <p><strong>التاريخ:</strong> {formatDate(order.date_created)}</p>
                          <p><strong>المنتجات:</strong></p>
                          <ul className="mt-1 space-y-1">
                            {order.line_items.map((item, index) => (
                              <li key={index} className="text-gray-600">
                                • {item.name} (الكمية: {item.quantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <strong>تغيير الحالة:</strong>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {order.status !== 'processing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                className="text-xs"
                              >
                                قيد المعالجة
                              </Button>
                            )}
                            {order.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="text-xs"
                              >
                                مكتمل
                              </Button>
                            )}
                          </div>
                          
                          {/* Growth System Per-Order Control */}
                          <div className="border-t pt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <strong className="text-xs">نظام النمو:</strong>
                              {(() => {
                                const orderAccess = OrderGrowthUtils.getOrderAccess(order.id);
                                return orderAccess?.isGrowthEnabled ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    مُفعل ({orderAccess.maxUsage - orderAccess.usageCount}/{orderAccess.maxUsage})
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">معطل</Badge>
                                );
                              })()}
                            </div>
                            <div className="flex gap-1">
                              {(() => {
                                const orderAccess = OrderGrowthUtils.getOrderAccess(order.id);
                                return orderAccess?.isGrowthEnabled ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleOrderGrowthToggle(order, false)}
                                    className="text-xs"
                                  >
                                    <Lock className="w-3 h-3 ml-1" />
                                    تعطيل
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOrderGrowthToggle(order, true)}
                                    className="text-xs"
                                  >
                                    <Unlock className="w-3 h-3 ml-1" />
                                    تفعيل
                                  </Button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-6 text-sm text-gray-600">
                    عرض {orders.length} طلب من الطلبات الأخيرة
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customers Section */}
        {activeTab === 'customers' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                إدارة العملاء - نظام النمو
              </CardTitle>
              <p className="text-sm text-gray-600">
                المُفعل: {customerGrowthStats.enabledCustomers} | 
                المُعطل: {customerGrowthStats.blockedCustomers} | 
                الإجمالي: {customerGrowthStats.totalCustomers}
              </p>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">لا توجد بيانات عملاء. قم بتحميل الطلبات أولاً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getUniqueCustomers().map((customer) => (
                    <div
                      key={customer.email}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.name}</h3>
                          {customer.isGrowthEnabled ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Unlock className="w-3 h-3 ml-1" />
                              مُفعل
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <Lock className="w-3 h-3 ml-1" />
                              مُعطل
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {customer.isGrowthEnabled ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedCustomer(customer.email)}
                              className="text-xs"
                            >
                              <UserX className="w-3 h-3 ml-1" />
                              تعطيل النمو
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCustomerGrowthToggle(customer.email, true)}
                              className="text-xs"
                            >
                              <Unlock className="w-3 h-3 ml-1" />
                              تفعيل النمو
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>البريد/المعرف:</strong> {customer.email}</p>
                          <p><strong>الهاتف:</strong> {customer.phone}</p>
                        </div>
                        <div>
                          <p><strong>عدد الطلبات:</strong> {customer.orderCount}</p>
                          <p><strong>آخر طلب:</strong> {formatDate(customer.lastOrderDate)}</p>
                        </div>
                        <div>
                          {!customer.isGrowthEnabled && (
                            <div className="text-red-600">
                              <p><strong>سبب التعطيل:</strong> {CustomerGrowthUtils.formatBlockReason(
                                CustomerGrowthUtils.getCustomerStatus(customer.email).reason
                              )}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Action Modal */}
        {selectedCustomer && (
          <Card className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">تعطيل نظام النمو للعميل</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">سبب التعطيل</Label>
                  <select
                    id="reason"
                    value={customerAction.reason}
                    onChange={(e) => setCustomerAction(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">اختر السبب</option>
                    <option value="abuse">سوء استخدام</option>
                    <option value="excessive_usage">استخدام مفرط</option>
                    <option value="violation">مخالفة الشروط</option>
                    <option value="admin_decision">قرار إداري</option>
                    <option value="technical_issue">مشكلة تقنية</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleCustomerGrowthToggle(selectedCustomer, false, customerAction.reason);
                    }}
                    variant="destructive"
                    disabled={!customerAction.reason}
                  >
                    تأكيد التعطيل
                  </Button>
                  <Button
                    onClick={() => setSelectedCustomer(null)}
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
