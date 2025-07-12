
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const IngredientsSection = () => {
  const ingredients = [
    {
      title: "الأحماض الأمينية الطبيعية",
      items: [
        "إل-أرجينين: يحفز إفراز هرمون النمو",
        "إل-كارنيتين: يحسن الطاقة والتمثيل الغذائي",
        "فوسفاتيديل سيرين: يدعم وظائف المخ والذاكرة"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "الفيتامينات الأساسية",
      items: [
        "فيتامين C: مضاد أكسدة قوي لتقوية المناعة",
        "فيتامين A: مهم للنمو والرؤية",
        "فيتامين D3: ضروري لصحة العظام",
        "فيتامين K: يساعد في تجلط الدم وصحة العظام",
        "فيتامين E: مضاد أكسدة لحماية الخلايا",
        "مجموعة فيتامين B: تدعم الطاقة والجهاز العصبي"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      title: "المعادن الرئيسية",
      items: [
        "الحديد: يمنع الأنيميا ويحسن نقل الأكسجين",
        "الزنك: ضروري للنمو ووظائف المناعة",
        "السيلينيوم: مضاد أكسدة قوي",
        "المنغنيز: يدعم تكوين العظام",
        "اليود: ضروري لوظائف الغدة الدرقية",
        "الموليبدينوم: يساعد في عمليات التمثيل الغذائي"
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            المكونات 
            <span className="text-jerraf-purple"> الطبيعية</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            تركيبة غنية بالعناصر الغذائية الأساسية لنمو صحي
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6" dir="rtl">
            {ingredients.map((ingredient, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-0 bg-gradient-to-r from-white to-jerraf-light-yellow/30 rounded-2xl shadow-lg overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <AccordionTrigger className="hover:no-underline px-8 py-6">
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-4 h-4 bg-gradient-to-r ${ingredient.color} rounded-full flex-shrink-0`}></div>
                    <span className="text-xl font-bold text-gray-800 text-right flex-1">
                      {ingredient.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {ingredient.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${ingredient.color} rounded-full mt-2 flex-shrink-0`}></div>
                        <p className="text-gray-700 leading-relaxed text-right">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default IngredientsSection;
