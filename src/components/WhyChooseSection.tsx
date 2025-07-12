
import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Heart, Smile, CheckCircle } from 'lucide-react';

const WhyChooseSection = () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-jerraf-purple" />,
      title: "مزيج متكامل من الفيتامينات والمعادن",
      description: "تركيبة متوازنة تحتوي على جميع العناصر الغذائية الأساسية"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-jerraf-purple" />,
      title: "مناسب لجميع المراحل العمرية",
      description: "آمن للأطفال من عمر سنتين فما فوق"
    },
    {
      icon: <Smile className="w-8 h-8 text-jerraf-purple" />,
      title: "نكهة البرتقال بالعسل المحببة للأطفال",
      description: "طعم لذيذ يحبه الأطفال دون مقاومة"
    },
    {
      icon: <Shield className="w-8 h-8 text-jerraf-purple" />,
      title: "آمن ومرخّص من هيئة الغذاء والدواء السعودية",
      description: "منتج مرخص وموثق من الجهات الرسمية"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
            لماذا تختار 
            <span className="text-jerraf-purple"> إن كيو أرجيتون</span>؟
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            اختيارك الأمثل لصحة ونمو طفلك بتركيبة طبيعية وآمنة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up border-0 bg-gradient-to-br from-white to-jerraf-light-yellow/30"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-jerraf-light-purple rounded-full flex items-center justify-center mb-6 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 leading-relaxed">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
