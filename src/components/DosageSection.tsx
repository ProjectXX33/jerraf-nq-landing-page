
import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Package, Thermometer } from 'lucide-react';

const DosageSection = () => {
  const instructions = [
    {
      icon: <Clock className="w-8 h-8 text-jerraf-purple" />,
      title: "الجرعة",
      description: "ملعقة صغيرة (5 مل) مرة إلى مرتين يومياً للأطفال من 2-10 سنوات",
      highlight: true
    },
    {
      icon: <Package className="w-8 h-8 text-jerraf-purple" />,
      title: "العبوة",
      description: "100 مل - تكفي لمدة 10-20 يوم حسب الاستخدام",
      highlight: false
    },
    {
      icon: <Thermometer className="w-8 h-8 text-jerraf-purple" />,
      title: "التخزين",
      description: "مكان بارد وجاف بعيداً عن أشعة الشمس المباشرة",
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-jerraf-light-purple/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            تعليمات 
            <span className="text-jerraf-purple"> الاستخدام</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            طريقة الاستخدام الآمنة والفعالة لأفضل النتائج
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {instructions.map((instruction, index) => (
            <Card 
              key={index}
              className={`p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up border-0 ${
                instruction.highlight 
                  ? 'bg-gradient-to-br from-jerraf-purple to-purple-600 text-white' 
                  : 'bg-white'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${
                  instruction.highlight ? 'bg-white/20' : 'bg-jerraf-light-purple'
                } rounded-full flex items-center justify-center mb-6 shadow-md`}>
                  {React.cloneElement(instruction.icon, {
                    className: `w-8 h-8 ${instruction.highlight ? 'text-white' : 'text-jerraf-purple'}`
                  })}
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 ${
                  instruction.highlight ? 'text-white' : 'text-gray-800'
                }`}>
                  {instruction.title}
                </h3>
                
                <p className={`leading-relaxed text-lg ${
                  instruction.highlight ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {instruction.description}
                </p>
              </div>

              {/* Decorative elements */}
              {instruction.highlight && (
                <>
                  <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Additional Tips */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-8 bg-gradient-to-r from-jerraf-light-yellow to-jerraf-light-purple rounded-3xl shadow-lg animate-fade-in-up">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                نصائح مهمة للاستخدام
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-jerraf-purple rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">يُفضل تناوله مع الطعام أو بعده مباشرة</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-jerraf-purple rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">يمكن خلطه مع العصير أو الماء إذا لزم الأمر</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-jerraf-purple rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">رج العبوة جيداً قبل الاستخدام</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-jerraf-purple rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">لا تتجاوز الجرعة المحددة</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DosageSection;
