import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Truck, Phone, MapPin, User, Package, Plus, Minus, ShoppingCart, RotateCcw } from 'lucide-react';
import { PurchaseUtils } from '../utils/purchaseUtils';
import { wooCommerceService } from '../services/woocommerceService';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductQuantity {
  [productId: number]: number;
}

interface OrderFormData {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  email?: string;
  notes?: string;
}

const QuickOrderSection: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    email: '',
    notes: '',
  });
  const [quantities, setQuantities] = useState<ProductQuantity>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Products configuration
  const PRODUCTS: Product[] = [
    {
      id: 28427,
      name: 'إن كيو أرجيتون شراب',
      description: 'الحل المثالي لنمو طفلك وصحته - مكمل غذائي لدعم نمو الأطفال وزيادة الطول بطريقة طبيعية وآمنة بنكهة البرتقال المحببة',
      price: 75,
      image: 'https://lh3.googleusercontent.com/d/1IOj68mzyq1Mqv2Z6uW8ZP5ZJoS2IOilT'
    },
    {
      id: 28431,
      name: 'إن كيو أرجيتون أقراص 30 قرص',
      description: 'تركيز أعلى وتفوّق دراسي مضمون - مكمل الأرجنين الفعال لتعزيز الذاكرة والتركيز وزيادة التحصيل الدراسي',
      price: 75,
      image: '/lovable-uploads/NQ Argitone Tabs - Box & Jar.jpg'
    }
  ];

  const SHIPPING_FEE = 10; // SAR
  const FREE_SHIPPING_THRESHOLD = 200; // SAR

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateQuantity = (productId: number, change: number) => {
    setQuantities(prev => {
      const newQuantity = Math.max(0, (prev[productId] || 0) + change);
      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  };

  const setQuantity = (productId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    const orderItems = [];

    PRODUCTS.forEach(product => {
      const qty = quantities[product.id] || 0;
      if (qty > 0) {
        const itemTotal = product.price * qty;
        subtotal += itemTotal;
        orderItems.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          total: itemTotal
        });
      }
    });

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_FEE : 0);
    const total = subtotal + shipping;

    return { subtotal, shipping, total, orderItems };
  };

  const { subtotal, shipping, total, orderItems } = calculateTotals();
  const hasItems = orderItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasItems) {
      alert('يرجى اختيار منتج واحد على الأقل');
      return;
    }

    setIsSubmitting(true);
    setOrderStatus('processing');

    try {
      // WooCommerce API integration
      const billingData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        country: 'SA',
        phone: formData.phone,
      };

      // Only include email if it's provided and valid
      if (formData.email && formData.email.trim() !== '') {
        billingData.email = formData.email.trim();
      }

      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'الدفع عند الاستلام',
        set_paid: false,
        status: 'processing', // Set order status as processing
        billing: billingData,
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          country: 'SA',
        },
        line_items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_lines: shipping > 0 ? [{
          method_id: 'flat_rate',
          method_title: 'شحن عادي',
          total: shipping.toString()
        }] : [],
        customer_note: formData.notes || '',
        meta_data: [
          {
            key: '_order_source',
            value: 'quick_order_form'
          },
          {
            key: '_order_status',
            value: 'processing'
          }
        ]
      };

      // Submit to WooCommerce API
      const response = await wooCommerceService.createOrder(orderData);
      
      console.log('Order submitted successfully:', response);
      
      // Save order details
      setOrderDetails(response);
      setOrderStatus('completed');
      
      // Calculate total quantity purchased
      const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Mark as purchased using utility with quantity
      PurchaseUtils.markAsPurchased(totalQuantity);
      
      setOrderSubmitted(true);
      
    } catch (error) {
      console.error('Order submission failed:', error);
      setOrderStatus('failed');
      alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset form and start a new order
  const handleMakeAnotherOrder = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      address: '',
      email: '',
      notes: '',
    });
    setQuantities({});
    setOrderSubmitted(false);
    setOrderDetails(null);
    setOrderStatus('pending');
    
    // Scroll to the order section
    const orderSection = document.getElementById('order-section');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (orderSubmitted) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-green-200">
            <CheckCircle className="w-16 md:w-20 h-16 md:h-20 text-green-500 mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-3 md:mb-4">
              تم إرسال طلبك بنجاح! 🎉
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
              شكراً لك! سيتم التواصل معك قريباً لتأكيد الطلب والتسليم
            </p>
            
            {/* Order Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-semibold">حالة الطلب: قيد المعالجة</span>
              </div>
              {orderDetails && (
                <p className="text-blue-800 font-semibold text-center">
                  🔢 رقم الطلب: {orderDetails.id || 'غير متاح'}
                </p>
              )}
              <p className="text-blue-700 text-sm mt-1 text-center">
                احتفظ بهذا الرقم للمتابعة
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-semibold">
                🎁 مبروك! الآن يمكنك الوصول إلى مؤشر نمو الأطفال المجاني
              </p>
              <p className="text-amber-700 text-sm mt-2">
                مرر لأسفل لاستخدام أداة تقييم نمو طفلك المدعومة بالذكاء الاصطناعي
              </p>
            </div>

            {/* Make Another Order Button */}
            <div className="mb-6">
              <Button
                onClick={handleMakeAnotherOrder}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 ml-2" />
                عمل طلب آخر
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">ملخص الطلب:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {orderItems.map(item => (
                  <div key={item.product_id} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{item.total} ريال</span>
                  </div>
                ))}
                {shipping > 0 && (
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>{shipping} ريال</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>المجموع الكلي</span>
                  <span>{total} ريال</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-section" className="py-12 md:py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-600 mb-4">
            اطلب الآن - الدفع عند الاستلام
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            احصل على منتجاتك مع ضمان الجودة والأمان
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Products Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <ShoppingCart className="w-6 h-6" />
                  اختر منتجاتك
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 md:space-y-6">
                  {PRODUCTS.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-amber-300 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                          
                          {/* Detailed info for syrup */}
                          {product.id === 28427 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                              <h4 className="font-semibold text-orange-800 text-sm mb-2">المكونات الرئيسية:</h4>
                              <div className="text-xs text-orange-700 grid grid-cols-2 gap-1">
                                <span>• إل-أرجينين</span>
                                <span>• إل-كارنيتين</span>
                                <span>• فوسفاتيديل سيرين</span>
                                <span>• فيتامين C</span>
                                <span>• فيتامينات ب المركبة</span>
                                <span>• فيتامين D3 + A + K + E</span>
                                <span>• الحديد والزنك</span>
                                <span>• معادن متعددة</span>
                              </div>
                              <div className="mt-2 text-xs text-orange-600">
                                <span className="font-semibold">الجرعة:</span> ملعقة صغيرة (5 مل) يومياً من سنتين إلى 10 سنوات
                              </div>
                            </div>
                          )}
                          
                          {/* Benefits for syrup */}
                          {product.id === 28427 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <h4 className="font-semibold text-green-800 text-sm mb-2">الفوائد:</h4>
                              <div className="text-xs text-green-700 space-y-1">
                                <div>✓ نمو صحي وطول مثالي</div>
                                <div>✓ تقوية جهاز المناعة</div>
                                <div>✓ دعم التطور العقلي</div>
                                <div>✓ تنظيم الهرمونات</div>
                                <div>✓ زيادة النشاط والطاقة</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Detailed info for tablets */}
                          {product.id === 28431 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <h4 className="font-semibold text-blue-800 text-sm mb-2">المكونات الرئيسية:</h4>
                              <div className="text-xs text-blue-700 grid grid-cols-2 gap-1">
                                <span>• إل-أرجينين: 200 ملغ</span>
                                <span>• فوسفاتيديل سيرين: 200 ملغ</span>
                                <span>• إل-كارنيتين: 50 ملغ</span>
                                <span>• الكولين: 50 ملغ</span>
                                <span>• فيتامينات متعددة</span>
                                <span>• معادن أساسية</span>
                              </div>
                              <div className="mt-2 text-xs text-blue-600">
                                <span className="font-semibold">الجرعة:</span> من 10-22 سنة: قرص إلى قرصين يومياً
                              </div>
                            </div>
                          )}
                          
                          {/* Benefits for tablets */}
                          {product.id === 28431 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <h4 className="font-semibold text-green-800 text-sm mb-2">الفوائد:</h4>
                              <div className="text-xs text-green-700 space-y-1">
                                <div>✓ تحسين الذاكرة والتركيز</div>
                                <div>✓ زيادة التحصيل الدراسي</div>
                                <div>✓ تعزيز الطاقة الذهنية</div>
                                <div>✓ تقوية جهاز المناعة</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <span className="text-amber-600 font-bold text-lg">{product.price} ريال</span>
                            <div className="flex items-center gap-2 md:gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, -1)}
                                disabled={!quantities[product.id]}
                                className="w-8 h-8 p-0 border-amber-300 text-amber-600 hover:bg-amber-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={quantities[product.id] || 0}
                                onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 0)}
                                className="w-16 text-center border-amber-300 focus:border-amber-500"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-8 h-8 p-0 border-amber-300 text-amber-600 hover:bg-amber-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <User className="w-6 h-6" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-700">الاسم الأول *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="محمد"
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-700">اسم العائلة *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="أحمد"
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1 text-gray-700">
                      <Phone className="w-4 h-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      dir="ltr"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="flex items-center gap-1 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      المدينة *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="الرياض"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-700">العنوان التفصيلي *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="الحي، الشارع، رقم المبنى"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-gray-700">ملاحظات إضافية (اختياري)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات خاصة بالطلب..."
                      rows={3}
                      className="w-full p-3 border border-amber-300 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 lg:sticky lg:top-4">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Package className="w-6 h-6" />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">لم يتم اختيار أي منتج</p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map(item => (
                        <div key={item.product_id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-600">{item.quantity} × {item.price} ريال</p>
                          </div>
                          <span className="font-semibold text-amber-600">{item.total} ريال</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasItems && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>المجموع الفرعي:</span>
                          <span>{subtotal} ريال</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            الشحن:
                          </span>
                          <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                            {shipping === 0 ? 'مجاني' : `${shipping} ريال`}
                          </span>
                        </div>
                        {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                          <p className="text-xs text-amber-600">
                            أضف {FREE_SHIPPING_THRESHOLD - subtotal} ريال للحصول على شحن مجاني
                          </p>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>المجموع الكلي:</span>
                        <span className="text-amber-600">{total} ريال</span>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!hasItems || isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 mt-6"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري معالجة الطلب...
                      </>
                    ) : (
                      'تأكيد الطلب - الدفع عند الاستلام'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    بتأكيد الطلب، ستحصل على إمكانية الوصول لمؤشر نمو الأطفال مجاناً
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickOrderSection; 