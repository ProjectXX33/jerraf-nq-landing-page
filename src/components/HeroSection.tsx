
import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative bg-jerraf-yellow min-h-screen flex items-center overflow-hidden">
      {/* Curved Background */}
      <div className="absolute inset-0 bg-jerraf-yellow jerraf-curve"></div>
      
      {/* Much Bigger Giraffe Image - Right Side with lower positioning */}
      <div className="absolute -right-20 md:-right-20 lg:-right-64 top-16 md:top-44 h-full w-72 md:w-96 lg:w-[480px] hidden md:block z-20">
        <div className="h-full flex items-center justify-end">
          <img 
            src="/lovable-uploads/67c84c09-6d45-4d7f-9ae4-fa0010bc04c2.png" 
            alt="Argitone Tall Giraffe" 
            className="h-full w-auto object-contain transform scale-125 lg:scale-140 hover:scale-130 lg:hover:scale-145 transition-transform duration-500" 
          />
        </div>
      </div>

      {/* Content Container - Left Side with Mobile Optimization */}
      <div className="w-full md:pr-80 lg:pr-[400px] relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl">
            {/* Main Content */}
            <div className="text-center md:text-right animate-fade-in-right mb-6 md:mb-12">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-3 md:mb-6 leading-tight">
                إن كيو أرجيتون
                <span className="block text-jerraf-purple mt-1 md:mt-2 text-lg md:text-2xl lg:text-3xl">
                  المكمل الغذائي الأمثل لنمو طفلك وصحته
                </span>
              </h1>
              
              <p className="text-sm md:text-lg lg:text-xl text-gray-700 mb-4 md:mb-8 leading-relaxed px-2 md:px-0">
                شراب طبيعي وآمن لتعزيز النمو وزيادة الطول. غني بالأرجينين، الفيتامينات والمعادن لدعم المناعة وتحسين التركيز.
              </p>

              {/* Price Section - RTL and Right Aligned */}
              <div className="mb-4 md:mb-6" dir="rtl">
                <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-1 md:mb-2">
                  <span className="text-xl md:text-3xl font-bold text-jerraf-purple">75 ريال</span>
                  <span className="text-base md:text-xl text-gray-500 line-through">150 ريال</span>
                  <span className="bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">خصم 50%</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 text-center md:text-right">السعر شامل الضريبة</p>
              </div>

              <Button 
                size="lg" 
                className="bg-jerraf-purple hover:bg-jerraf-purple/90 text-white px-4 md:px-8 py-2 md:py-4 text-base md:text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-auto"
                onClick={() => {
                  const orderSection = document.getElementById('order-section');
                  if (orderSection) {
                    orderSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                اطلبي الآن
              </Button>
            </div>

            {/* Both Products Section - Mobile Optimized */}
            <div className="flex justify-center md:justify-start animate-fade-in-left mb-6 md:mb-12">
              <div className="flex gap-3 md:gap-6">
                {/* Syrup Product */}
                <div className="relative group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-xl md:shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30">
                    <img 
                      src="/lovable-uploads/a8a3ec41-a92f-4541-a5a3-8b88a96a60ef.png" 
                      alt="NQ Argitone Syrup" 
                      className="w-28 md:w-40 h-32 md:h-48 object-contain rounded-2xl md:rounded-3xl transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="text-center mt-1 md:mt-3">
                      <h3 className="text-xs md:text-base font-bold text-gray-800 mb-1">شراب أرجيتون</h3>
                      <p className="text-xs text-gray-600 mb-1 md:mb-0">للأطفال 2-10 سنوات</p>
                      <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2">
                        <span className="text-sm md:text-lg font-bold text-jerraf-purple">75 ريال</span>
                        <span className="text-xs text-gray-500 line-through">150 ريال</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements for Syrup */}
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-3 md:w-6 h-3 md:h-6 bg-jerraf-yellow rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-2 md:w-4 h-2 md:h-4 bg-jerraf-purple rounded-full animate-pulse"></div>
                </div>

                {/* Tablets Product */}
                <div className="relative group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-xl md:shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30">
                    <img 
                      src="/lovable-uploads/NQ Argitone Tabs - Box & Jar.jpg" 
                      alt="NQ Argitone Tablets" 
                      className="w-28 md:w-40 h-32 md:h-48 object-contain rounded-2xl md:rounded-3xl transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="text-center mt-1 md:mt-3">
                      <h3 className="text-xs md:text-base font-bold text-gray-800 mb-1">أقراص أرجيتون</h3>
                      <p className="text-xs text-gray-600 mb-1 md:mb-0">للأطفال 10-22 سنة</p>
                      <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2">
                        <span className="text-sm md:text-lg font-bold text-jerraf-purple">75 ريال</span>
                        <span className="text-xs text-gray-500 line-through">150 ريال</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements for Tablets */}
                  <div className="absolute -top-1 -left-1 md:-top-2 md:-left-2 w-3 md:w-6 h-3 md:h-6 bg-jerraf-yellow rounded-full animate-bounce delay-100"></div>
                  <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-2 md:w-4 h-2 md:h-4 bg-jerraf-purple rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>

            {/* Features Section - Mobile Optimized */}
            <div className="text-center md:text-right">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-3xl px-2 md:px-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 text-center border border-white/30">
                  <div className="text-lg md:text-3xl mb-1 md:mb-2">🌿</div>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">طبيعي وآمن</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 text-center border border-white/30">
                  <div className="text-lg md:text-3xl mb-1 md:mb-2">📏</div>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">يزيد الطول</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 text-center border border-white/30">
                  <div className="text-lg md:text-3xl mb-1 md:mb-2">🧠</div>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">يحسن التركيز</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 text-center border border-white/30">
                  <div className="text-lg md:text-3xl mb-1 md:mb-2">💪</div>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">يقوي المناعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Giraffe - Bigger and Optimized */}
      <div className="absolute top-[400px] right-2 md:hidden">
        <img 
          src="/lovable-uploads/67c84c09-6d45-4d7f-9ae4-fa0010bc04c2.png" 
          alt="Argitone Tall Giraffe" 
          className="h-64 w-auto object-contain transform rounded-xl" style={{ transform: 'scale(5)' }}

        />
      </div>
    </section>
  );
};

export default HeroSection;
