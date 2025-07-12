import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, TrendingUp, Shield, Zap, Users, Star, Droplets } from 'lucide-react';

const SyrupDetailsSection: React.FC = () => {
  const ingredients = [
    { name: 'إل-أرجينين', benefit: 'يحفز تدفق الدم وينشط هرمون النمو لزيادة الطول وتنظيم الهرمونات' },
    { name: 'إل-كارنيتين', benefit: 'يحول الدهون إلى طاقة لدعم النشاط البدني وزيادة الحيوية' },
    { name: 'فوسفاتيديل سيرين', benefit: 'يعزز التركيز ويدعم القدرات العقلية ويقلل التوتر وفرط الحركة' },
  ];

  const vitamins = [
    'فيتامين C - يعزز المناعة ويدعم امتصاص الحديد ويحفز إنتاج الكولاجين',
    'فيتامينات B المركبة (B1, B2, B3, B6, B12) - تحفز إنتاج خلايا الدم وتعزز وظائف الأعصاب',
    'فيتامين A - يحسن الإبصار ويدعم صحة الشعر والبشرة',
    'فيتامين D3 - يعزز امتصاص الكالسيوم لنمو عظام صحي',
    'فيتامين K - يحسن كثافة العظام ويقويها',
    'فيتامين E - مضاد أكسدة قوي يحمي خلايا الجسم من التلف',
  ];

  const minerals = [
    'الحديد - يعالج الأنيميا ويحسن التطور الإدراكي',
    'الزنك - يدعم النمو ويعزز المناعة ويحسن مرونة البشرة',
    'السيلينيوم - مضاد أكسدة يحمي الخلايا من التلف',
    'المنغنيز - يدعم صحة العظام والعضلات',
    'الكروم واليود - لتحسين التمثيل الغذائي ووظائف الغدة الدرقية',
    'الموليبدينوم - يدعم هضم الأحماض الأمينية ويساهم في إزالة السموم',
  ];

  const benefits = [
    { icon: <TrendingUp className="w-6 h-6" />, title: 'نمو صحي وطول مثالي', description: 'يعزز إنتاج هرمون النمو ويقوي صحة العظام لتحقيق الطول المثالي' },
    { icon: <Shield className="w-6 h-6" />, title: 'مناعة قوية', description: 'يدعم جهاز المناعة لحماية طفلك وضمان نموه في بيئة صحية' },
    { icon: <Heart className="w-6 h-6" />, title: 'دعم الجهاز العصبي', description: 'دعم التطور العقلي والمعرفي لزيادة التركيز والتعلم' },
    { icon: <Zap className="w-6 h-6" />, title: 'زيادة النشاط والطاقة', description: 'لتحسين الأداء البدني والرياضي لطفلك' },
  ];

  const features = [
    'مزيج غذائي متكامل من الفيتامينات والمعادن',
    'مناسب لجميع المراحل العمرية من سنتين إلى 10 سنوات',
    'نكهة البرتقال الطبيعية والعسل المحببة للأطفال',
    'آمن وموثوق - معتمد من هيئة الغذاء والدواء السعودية',
  ];

  const faqs = [
    { question: 'ما المميز في إن كيو أرجيتون عن فيتامينات الأطفال الأخرى؟', answer: 'يتميز بتكامل مكوناته من الفيتامينات والمعادن الأساسية والأحماض الأمينية لدعم نمو الأطفال وزيادة الطول بشكل ملحوظ.' },
    { question: 'هل يساعد في زيادة الطول؟', answer: 'نعم، يحتوي على إل-أرجينين وفيتامينات ومعادن متعددة لدعم صحة العظام وزيادة هرمون النمو.' },
    { question: 'ما دور المنتج في تحسين التركيز لدى الأطفال؟', answer: 'يحتوي على مكونات مثل الفوسفاتيديل سيرين وإل-كارنيتين والكولين التي تعزز وظائف الدماغ والتركيز.' },
    { question: 'هل إن كيو أرجيتون آمن للأطفال؟', answer: 'نعم، المنتج معتمد من هيئة الغذاء والدواء السعودية وخالٍ من المكونات الصناعية الشائعة التي تسبب الحساسية.' },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50 to-yellow-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
            <span className="text-orange-600">إن كيو أرجيتون شراب</span>
            <span className="block mt-2">الحل المثالي لنمو طفلك وصحته</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
            مكمل غذائي لدعم نمو الأطفال وزيادة الطول بطريقة طبيعية وآمنة. غني بالفيتامينات والمعادن والأحماض الأمينية لنمو صحي وشامل
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <Card className="border-orange-200 max-w-4xl mx-auto">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-700 text-center justify-center">
                <Star className="w-6 h-6" />
                ما الذي يجعل إن كيو أرجيتون الخيار الأمثل لطفلك؟
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-orange-100 p-1 rounded-full text-orange-600 mt-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    </div>
                    <p className="text-sm text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Benefits Section */}
          <div className="space-y-6">
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Heart className="w-6 h-6" />
                  فوائد إن كيو أرجيتون لدعم النمو
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
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
                  <Droplets className="w-6 h-6" />
                  الجرعة والاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">الجرعة الموصى بها:</h4>
                  <p className="text-green-700 text-sm mb-2">
                    ملعقة صغيرة (5 مل) يومياً للأطفال من سنتين إلى 10 سنوات
                  </p>
                  <p className="text-green-700 text-sm">
                    من مرة إلى مرتين يومياً حسب الحاجة
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">العبوة والتخزين:</h4>
                  <p className="text-blue-700 text-sm mb-1">
                    زجاجة بحجم 100 مل بنكهة البرتقال المحببة للأطفال
                  </p>
                  <p className="text-blue-700 text-sm">
                    يُحفظ في مكان بارد وجاف بعيداً عن أشعة الشمس
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-6">
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Users className="w-6 h-6" />
                  مكونات شراب إن كيو أرجيتون
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">الأحماض الأمينية الطبيعية:</h4>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="font-medium text-orange-800 mb-1">{ingredient.name}</div>
                          <p className="text-xs text-orange-700">{ingredient.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">الفيتامينات الأساسية:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {vitamins.map((vitamin, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          ✓ {vitamin}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">المعادن الضرورية:</h4>
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

        {/* Warning Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-center text-yellow-800">التحذيرات والاحتياطات</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-yellow-800">
                <p>• يُنصح باستشارة الطبيب إذا كان طفلك يعاني من حساسية تجاه أحد المكونات</p>
                <p>• المنتج مكمل غذائي ولا يُستخدم كبديل للوجبات الغذائية</p>
                <p>• يُنصح باستشارة الطبيب أثناء الحمل أو الرضاعة</p>
                <p>• يُحفظ بعيداً عن متناول الأطفال</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              امنحي طفلك أفضل بداية لمستقبل صحي ومشرق!
            </h3>
            <p className="text-lg mb-6">
              اطلبي إن كيو أرجيتون شراب الآن واحصلي على النتائج الطبيعية والآمنة
            </p>
            <button
              onClick={() => {
                const orderSection = document.getElementById('order-section');
                if (orderSection) {
                  orderSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-orange-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              اطلب الآن - 75 ريال
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyrupDetailsSection; 