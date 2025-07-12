import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Shield, Zap, Users, Star } from 'lucide-react';

const ProductDetailsSection: React.FC = () => {
  const ingredients = [
    { name: 'إل-أرجينين', amount: '200 ملغ', benefit: 'يحفز هرمون النمو ويحسن تدفق الدم للدماغ' },
    { name: 'فوسفاتيديل سيرين', amount: '200 ملغ', benefit: 'يدعم الذاكرة ويخفف التوتر الذهني' },
    { name: 'إل-كارنيتين', amount: '50 ملغ', benefit: 'يحوّل الدهون إلى طاقة ذهنية وبدنية' },
    { name: 'الكولين', amount: '50 ملغ', benefit: 'يعزز وظائف الدماغ والذاكرة' },
  ];

  const vitamins = [
    'فيتامين أ - للبصر ونضارة البشرة',
    'فيتامين سي - تقوية المناعة',
    'فيتامين د3 - صحة العظام',
    'فيتامين ك - تخثر الدم',
    'فيتامينات ب المركبة (ب1، ب2، ب3، ب6، ب12)',
    'البيوتين وحمض الفوليك',
  ];

  const minerals = [
    'الزنك - النمو الجسدي والمناعة',
    'الحديد - علاج فقر الدم',
    'السيلينيوم - مضاد أكسدة',
    'الكروم - تحسين التمثيل الغذائي',
    'المنغنيز - صحة العظام',
    'اليود - وظائف الغدة الدرقية',
  ];

  const benefits = [
    { icon: <Brain className="w-6 h-6" />, title: 'تحسين الذاكرة والتركيز', description: 'زيادة الانتباه أثناء الدراسة وتسريع الاستيعاب' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'تعزيز التحصيل الدراسي', description: 'تقوية الذاكرة قصيرة وطويلة المدى' },
    { icon: <Shield className="w-6 h-6" />, title: 'تقوية جهاز المناعة', description: 'تقليل الغيابات المدرسية والحفاظ على الصحة' },
    { icon: <Zap className="w-6 h-6" />, title: 'زيادة الطاقة والنشاط', description: 'تقليل الإرهاق الذهني وزيادة النشاط البدني' },
  ];

  const faqs = [
    { question: 'هل المنتج آمن للأطفال؟', answer: 'نعم، مكمل غذائي آمن ومعتمد من هيئة الغذاء والدواء بالسعودية' },
    { question: 'متى تبدأ النتائج بالظهور؟', answer: 'تظهر النتائج خلال 4 – 6 أسابيع من الاستخدام المنتظم' },
    { question: 'هل يمكن استخدامه مع أدوية أخرى؟', answer: 'نعم، ولكن يُنصح باستشارة الطبيب في حال وجود علاجات مزمنة' },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-purple-50 to-blue-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
            <span className="text-purple-600">إن كيو أرجيتون أقراص</span>
            <span className="block mt-2">تركيز أعلى وتفوّق دراسي مضمون</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
            مكمل الأرجنين الفعال لتعزيز الذاكرة والتركيز وزيادة تحصيل أبنائك الدراسي، بمكونات طبيعية وآمنة وفيتامينات ومعادن أساسية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Benefits Section */}
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Star className="w-6 h-6" />
                  الفوائد الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{benefit.title}</h4>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Users className="w-6 h-6" />
                  طريقة الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">الجرعة الموصى بها:</h4>
                  <p className="text-green-700 text-sm">
                    من 10 سنوات إلى 22 سنة: قرص إلى قرصين يومياً
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-6">
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Brain className="w-6 h-6" />
                  المكونات الفعالة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">الأحماض الأمينية الأساسية:</h4>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-blue-800">{ingredient.name}</span>
                            <span className="text-sm text-blue-600">{ingredient.amount}</span>
                          </div>
                          <p className="text-xs text-blue-700">{ingredient.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">الفيتامينات:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {vitamins.map((vitamin, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          ✓ {vitamin}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">المعادن الحيوية:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {minerals.map((mineral, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          ✓ {mineral}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-center text-gray-800">الأسئلة الشائعة</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              لا تدعي ضعف التركيز يعيق تفوّق طفلك!
            </h3>
            <p className="text-lg mb-6">
              اطلبي إن كيو أرجيتون أقراص الآن واحصلي على النتائج التي تستحقها
            </p>
            <button
              onClick={() => {
                const orderSection = document.getElementById('order-section');
                if (orderSection) {
                  orderSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              اطلب الآن - 75 ريال
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsSection; 