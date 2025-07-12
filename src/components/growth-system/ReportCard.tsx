import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { ReportData, WeightStatus, HeightStatus, FormData } from '../../types/growth-system';
import { CheckCircleIcon, BulbIcon, WarningIcon, DownloadIcon } from './icons';
import ReportPDF from './ReportPDF';

interface ReportCardProps {
    reportData: ReportData | null;
    isLoading: boolean;
    error: string | null;
    onReset: () => void;
    childData: FormData;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="flex gap-4">
            <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-md w-full"></div>
        <div className="space-y-3 pt-4">
            <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        </div>
    </div>
);

const ReportCard: React.FC<ReportCardProps> = ({ reportData, isLoading, error, onReset, childData }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!reportData) return;
        setIsDownloading(true);

        const pdfContainer = document.getElementById('pdf-container');
        if (!pdfContainer) {
            console.error("PDF container element not found.");
            setIsDownloading(false);
            return;
        }

        const reportElement = document.createElement('div');
        pdfContainer.appendChild(reportElement);
        const pdfRoot = ReactDOM.createRoot(reportElement);

        try {
            pdfRoot.render(
                <React.StrictMode>
                    <ReportPDF reportData={reportData} childData={childData} />
                </React.StrictMode>
            );

            await new Promise(resolve => setTimeout(resolve, 500));
            
            const pdfComponent = reportElement.children[0] as HTMLElement;

            const canvas = await html2canvas(pdfComponent, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            
            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
              position = position - pageHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            pdf.save(`تقرير-نمو-${childData.name.trim().replace(/\s+/g, '-')}.pdf`);

        } catch (e) {
            console.error("Error generating PDF", e);
        } finally {
            pdfRoot.unmount();
            if (pdfContainer.contains(reportElement)) {
                pdfContainer.removeChild(reportElement);
            }
            setIsDownloading(false);
        }
    };


    const getWeightStatusStyles = (status: WeightStatus) => {
        switch (status) {
            case 'وزن مثالي':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'نحافة':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'وزن زائد':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    
    const getHeightStatusStyles = (status: HeightStatus) => {
        switch (status) {
            case 'طول طبيعي':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'قصير القامة':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'طويل القامة':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonLoader />;
        }
        if (error) {
            return (
                <div className="text-center">
                    <WarningIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h3>
                    <p className="text-red-500">{error}</p>
                    <button onClick={onReset} className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        المحاولة مرة أخرى
                    </button>
                </div>
            );
        }
        if (reportData) {
            const weightStyle = getWeightStatusStyles(reportData.weightStatus);
            const heightStyle = getHeightStatusStyles(reportData.heightStatus);
            
            return (
                <div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center">
                            <span className="font-semibold ml-2 text-gray-600">الوزن:</span>
                            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${weightStyle}`}>
                                {reportData.weightStatus}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold ml-2 text-gray-600">الطول:</span>
                             <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${heightStyle}`}>
                                {reportData.heightStatus}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-base mb-6">{reportData.summary}</p>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                            <BulbIcon className="w-6 h-6 ml-2 text-yellow-400"/>
                            توصيات الخبراء
                        </h3>
                        <ul className="space-y-3 list-inside">
                            {reportData.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircleIcon className="w-5 h-5 text-amber-500 ml-3 mt-1 flex-shrink-0" />
                                    <span className="text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
                        <p className="font-semibold mb-1">إخلاء مسؤولية:</p>
                        <p>{reportData.disclaimer}</p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                        <button onClick={onReset} className="w-full flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            إجراء فحص آخر
                        </button>
                        <button 
                            onClick={handleDownloadPdf} 
                            disabled={isDownloading}
                            className="w-full flex-1 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-wait flex items-center justify-center"
                        >
                           {isDownloading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 جاري التحميل...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-5 h-5 ml-2" />
                                    تحميل التقرير (PDF)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="text-center text-gray-500">
                 <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-amber-400"/>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-700">التقرير سيظهر هنا</h3>
                <p className="mt-2">املأ البيانات في النموذج المجاور لبدء التحليل.</p>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 min-h-[300px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 sr-only">التقرير</h2>
            {renderContent()}
        </div>
    );
};

export default ReportCard; 