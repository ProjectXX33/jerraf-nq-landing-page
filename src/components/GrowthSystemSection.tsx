import React, { useState, useCallback, useEffect } from 'react';
import { ChildData, ReportData, Gender, AgeUnit, FormData } from '../types/growth-system';
import { generateGrowthReport } from '../services/geminiService';
import ReportCard from './growth-system/ReportCard';
import InputForm from './growth-system/InputForm';
import ProductPromoCard from './growth-system/ProductPromoCard';
import { Lock, Star, Brain, TrendingUp, Shield } from 'lucide-react';
import { PurchaseUtils } from '../utils/purchaseUtils';

const GrowthSystemSection: React.FC = () => {
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

  // Check purchase status on component mount
  useEffect(() => {
    const updateStatus = () => {
      const purchased = PurchaseUtils.hasPurchased();
      const stats = PurchaseUtils.getUsageStats();
      setHasPurchased(purchased);
      setUsageStats(stats);
    };

    updateStatus();

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

    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    window.addEventListener('purchaseReset', handlePurchaseReset);
    window.addEventListener('growthSystemUsed', handleGrowthSystemUsed);

    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
      window.removeEventListener('purchaseReset', handlePurchaseReset);
      window.removeEventListener('growthSystemUsed', handleGrowthSystemUsed);
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user can use the growth system
    if (!PurchaseUtils.canUseGrowthSystem()) {
      setError('لقد استنفدت جميع استخداماتك المتاحة. يرجى طلب المزيد من المنتجات للحصول على استخدامات إضافية.');
      setShowExhaustedState(true); // Show exhausted state after attempt
      return;
    }

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
      
      // Consume one usage after successful report generation
      PurchaseUtils.useGrowthSystem();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setReport(null);
    setError(null);
    setIsLoading(false);
    setShowExhaustedState(false);
  }

  const showRecommendations = report !== null;
  const showArgitonPromo = report?.heightStatus === 'قصير القامة';

  // Show teaser if user hasn't purchased
  if (!hasPurchased) {
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
            <p className="text-blue-800 font-semibold text-sm">
              📊 الاستخدامات المتاحة: {usageStats.remaining} من أصل {usageStats.total}
            </p>
            <p className="text-blue-700 text-xs mt-1">
              {usageStats.remaining > 0 
                ? `يمكنك استخدام النظام ${usageStats.remaining} مرة أخرى` 
                : 'لا توجد استخدامات متبقية - اطلب المزيد للحصول على استخدامات إضافية'
              }
            </p>
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