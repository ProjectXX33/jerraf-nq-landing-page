import React from 'react';
import { ReportData, FormData } from '../../types/growth-system';
import { CheckCircleIcon, BulbIcon } from './icons';

interface ReportPDFProps {
    reportData: ReportData;
    childData: FormData;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ reportData, childData }) => {
    const getWeightStatusStyles = (status: string) => {
        switch (status) {
            case 'وزن مثالي': return 'bg-green-100 text-green-800';
            case 'نحافة': return 'bg-yellow-100 text-yellow-800';
            case 'وزن زائد': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getHeightStatusStyles = (status: string) => {
        switch (status) {
            case 'طول طبيعي': return 'bg-green-100 text-green-800';
            case 'قصير القامة': return 'bg-yellow-100 text-yellow-800';
            case 'طويل القامة': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const today = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div style={{ width: '210mm', minHeight: '297mm', direction: 'rtl' }} className="p-12 bg-white text-gray-800 font-['Cairo'] flex flex-col">
            <header className="flex justify-between items-center pb-8 border-b-2 border-amber-500">
                <div>
                    <h1 className="text-4xl font-bold text-amber-600">تقرير نمو الطفل</h1>
                    <p className="text-lg text-gray-500 mt-2">صادر من مؤشر نمو الأطفال لنور القمر</p>
                </div>
                <img
                    src="https://lh3.googleusercontent.com/d/1aMG86utjN5oj1ZE6hAR2rPgOOsoOIhuo"
                    alt="شعار نور القمر"
                    className="h-24"
                />
            </header>

            <main className="mt-10 flex-grow">
                <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg mb-10 border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">بيانات الطفل</h2>
                        <p><span className="font-semibold">الاسم:</span> {childData.name}</p>
                        <p><span className="font-semibold">الجنس:</span> {childData.gender}</p>
                        <p><span className="font-semibold">العمر:</span> {childData.age} {childData.ageUnit}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">القياسات</h2>
                        <p><span className="font-semibold">الوزن:</span> {childData.weight} كجم</p>
                        <p><span className="font-semibold">الطول:</span> {childData.height} سم</p>
                        <p><span className="font-semibold">تاريخ التقرير:</span> {today}</p>
                    </div>
                </div>

                <div className="mb-10">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">نتائج التقييم</h2>
                     <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center">
                            <span className="font-semibold ml-2 text-gray-600">حالة الوزن:</span>
                            <span className={`rounded-full px-4 py-1 text-base font-semibold ${getWeightStatusStyles(reportData.weightStatus)}`}>
                                {reportData.weightStatus}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold ml-2 text-gray-600">حالة الطول:</span>
                             <span className={`rounded-full px-4 py-1 text-base font-semibold ${getHeightStatusStyles(reportData.heightStatus)}`}>
                                {reportData.heightStatus}
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">{reportData.summary}</p>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <BulbIcon className="w-7 h-7 ml-3 text-yellow-500" />
                        توصيات الخبراء
                    </h2>
                    <ul className="space-y-4">
                        {reportData.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <CheckCircleIcon className="w-6 h-6 text-amber-500 ml-4 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 text-lg">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <footer className="pt-8 mt-auto border-t text-center text-sm text-gray-500">
                 <div className="bg-gray-100 p-4 rounded-lg text-gray-600 mb-6 border border-gray-200">
                    <p className="font-bold text-base mb-1">إخلاء مسؤولية:</p>
                    <p className="text-base">{reportData.disclaimer}</p>
                </div>
                <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لشركة نور القمر التجارية.</p>
                <p>هذا التقرير تم إنشاؤه بواسطة نظام الذكاء الاصطناعي.</p>
            </footer>
        </div>
    );
};

export default ReportPDF; 