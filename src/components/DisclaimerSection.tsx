
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, Heart } from 'lucide-react';

const DisclaimerSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-8 rounded-3xl shadow-lg bg-gradient-to-r from-white to-blue-50 border-r-4 border-blue-500 animate-fade-in-up">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-right">
                إخلاء المسؤولية الطبي
              </h3>
              
              <div className="space-y-4 text-right">
                <p className="text-gray-700 leading-relaxed text-lg">
                  <strong>إن كيو أرجيتون</strong> هو مكمل غذائي طبيعي وليس دواءً أو بديلاً عن الوجبات الغذائية المتوازنة. 
                  المنتج مصمم لدعم النمو الطبيعي والصحة العامة للأطفال.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <h4 className="font-bold text-gray-800">استشارة طبية</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      يُنصح بشدة باستشارة الطبيب المختص قبل الاستخدام في حال وجود أمراض مزمنة، 
                      حساسية، أو تناول أدوية أخرى.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <h4 className="font-bold text-gray-800">الحساسية</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      في حال ظهور أي أعراض حساسية أو آثار جانبية، يجب التوقف عن الاستخدام 
                      فوراً ومراجعة الطبيب.
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg mt-6">
                  <p className="text-yellow-800 font-medium text-sm">
                    <strong>تنبيه:</strong> النتائج قد تختلف من طفل لآخر حسب العمر، الحالة الصحية، والنظام الغذائي. 
                    لا تتجاوز الجرعة المحددة ولا تستخدم المنتج كبديل للوجبات الأساسية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Certification Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">مرخص من هيئة الغذاء والدواء السعودية</p>
              <p className="text-sm text-gray-600">منتج آمن ومطابق للمعايير الدولية</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection;
