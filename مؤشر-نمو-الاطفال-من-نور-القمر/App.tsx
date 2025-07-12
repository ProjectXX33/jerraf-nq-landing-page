import React, { useState, useCallback } from 'react';
import { ChildData, ReportData, Gender, AgeUnit, FormData } from './types';
import { generateGrowthReport } from './services/geminiService';
import ReportCard from './components/ReportCard';
import InputForm from './components/InputForm';
import ProductPromoCard from './components/ProductPromoCard';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: Gender.MALE,
    age: '',
    ageUnit: AgeUnit.MONTHS,
    weight: '',
    height: '',
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.age || !formData.weight || !formData.height) {
        setError('يرجى ملء جميع الحقول.');
        return;
    }

    const age = Number(formData.age);
    const weight = Number(formData.weight);
    const height = Number(formData.height);

    if (isNaN(age) || age <= 0 || isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0) {
      setError('يرجى إدخال قيم رقمية صحيحة وموجبة للعمر والوزن والطول.');
      return;
    }
    
    const childDataForApi: ChildData = {
        name: formData.name.trim(),
        gender: formData.gender,
        ageUnit: formData.ageUnit,
        age,
        weight,
        height,
    };
    
    setError(null);
    setIsLoading(true);
    setReport(null);
    try {
      const generatedReport = await generateGrowthReport(childDataForApi);
      setReport(generatedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setReport(null);
    setError(null);
    setIsLoading(false);
  }

  const showRecommendations = report !== null;
  const showArgitonPromo = report?.heightStatus === 'قصير القامة';

  return (
    <div className="min-h-screen text-gray-800 w-full flex flex-col items-center p-4 sm:p-6 lg:p-8" dir="rtl">
      <main className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-4 p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-600">مؤشر نمو الاطفال من نور القمر</h1>
          <p className="text-xl text-gray-500 mt-1">نور القمر</p>
          <p className="mt-2 text-lg text-gray-600">احصل على تقرير فوري عن صحة طفلك مدعوم بالذكاء الاصطناعي</p>
        </header>

        <div className={`grid grid-cols-1 ${showRecommendations ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 items-start transition-all duration-500`}>
          <div className="lg:col-span-1">
             <InputForm
              childData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-1">
             <ReportCard 
                reportData={report} 
                isLoading={isLoading} 
                error={error}
                onReset={handleReset}
                childData={formData}
             />
          </div>

          {showRecommendations && (
             <div className="lg:col-span-1 flex flex-col gap-8">
                {showArgitonPromo && (
                  <ProductPromoCard
                    title="توصية خاصة للنمو"
                    description='لأن طول طفلك يحتاج إلى دعم إضافي، نوصي بـ "ان كيو ارجيتون شراب" لتركيبته المتكاملة لدعم الطول والنمو الصحي.'
                    imageUrl="https://lh3.googleusercontent.com/d/1IOj68mzyq1Mqv2Z6uW8ZP5ZJoS2IOilT"
                    purchaseUrl="https://nooralqmar.com/product/%d8%a5%d9%86-%d9%83%d9%8a%d9%88-%d8%a3%d8%b1%d8%ac%d9%8a%d8%aa%d9%88%d9%86-%d8%b4%d8%b1%d8%a7%d8%a8/"
                    altText="عبوة ان كيو ارجيتون شراب"
                  />
                )}
                 <ProductPromoCard
                    title="لتعزيز الذكاء والتركيز"
                    description='نوصي بـ "ميجاميند شراب" لدعم القدرات الذهنية والذاكرة. منتج مثالي لجميع الأطفال لزيادة التركيز والأداء المعرفي.'
                    imageUrl="https://lh3.googleusercontent.com/d/187niJ__b1jGHmF3q2phefqcvvEoDr8nk"
                    purchaseUrl="https://nooralqmar.com/product/%d8%b4%d8%b1%d8%a7%d8%a8-%d9%85%d9%8a%d8%ac%d8%a7%d9%85%d8%a7%d9%8a%d9%86%d8%af/"
                    altText="عبوة ميجاميند شراب"
                  />
             </div>
          )}
        </div>
        
        <footer className="text-center mt-12 text-sm text-gray-500 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl">
            <p className="text-base text-gray-700 mb-4">شركة نور القمر التجارية مرخصة من الهيئة العامة للغذاء والدواء السعودية و وزارة التجارة والصناعة، حاصلون علي شهادات الأيزو الأوروبية في مجال المكملات الغذائية داخل المملكة العربية السعودية، مصنعونا يطبقون أعلى معايير الجودة وحاصلون على شهادات cGMP وISO</p>
            <img 
              src="https://lh3.googleusercontent.com/d/1aMG86utjN5oj1ZE6hAR2rPgOOsoOIhuo" 
              alt="شعار نور القمر" 
              className="h-16 mx-auto"
            />
            <p className="mt-4">&copy; {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;