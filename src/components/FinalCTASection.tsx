import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Gift, Truck, Shield } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="relative bg-jerraf-purple min-h-screen flex items-center overflow-hidden">
      {/* Curved Background */}
      <div className="absolute inset-0 bg-jerraf-purple jerraf-curve-reverse"></div>
      
      {/* Much Bigger Giraffe Image - Fixed Right Side (Same as Hero) */}
      <div className="absolute -right-20 md:-right-20 lg:-right-[270px] bottom-[205px] h-full w-72 md:w-96 lg:w-[480px] hidden md:block z-20">

        <div className="h-full flex items-center justify-end">
          <img 
            src="/67c84c09-6d45-4d7f-9ae4-fa0010bc04c2.png" 
            alt="Argitone Tall Giraffe" 
            className="h-full w-auto object-contain transform scale-150 lg:scale-140 hover:scale-130 lg:hover:scale-145 transition-transform duration-500" 
          />
        </div>
      </div>

      {/* Content Container - Moved Towards Giraffe */}
      <div className="w-full md:pr-40 lg:pr-[300px] relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-16 md:ml-20 lg:ml-32">
          <div className="max-w-4xl md:ml-auto lg:ml-auto">
            <div className="animate-fade-in-up text-center">
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight text-center">
                ابدأ الآن رحلة طفلك
                <span className="block text-jerraf-yellow mt-2">
                  نحو نمو صحي وطول مثالي!
                </span>
              </h2>
              
              <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto text-center">
                لا تتردد في منح طفلك أفضل بداية لمستقبل صحي ومشرق. 
                آلاف الآباء والأمهات اختاروا إن كيو أرجيتون لأطفالهم
              </p>

              {/* Features Highlights */}
              <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <Star className="w-8 h-8 text-jerraf-yellow mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-2">نتائج مضمونة</h3>
                  <p className="text-white/80 text-sm">أول النتائج خلال 4-8 أسابيع</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <Gift className="w-8 h-8 text-jerraf-yellow mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-2">عرض خاص</h3>
                  <p className="text-white/80 text-sm">خصم 25% على الطلبات الأولى</p>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-jerraf-purple">75 ريال</span>
                    <span className="text-xl text-gray-500 line-through">150 ريال</span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">وفر 75 ريال</span>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="bg-jerraf-yellow hover:bg-jerraf-yellow/90 text-jerraf-purple px-12 py-4 text-2xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold w-full md:w-auto"
                    onClick={() => {
                      const orderSection = document.getElementById('order-section');
                      if (orderSection) {
                        orderSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    اطلب الآن
                  </Button>
                  
                  <p className="text-gray-600 text-sm mt-4">
                    💳 إمكانية الدفع عند الاستلام | ⏰ العرض محدود لأول 100 طلب
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>مرخص من الغذاء والدواء</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>تقييم 4.8/5 من الأمهات</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>ضمان استرداد المال</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Giraffe - Bigger and Optimized (Same as Hero) */}
      <div className="absolute top-[305px] right-2 md:hidden">
        <img 
          src="/67c84c09-6d45-4d7f-9ae4-fa0010bc04c2.png" 
          alt="Argitone Tall Giraffe" 
          className="h-64 w-auto object-contain transform rounded-xl" 
          style={{ transform: 'scale(5)' }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-jerraf-yellow rounded-full animate-pulse hidden lg:block"></div>
      <div className="absolute bottom-32 right-32 w-6 h-6 bg-jerraf-yellow/50 rounded-full animate-bounce hidden lg:block"></div>
      <div className="absolute top-1/2 left-20 w-3 h-3 bg-white/30 rounded-full animate-pulse hidden lg:block"></div>
    </section>
  );
};

export default FinalCTASection;
