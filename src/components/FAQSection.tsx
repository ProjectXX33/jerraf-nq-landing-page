import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
const FAQSection = () => {
  const faqs = [{
    question: "ما المميز في إن كيو أرجيتون عن غيره من المكملات الغذائية؟",
    answer: "إن كيو أرجيتون يتميز بتركيبة فريدة تحتوي على الأرجينين الطبيعي مع مزيج متكامل من الفيتامينات والمعادن الأساسية. كما أنه مرخص من هيئة الغذاء والدواء السعودية ومصمم خصيصاً للأطفال بنكهة البرتقال والعسل المحببة لهم."
  }, {
    question: "هل يساعد فعلاً على زيادة الطول؟",
    answer: "نعم، يحتوي المنتج على الأرجينين الذي يحفز إفراز هرمون النمو الطبيعي، بالإضافة إلى فيتامين D3 والزنك والمعادن الأساسية التي تدعم نمو العظام والغضاريف. النتائج تظهر مع الاستخدام المنتظم لفترة كافية."
  }, {
    question: "هل هو آمن للأطفال؟",
    answer: "المنتج آمن تماماً للأطفال من عمر سنتين فما فوق. جميع المكونات طبيعية ومرخصة من هيئة الغذاء والدواء السعودية. ننصح باستشارة الطبيب في حال وجود أي حساسية أو أمراض مزمنة."
  }, {
    question: "هل يحسن التركيز والانتباه؟",
    answer: "نعم، يحتوي المنتج على فوسفاتيديل سيرين ومجموعة فيتامين B التي تدعم وظائف الدماغ والجهاز العصبي، مما يساعد على تحسين التركيز والذاكرة والأداء الدراسي للطفل."
  }, {
    question: "متى تظهر النتائج؟",
    answer: "النتائج تختلف من طفل لآخر، لكن عادة ما تبدأ النتائج في الظهور خلال 4-8 أسابيع من الاستخدام المنتظم. للحصول على أفضل النتائج، ننصح بالاستمرار لمدة 3-6 أشهر."
  }, {
    question: "هل يمكن استخدامه مع أدوية أخرى؟",
    answer: "المنتج مكمل غذائي طبيعي وعادة ما يكون آمناً مع معظم الأدوية. لكن ننصح بشدة باستشارة الطبيب المختص قبل الاستخدام في حال تناول الطفل أي أدوية أخرى."
  }];
  return <section className="py-20 bg-gradient-to-b from-jerraf-light-purple/20 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            الأسئلة 
            <span className="text-jerraf-purple"> الشائعة</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            إجابات على أهم الأسئلة التي تشغل بال الأمهات
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4" dir="rtl">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`faq-${index}`} className="border-0 bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up hover:shadow-xl transition-shadow duration-300" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <AccordionTrigger className="hover:no-underline px-8 py-6 text-right">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-8 h-8 bg-jerraf-purple rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800 text-right flex-1 leading-relaxed">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-16 pb-6">
                  <p className="text-gray-700 leading-relaxed text-right text-lg">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-jerraf-yellow to-jerraf-light-yellow rounded-3xl p-8 max-w-2xl mx-auto shadow-lg animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              لديك سؤال آخر؟
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              نحن هنا لمساعدتك! تواصلي معنا للحصول على استشارة مجانية حول المنتج
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-full px-6 py-3 shadow-md">
                <span className="text-jerraf-purple font-bold">📞 واتساب: 0550147889</span>
              </div>
              <div className="bg-white rounded-full px-6 py-3 shadow-md">
                <span className="text-jerraf-purple font-bold">📧 info@nooralqmar.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FAQSection;