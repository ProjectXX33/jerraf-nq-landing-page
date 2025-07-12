
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Shield, Brain, Activity, Heart, Zap } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <TrendingUp className="w-10 h-10 text-white" />,
      title: "تعزيز هرمون النمو وزيادة الطول",
      description: "يحفز إفراز هرمون النمو الطبيعي لزيادة الطول بشكل صحي",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "تقوية الجهاز المناعي",
      description: "يعزز مناعة الطفل ويحميه من الأمراض والعدوى",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Brain className="w-10 h-10 text-white" />,
      title: "تحسين التركيز والدعم العقلي",
      description: "يساعد على تحسين الذاكرة والتركيز والأداء الدراسي",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Activity className="w-10 h-10 text-white" />,
      title: "تنظيم الهرمونات في سن البلوغ",
      description: "يساعد على التوازن الهرموني الصحي خلال مرحلة النمو",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Heart className="w-10 h-10 text-white" />,
      title: "تنشيط الدورة الدموية وعلاج الأنيميا",
      description: "يحسن تدفق الدم ويعالج نقص الحديد والأنيميا",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Zap className="w-10 h-10 text-white" />,
      title: "زيادة النشاط والطاقة",
      description: "يمنح الطفل طاقة ونشاط طبيعي لممارسة الأنشطة اليومية",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-jerraf-light-yellow/50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
            الفوائد 
            <span className="text-jerraf-purple"> الرئيسية</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            فوائد شاملة لنمو صحي ومتكامل لطفلك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="group p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up border-0 bg-white overflow-hidden relative"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${benefit.color}`}></div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 leading-relaxed">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-jerraf-yellow rounded-full opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-jerraf-purple rounded-full opacity-30"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
