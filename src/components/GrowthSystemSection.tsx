import React, { useState, useCallback, useEffect } from 'react';
import { ChildData, ReportData, Gender, AgeUnit, FormData } from '../types/growth-system';
import { generateGrowthReport } from '../services/geminiService';
import ReportCard from './growth-system/ReportCard';
import InputForm from './growth-system/InputForm';
import ProductPromoCard from './growth-system/ProductPromoCard';
import { Lock, Star, Brain, TrendingUp, Shield, Settings } from 'lucide-react';
import { PurchaseUtils } from '../utils/purchaseUtils';
import { AdminUtils } from '../utils/adminUtils';
import { CustomerGrowthUtils } from '../utils/customerGrowthUtils';
import { OrderGrowthUtils } from '../utils/orderGrowthUtils';
import { OrderSupabaseService } from '../services/orderSupabaseService';
import { CustomCodeService } from '../services/customCodeService';
import { useGrowthSystem } from '../contexts/GrowthSystemContext';

const GrowthSystemSection: React.FC = () => {
  // Use the growth system context for real-time state
  const { settings: growthSettings } = useGrowthSystem();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: Gender.MALE,
    age: '',
    ageUnit: AgeUnit.MONTHS,
    weight: '',
    height: '',
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState({ total: 0, used: 0, remaining: 0 });
  const [showExhaustedState, setShowExhaustedState] = useState<boolean>(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isCustomerBlocked, setIsCustomerBlocked] = useState<boolean>(false);
  const [orderBasedUsage, setOrderBasedUsage] = useState({ canUse: false, availableUsages: 0, enabledOrders: [] });
  const [currentCustomCode, setCurrentCustomCode] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderCheckError, setOrderCheckError] = useState<string>('');
  
  // Get admin lock status directly from context (real-time)
  const isAdminLocked = !growthSettings.isEnabled;

  // Function to check order access across both Supabase and local data
  const checkCustomerOrderAccess = async (email: string) => {
    try {
      // Check Supabase first
      const supabaseAccess = await OrderSupabaseService.canCustomerUseGrowthSystem(email);
      
      // Check local data as fallback
      const localAccess = OrderGrowthUtils.canCustomerUseGrowthSystem(email);
      
      // Combine the results - prioritize Supabase if it has data
      const hasSupabaseData = supabaseAccess.enabledOrders.length > 0;
      
      if (hasSupabaseData) {
        return {
          canUse: supabaseAccess.canUse,
          availableUsages: supabaseAccess.availableUsages,
          enabledOrders: supabaseAccess.enabledOrders.map(order => ({
            orderId: order.order_id,
            orderNumber: order.order_number,
            maxUsage: order.max_usage,
            usageCount: order.usage_count
          }))
        };
      } else {
        return localAccess;
      }
    } catch (error) {
      console.error('Error checking order access:', error);
      // Fallback to local data only
      return OrderGrowthUtils.canCustomerUseGrowthSystem(email);
    }
  };

  // Check purchase status on component mount
  useEffect(() => {
    const updateStatus = async () => {
      // Check old purchase system for backward compatibility
      const purchased = PurchaseUtils.hasPurchased();
      const stats = PurchaseUtils.getUsageStats();
      setHasPurchased(purchased);
      setUsageStats(stats);
      
      // Check new order-based system with hybrid approach
      const email = customerEmail || 'guest_user@temp.com';
      
      try {
        const orderUsage = await checkCustomerOrderAccess(email);
        setOrderBasedUsage(orderUsage);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };

    updateStatus();
    
    // Clear any existing demo data
    if (import.meta.env.DEV) {
      const existingData = OrderGrowthUtils.getEnabledOrders();
      const demoOrders = existingData.filter(order => 
        order.orderNumber === 'WC-1001' || 
        order.orderNumber === 'WC-1002' || 
        order.orderNumber === 'DEMO-123'
      );
      
      if (demoOrders.length > 0) {
        demoOrders.forEach(order => {
          OrderGrowthUtils.disableGrowthForOrder(order.orderId);
        });
      }
    }

    // Listen for purchase completion event
    const handlePurchaseCompleted = () => {
      updateStatus();
      setShowExhaustedState(false); // Reset exhausted state on new purchase
    };

    // Listen for purchase reset event (for testing)
    const handlePurchaseReset = () => {
      updateStatus();
      setShowExhaustedState(false);
    };

    // Listen for growth system usage event
    const handleGrowthSystemUsed = () => {
      updateStatus();
    };

    // Growth system toggle is now handled by context - no event listener needed

    // Listen for customer growth settings changes
    const handleCustomerGrowthSettingsChanged = () => {
      if (customerEmail) {
        const customerStatus = CustomerGrowthUtils.getCustomerStatus(customerEmail);
        setIsCustomerBlocked(!customerStatus.isEnabled);
      }
    };

    // Listen for order growth access changes
    const handleOrderGrowthAccessChanged = () => {
      updateStatus();
      
      // Also update order-based usage if customer email is set
      if (customerEmail) {
        checkCustomerOrderAccess(customerEmail).then(updatedUsage => {
          setOrderBasedUsage(updatedUsage);
        });
      }
    };

    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    window.addEventListener('purchaseReset', handlePurchaseReset);
    window.addEventListener('growthSystemUsed', handleGrowthSystemUsed);
    window.addEventListener('customerGrowthSettingsChanged', handleCustomerGrowthSettingsChanged);
    window.addEventListener('orderGrowthAccessChanged', handleOrderGrowthAccessChanged);

    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
      window.removeEventListener('purchaseReset', handlePurchaseReset);
      window.removeEventListener('growthSystemUsed', handleGrowthSystemUsed);
      window.removeEventListener('customerGrowthSettingsChanged', handleCustomerGrowthSettingsChanged);
      window.removeEventListener('orderGrowthAccessChanged', handleOrderGrowthAccessChanged);
    };
  }, []);

  // Add an effect to reset exhausted state when order-based usage becomes valid
  useEffect(() => {
    if (orderBasedUsage.canUse && orderBasedUsage.availableUsages > 0) {
      console.log('🔄 Resetting exhausted state due to valid order-based usage');
      setShowExhaustedState(false);
    }
  }, [orderBasedUsage.canUse, orderBasedUsage.availableUsages]);

  // Add an effect to refresh state when customerEmail changes (but only if no current access)
  useEffect(() => {
    if (customerEmail && customerEmail !== 'guest_user@temp.com' && !orderBasedUsage.canUse) {
      const refreshAccess = async () => {
        try {
          const orderUsage = await checkCustomerOrderAccess(customerEmail);
          
          // Only update if we found access or if current state shows no access
          if (orderUsage.canUse || !orderBasedUsage.canUse) {
            setOrderBasedUsage(orderUsage);
            
            // Clear any existing errors/exhausted state if user now has access
            if (orderUsage.canUse && orderUsage.availableUsages > 0) {
              setError(null);
              setShowExhaustedState(false);
            }
          }
        } catch (error) {
          console.error('Error refreshing access:', error);
        }
      };
      
      refreshAccess();
    }
  }, [customerEmail]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const generateReport = async () => {
    if (!formData.name.trim() || !formData.age || !formData.weight || !formData.height) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }

    const age = Number(formData.age);
    const weight = Number(formData.weight);
    const height = Number(formData.height);

    if (isNaN(age) || age <= 0 || isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0) {
      setError('يرجى إدخال قيم رقمية صحيحة وموجبة للعمر والوزن والطول.');
      return;
    }
    
    const childDataForApi: ChildData = {
      name: formData.name.trim(),
      gender: formData.gender,
      ageUnit: formData.ageUnit,
      age,
      weight,
      height,
    };
    
    setError(null);
    setIsLoading(true);
    setReport(null);
    
    try {
      const generatedReport = await generateGrowthReport(childDataForApi);
      setReport(generatedReport);
      
      // Clear form for next child but preserve access and customer data
      setFormData({
        name: '',
        gender: Gender.MALE,
        age: '',
        ageUnit: AgeUnit.MONTHS,
        weight: '',
        height: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get customer email for individual blocking check
    const email = customerEmail || `guest_user_${Date.now()}@temp.com`;
    
    // Check if user already has access from custom code (current orderBasedUsage state)
    // For custom codes, allow access even at 0 usages (will be checked during submission)
    const hasCustomCodeAccess = orderBasedUsage.canUse && orderBasedUsage.enabledOrders.length === 0;
    
    console.log('🔍 Form submission check:', {
      hasCustomCodeAccess,
      orderBasedUsage,
      email
    });
    
    // Only check order-based usage if user doesn't have custom code access
    let orderUsage;
    if (!hasCustomCodeAccess) {
      orderUsage = await checkCustomerOrderAccess(email);
    } else {
      // Use current orderBasedUsage state for custom code access
      orderUsage = orderBasedUsage;
    }
    
    // Check old purchase system for backward compatibility (only if admin system is enabled)
    const canUsePurchase = !isAdminLocked && PurchaseUtils.canUseGrowthSystem();
    
    // Customer can use if they have either custom code access, order-based usage OR old purchase-based usage
    const canUseSystem = hasCustomCodeAccess || orderUsage.canUse || canUsePurchase;
    
    // Check if user is trying to use at 0 usages (for custom codes)
    if (hasCustomCodeAccess && orderUsage.availableUsages <= 0) {
      console.log('🔒 Custom code usage at 0 - preventing submission');
      setError('لقد استنفدت جميع استخداماتك المتاحة من الكود المخصص.');
      setShowExhaustedState(true);
      // Don't clear anything - just lock the system
      return;
    }
    
    if (!canUseSystem) {
      if (orderUsage.enabledOrders.length === 0 && !hasPurchased) {
        setError('يجب عليك إتمام طلب أولاً للحصول على إمكانية استخدام نظام النمو.');
      } else {
        setError('لقد استنفدت جميع استخداماتك المتاحة. يرجى طلب المزيد من المنتجات للحصول على استخدامات إضافية.');
        setShowExhaustedState(true);
      }
      return;
    }
    
    // Check if customer is individually blocked
    if (!CustomerGrowthUtils.getCustomerStatus(email).isEnabled) {
      setError('تم تعطيل نظام النمو لحسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني.');
      return;
    }

    // Generate report and consume usage
    await generateReport();
    
    // Consume one usage after successful report generation
    if (orderUsage.canUse) {
      try {
        // Check if this is custom code access (no enabled orders)
        const isCustomCodeAccess = orderUsage.enabledOrders.length === 0 && hasCustomCodeAccess;
        
        console.log('🔍 Usage consumption check:', {
          isCustomCodeAccess,
          orderUsage,
          hasCustomCodeAccess
        });
        
        if (isCustomCodeAccess) {
          // For custom code access, we need to record usage in the database
          // Get the stored custom code from the separate state
          const storedCustomCode = currentCustomCode;
          
          if (storedCustomCode) {
            // Use the custom code (consume one usage)
            const usageResult = await CustomCodeService.useCustomCode(
              storedCustomCode.code,
              email,
              `Guest User ${Date.now()}`,
              undefined,
              undefined
            );
            
            if (usageResult.success) {
              // Update local state with new usage count
              const newAvailableUsages = orderUsage.availableUsages - 1;
              console.log('📊 Custom code usage consumed:', {
                previous: orderUsage.availableUsages,
                new: newAvailableUsages
              });
              
              // Ensure usage doesn't go below 0
              const finalUsages = Math.max(0, newAvailableUsages);
              console.log('🔧 Setting custom code access:', {
                finalUsages,
                canUse: true,
                willLockOnSubmit: finalUsages <= 0
              });
              setOrderBasedUsage({
                ...orderUsage,
                availableUsages: finalUsages,
                canUse: true  // Always allow access for custom codes, even at 0
              });
            } else {
              // Usage failed - show error
              setError(usageResult.error || 'فشل في استخدام الكود المخصص');
              return;
            }
          } else {
            // Fallback to local usage tracking
            const newAvailableUsages = orderUsage.availableUsages - 1;
            const finalUsages = Math.max(0, newAvailableUsages);
            setOrderBasedUsage({
              ...orderUsage,
              availableUsages: finalUsages,
              canUse: true
            });
          }
        } else {
          // Regular order-based usage consumption
          const hasSupabaseData = orderUsage.enabledOrders.some(order => 
            order.orderId && typeof order.orderId === 'number'
          );
          
          let usageConsumed = false;
          
          if (hasSupabaseData) {
            const result = await OrderSupabaseService.recordUsage(email, {
              name: formData.name,
              age: Number(formData.age),
              ageUnit: formData.ageUnit,
              gender: formData.gender,
              weight: Number(formData.weight),
              height: Number(formData.height)
            });
            usageConsumed = result.success;
          } else {
            // Fallback to local system
            usageConsumed = OrderGrowthUtils.useGrowthSystemForCustomer(email);
          }
          
          if (usageConsumed) {
            // Update the local state immediately
            const updatedUsage = await checkCustomerOrderAccess(email);
            setOrderBasedUsage(updatedUsage);
          } else {
            // Could not consume usage - user tried to use at 0 usages
            setError('لقد استنفدت جميع استخداماتك المتاحة. يرجى طلب المزيد من المنتجات للحصول على استخدامات إضافية.');
            setShowExhaustedState(true);
            
            // For order-based usage, clear everything when exhausted
            setFormData({
              name: '',
              gender: Gender.MALE,
              age: '',
              ageUnit: AgeUnit.MONTHS,
              weight: '',
              height: '',
            });
            setReport(null);
            setCustomerEmail('');
            setOrderBasedUsage({ canUse: false, availableUsages: 0, enabledOrders: [] });
            setCurrentCustomCode(null);
          }
        }
      } catch (error) {
        console.error('Error recording usage:', error);
        // Fallback to local system
        const usageConsumed = OrderGrowthUtils.useGrowthSystemForCustomer(email);
        if (usageConsumed) {
          const updatedUsage = await checkCustomerOrderAccess(email);
          setOrderBasedUsage(updatedUsage);
        } else {
          // Could not consume usage - user tried to use at 0 usages (fallback case)
          setError('لقد استنفدت جميع استخداماتك المتاحة. يرجى طلب المزيد من المنتجات للحصول على استخدامات إضافية.');
          setShowExhaustedState(true);
          
          // For order-based usage, clear everything when exhausted (fallback case)
          setFormData({
            name: '',
            gender: Gender.MALE,
            age: '',
            ageUnit: AgeUnit.MONTHS,
            weight: '',
            height: '',
          });
          setReport(null);
          setCustomerEmail('');
          setOrderBasedUsage({ canUse: false, availableUsages: 0, enabledOrders: [] });
        }
      }
    } else {
      PurchaseUtils.useGrowthSystem();
    }
  };
  
  const handleReset = () => {
    // Only reset the report and UI state, NOT the customer access data
    setReport(null);
    setError(null);
    setIsLoading(false);
    setShowExhaustedState(false);
    setCurrentCustomCode(null); // Clear custom code on reset
    
    // DON'T clear form data - let user continue with the same session
    // DON'T clear customerEmail or orderBasedUsage - preserve access
    
    // For custom code access, don't refresh from database (preserve local state)
    // For order-based access, refresh usage stats to show current remaining usages
    if (customerEmail && orderBasedUsage.enabledOrders.length > 0) {
      checkCustomerOrderAccess(customerEmail).then(updatedUsage => {
        setOrderBasedUsage(updatedUsage);
      });
    }
    // If it's custom code access (no enabled orders), keep the current state
  }

  const handleOrderOrCodeCheck = async () => {
    setOrderCheckError('');
    
    if (!orderNumber.trim()) {
      setOrderCheckError('يرجى إدخال رقم الطلب');
      return;
    }

    try {
      // First, check if this is a custom code
      const customCode = await CustomCodeService.getCustomCodeByCode(orderNumber.trim());
      
      if (customCode) {
        // Check if the code is already exhausted before trying to use it
        console.log('🔍 Pre-validation check:', {
          code: orderNumber.trim(),
          current_usage: customCode.current_usage,
          max_usage: customCode.max_usage,
          isExhausted: customCode.current_usage >= customCode.max_usage
        });
        
        if (customCode.current_usage >= customCode.max_usage) {
          console.log('❌ Code is exhausted, preventing usage');
          setOrderCheckError('تم استنفاذ عدد مرات استخدام الكود');
          return;
        }
        
        // This is a custom code, validate it (without using it)
        const customCodeResult = await CustomCodeService.validateCustomCode(
          orderNumber.trim()
        );
        
        if (customCodeResult.success) {
          // Custom code is valid and has been used
          setOrderCheckError('');
          
          // Calculate remaining usages BEFORE the usage was incremented
          // The customCode object from the initial check has the original usage count
          const remainingUsages = customCode ? 
            (customCode.max_usage - customCode.current_usage) : 1;
          
          console.log('🔍 Custom code activation:', {
            originalCode: customCode,
            updatedCode: customCodeResult.data?.code,
            remainingUsages,
            maxUsage: customCode?.max_usage,
            originalCurrentUsage: customCode?.current_usage,
            updatedCurrentUsage: customCodeResult.data?.code?.current_usage
          });
          
          alert(`✅ تم تفعيل الكود المخصص بنجاح! يمكنك الآن استخدام نظام النمو (${remainingUsages} استخدام متاح)`);
          
          // Set customer email and update access
          setCustomerEmail(`guest_user_${Date.now()}@temp.com`);
          setOrderBasedUsage({
            canUse: true,
            availableUsages: remainingUsages, // Use actual remaining usages from custom code
            enabledOrders: []
          });
          setCurrentCustomCode(customCode); // Store the custom code for later usage
          
          // Ensure exhausted state is reset when we have valid access
          if (remainingUsages > 0) {
            setShowExhaustedState(false);
          }
          
          // Reset states
          console.log('🔄 Resetting states after custom code activation');
          setShowExhaustedState(false);
          setError(null);
          setOrderNumber(''); // Clear the code after successful use
          
          // Force a re-render to ensure state is updated
          setTimeout(() => {
            console.log('🔄 Forcing state update after custom code activation');
            setShowExhaustedState(false);
          }, 100);
          
          return;
        } else {
          setOrderCheckError(customCodeResult.error || 'الكود غير صحيح');
          return;
        }
      }

      // If not a custom code, check if this order number exists and is enabled for Growth System
      // Check both Supabase and local data
      // Get Supabase enabled orders
      const supabaseOrders = await OrderSupabaseService.getEnabledOrders();
      
      // Get local enabled orders as fallback
      const localOrders = OrderGrowthUtils.getEnabledOrders();
      
      // Check Supabase first
      let matchingOrder = supabaseOrders.find(order => 
        order.order_number.toLowerCase() === orderNumber.trim().toLowerCase()
      );
      
      let normalizedOrder: any = null;
      
      if (matchingOrder) {
        // Convert Supabase format to expected format
        normalizedOrder = {
          orderId: matchingOrder.order_id,
          orderNumber: matchingOrder.order_number,
          customerEmail: matchingOrder.customer_email,
          customerName: matchingOrder.customer_name,
          maxUsage: matchingOrder.max_usage,
          usageCount: matchingOrder.usage_count,
          isGrowthEnabled: matchingOrder.is_growth_enabled
        };
      } else {
        // Fallback to local data
        const localMatch = localOrders.find(order => 
          order.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
        );
        if (localMatch) {
          normalizedOrder = localMatch;
        }
      }

      if (normalizedOrder) {
        // Set customer email from the matching order
        setCustomerEmail(normalizedOrder.customerEmail);
        
        // Update order-based usage with hybrid approach - use the found order data directly
        const orderUsageFromOrder = {
          canUse: true,
          availableUsages: normalizedOrder.maxUsage - normalizedOrder.usageCount,
          enabledOrders: [{
            orderId: normalizedOrder.orderId,
            orderNumber: normalizedOrder.orderNumber,
            maxUsage: normalizedOrder.maxUsage,
            usageCount: normalizedOrder.usageCount
          }]
        };
        
        setOrderBasedUsage(orderUsageFromOrder);
        
        // Success message
        setOrderCheckError('');
        alert(`✅ تم العثور على طلبك! ${orderUsageFromOrder.availableUsages} استخدام متاح لنظام النمو`);
        
        // Force update the component state to refresh the UI
        setTimeout(() => {
          // DON'T clear the order number - keep it so user doesn't need to re-enter
          // setOrderNumber(''); // REMOVED - this was causing the issue
          
          // Reset exhausted state since we have new access
          setShowExhaustedState(false);
          setError(null);
        }, 100);
      } else {
        setOrderCheckError('رقم الطلب غير موجود أو غير مُفعل لنظام النمو. يرجى التأكد من رقم الطلب أو التواصل مع الدعم الفني.');
      }
    } catch (error) {
      setOrderCheckError('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const showRecommendations = report !== null;
  const showArgitonPromo = report?.heightStatus === 'قصير القامة';

  // Show admin locked state if system is disabled by admin AND no valid order found
  if (isAdminLocked && !orderBasedUsage.canUse) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Admin Lock overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-4 border border-red-200">
              <Settings className="w-12 md:w-16 h-12 md:h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                🔒 نظام النمو غير متاح حالياً
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                تم تعطيل نظام تقييم النمو مؤقتاً من قبل الإدارة
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-red-800 font-semibold text-xs md:text-sm">
                  ⚠️ النظام معطل من لوحة التحكم الإدارية
                </p>
                <p className="text-red-700 text-xs mt-1">
                  يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع الدعم الفني
                </p>
              </div>
              
              {/* Order Number Check */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-blue-800 font-semibold text-xs md:text-sm mb-3">
                  🔍 تحقق من رقم طلبك أو الكود المخصص لفتح النظام
                </p>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="أدخل رقم الطلب أو الكود المخصص (مثال: WC-1234 أو ZM2020)"
                      className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>
                  {orderCheckError && (
                    <div className="text-red-600 text-xs">
                      {orderCheckError}
                    </div>
                  )}
                  <button
                    onClick={handleOrderOrCodeCheck}
                    className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    تحقق من الطلب/الكود
                  </button>
                  <div className="text-xs text-blue-600 text-center">

                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm opacity-50">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>ذكاء اصطناعي متقدم</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>تقييم دقيق للنمو</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>توصيات مخصصة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>تقارير PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred background preview */}
          <div className="filter blur-sm opacity-30">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-600 mb-4">
                مؤشر نمو الأطفال
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي
              </p>
              <p className="text-lg text-gray-500">
                تقييم شامل لنمو طفلك مع توصيات مخصصة من الخبراء
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">بيانات الطفل</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-amber-200 rounded-lg"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">التقرير</h3>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Check if user has access through either system
  const hasAccess = hasPurchased || orderBasedUsage.canUse;
  
  // Show exhausted state if user has tried to use beyond available usages
  console.log('🔍 Render condition check:', {
    hasAccess,
    orderBasedUsageCanUse: orderBasedUsage.canUse,
    showExhaustedState,
    orderBasedUsage
  });
  
  if (hasAccess && orderBasedUsage.canUse && showExhaustedState) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-red-50 to-orange-50 relative overflow-hidden" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Exhausted usages overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-4 border border-red-200">
              <Lock className="w-12 md:w-16 h-12 md:h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                🔒 استنفدت جميع الاستخدامات
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                لقد استخدمت جميع الاستخدامات المتاحة من طلبك
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-red-800 font-semibold text-xs md:text-sm">
                  🔒 لقد استنفدت جميع استخداماتك المتاحة (0/{orderBasedUsage.enabledOrders.reduce((total, order) => total + order.maxUsage, 0)})
                </p>
                <p className="text-red-700 text-xs mt-1">
                  للاستمرار في استخدام نظام النمو، يرجى طلب المزيد من المنتجات للحصول على استخدامات إضافية
                </p>
                <p className="text-red-600 text-xs mt-2 font-medium">
                  🛒 اطلب الآن لتحصل على استخدامات جديدة لنظام النمو
                </p>
              </div>
              
              {/* Order number input for additional access */}
              <div className="mb-6">
                <p className="text-gray-700 text-sm mb-3">
                  لديك طلب آخر أو كود مخصص؟ أدخل رقم الطلب أو الكود للحصول على استخدامات إضافية:
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="أدخل رقم الطلب أو الكود المخصص (مثال: WC-1234 أو ZM2020)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    dir="ltr"
                  />
                  {orderCheckError && (
                    <p className="text-red-600 text-sm">{orderCheckError}</p>
                  )}
                  <button
                    onClick={handleOrderOrCodeCheck}
                    disabled={!orderNumber.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    تحقق من الطلب/الكود
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm opacity-50">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>ذكاء اصطناعي متقدم</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>تقييم دقيق للنمو</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>توصيات مخصصة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>تقارير PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred background preview */}
          <div className="filter blur-sm opacity-30">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-600 mb-4">
                مؤشر نمو الأطفال
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي
              </p>
              <p className="text-lg text-gray-500">
                تقييم شامل لنمو طفلك مع توصيات مخصصة من الخبراء
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">بيانات الطفل</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-amber-200 rounded-lg"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">التقرير</h3>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Show teaser if user hasn't purchased and has no order-based access
  if (!hasAccess) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Lock overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-4 border border-amber-200">
              <Lock className="w-12 md:w-16 h-12 md:h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                🔒 مؤشر نمو الأطفال - حصري للعملاء
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                احصل على تقييم شامل لنمو طفلك مدعوم بالذكاء الاصطناعي مع توصيات مخصصة من الخبراء
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-amber-800 font-semibold text-xs md:text-sm">
                  💡 لفتح هذه الميزة، اطلب منتجك أولاً من القسم أعلاه
                </p>
              </div>
              
              {/* Order Number Check for no purchase */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-blue-800 font-semibold text-xs md:text-sm mb-3">
                  🔍 هل لديك طلب سابق أو كود مخصص؟ تحقق من رقم طلبك أو الكود
                </p>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="أدخل رقم الطلب أو الكود المخصص (مثال: WC-1234 أو ZM2020)"
                      className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>
                  {orderCheckError && (
                    <div className="text-red-600 text-xs">
                      {orderCheckError}
                    </div>
                  )}
                  <button
                    onClick={handleOrderOrCodeCheck}
                    className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    تحقق من الطلب/الكود
                  </button>
                  <div className="text-xs text-blue-600 text-center">

                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>ذكاء اصطناعي متقدم</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>تقييم دقيق للنمو</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>توصيات مخصصة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>تقارير PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred background preview */}
          <div className="filter blur-sm opacity-50">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-600 mb-4">
                مؤشر نمو الأطفال
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي
              </p>
              <p className="text-lg text-gray-500">
                تقييم شامل لنمو طفلك مع توصيات مخصصة من الخبراء
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">بيانات الطفل</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-amber-200 rounded-lg"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">التقرير</h3>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show exhausted state ONLY after user tries to submit with no uses left
  if (showExhaustedState && usageStats.remaining === 0) {
    return (
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Lock overlay for exhausted state */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-4 border border-amber-200">
              <Lock className="w-12 md:w-16 h-12 md:h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                🔒 مؤشر نمو الأطفال - استنفدت استخداماتك
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                احصل على تقييم شامل لنمو طفلك مدعوم بالذكاء الاصطناعي مع توصيات مخصصة من الخبراء
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-red-800 font-semibold text-xs md:text-sm">
                  ⚠️ لقد استخدمت جميع الاستخدامات المتاحة ({usageStats.used}/{usageStats.total})
                </p>
                <p className="text-red-700 text-xs mt-1">
                  اطلب المزيد من المنتجات للحصول على استخدامات إضافية
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>تقييم دقيق للنمو</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>ذكاء اصطناعي متقدم</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>تقارير PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>توصيات مخصصة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred background preview */}
          <div className="filter blur-sm opacity-50">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-600 mb-4">
                مؤشر نمو الأطفال
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي
              </p>
              <p className="text-lg text-gray-500">
                تقييم شامل لنمو طفلك مع توصيات مخصصة من الخبراء
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">بيانات الطفل</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-amber-200 rounded-lg"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">التقرير</h3>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show full growth system if user has purchased
  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-600">
              مؤشر نمو الأطفال
            </h2>
            <div className="bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
              ✓ مُفعَّل
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي
          </p>
          <p className="text-base md:text-lg text-gray-500 mb-4">
            تقييم شامل لنمو طفلك مع توصيات مخصصة من الخبراء
          </p>
          
          {/* Usage Statistics */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            {orderBasedUsage.canUse ? (
              <>
                <p className="text-blue-800 font-semibold text-sm">
                  📊 الاستخدامات المتاحة: {orderBasedUsage.availableUsages} 
                  {orderBasedUsage.enabledOrders.length > 0 ? ' من طلباتك المكتملة' : ' من الكود المخصص'}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  {orderBasedUsage.availableUsages > 0 
                    ? `يمكنك استخدام النظام ${orderBasedUsage.availableUsages} مرة أخرى` 
                    : 'لا توجد استخدامات متبقية - اطلب المزيد للحصول على استخدامات إضافية'
                  }
                </p>
                {orderBasedUsage.enabledOrders.length > 0 && (
                  <p className="text-blue-600 text-xs mt-1">
                    طلبات مُفعلة: {orderBasedUsage.enabledOrders.length}
                  </p>
                )}
              </>
            ) : (
              <>
            <p className="text-blue-800 font-semibold text-sm">
              📊 الاستخدامات المتاحة: {usageStats.remaining} من أصل {usageStats.total}
            </p>
            <p className="text-blue-700 text-xs mt-1">
              {usageStats.remaining > 0 
                ? `يمكنك استخدام النظام ${usageStats.remaining} مرة أخرى` 
                : 'لا توجد استخدامات متبقية - اطلب المزيد للحصول على استخدامات إضافية'
              }
            </p>
              </>
            )}
          </div>
        </div>

        {/* Growth System Content */}
        <div className={`grid grid-cols-1 ${showRecommendations ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 md:gap-8 items-start transition-all duration-500`}>
          <div className="lg:col-span-1">
             <InputForm
              childData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-1">
             <ReportCard 
                reportData={report} 
                isLoading={isLoading} 
                error={error}
                onReset={handleReset}
                childData={formData}
             />
          </div>

          {showRecommendations && (
             <div className="lg:col-span-1 flex flex-col gap-8">
                {showArgitonPromo && (
                  <ProductPromoCard
                    title="توصية خاصة للنمو"
                    description='لأن طول طفلك يحتاج إلى دعم إضافي، نوصي بـ "ان كيو ارجيتون شراب" لتركيبته المتكاملة لدعم الطول والنمو الصحي.'
                    imageUrl="https://lh3.googleusercontent.com/d/1IOj68mzyq1Mqv2Z6uW8ZP5ZJoS2IOilT"
                    purchaseUrl="https://nooralqmar.com/product/%d8%a5%d9%86-%d9%83%d9%8a%d9%88-%d8%a3%d8%b1%d8%ac%d9%8a%d8%aa%d9%88%d9%86-%d8%b4%d8%b1%d8%a7%d8%a8/"
                    altText="عبوة ان كيو ارجيتون شراب"
                  />
                )}
                 <ProductPromoCard
                    title="لتعزيز الذكاء والتركيز"
                    description='نوصي بـ "ميجاميند شراب" لدعم القدرات الذهنية والذاكرة. منتج مثالي لجميع الأطفال لزيادة التركيز والأداء المعرفي.'
                    imageUrl="https://lh3.googleusercontent.com/d/187niJ__b1jGHmF3q2phefqcvvEoDr8nk"
                    purchaseUrl="https://nooralqmar.com/product/%d8%b4%d8%b1%d8%a7%d8%a8-%d9%85%d9%8a%d8%ac%d8%a7%d9%85%d8%a7%d9%8a%d9%86%d8%af/"
                    altText="عبوة ميجاميند شراب"
                  />
             </div>
          )}
        </div>
        
        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-gray-500 bg-white/70 backdrop-blur-sm rounded-xl p-4">
          <p className="text-base text-gray-700">
            هذا النظام مدعوم بالذكاء الاصطناعي لتقييم نمو الأطفال وتقديم توصيات مخصصة
          </p>
        </div>
      </div>
      
      {/* Hidden PDF container */}
      <div id="pdf-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}></div>
    </section>
  );
};

export default GrowthSystemSection; 