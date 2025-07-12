
import { GoogleGenAI } from "@google/genai";
import { ChildData, ReportData, AgeUnit } from '../types';

// Check for API key from environment variables
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const NQ_ARGITON_INFO = `
**معلومات عن منتج 'ان كيو ارجيتون شراب' لاستخدامها في التوصية:**

**وصف المنتج:**
مكمل غذائي مصمم خصيصًا لدعم النمو الصحي للأطفال والمراهقين.

**المميزات والفوائد الرئيسية للنمو:**
- **دعم النمو وزيادة الطول:** يحتوي على الأرجينين (200 ملغ) الذي يدعم إنتاج هرمونات النمو، وهو أساسي لتحقيق الطول المثالي.
- **صحة ونمو العظام:** مدعم بفيتامين د3 وفيتامين ك، وهما ضروريان لتقوية العظام ودعم نموها الصحي.
- **دعم شامل:** بالإضافة إلى دعم الطول، فهو يعزز صحة الدماغ، الطاقة، والمناعة بفضل تركيبته الغنية بالفيتامينات (أ, ج, مجموعة ب) والمعادن (حديد, زنك, يود) والأحماض الأمينية.
- **مكونات أساسية للنمو:** يحتوي على اليود الضروري للنمو الطبيعي، والحديد للتطور الإدراكي، والمنغنيز لتكوين الأنسجة الضامة والعظام.
- **الجرعة الموصى بها:** 5 مل يوميًا.
`;


const generatePrompt = (data: ChildData): string => {
    const ageInMonths = data.ageUnit === AgeUnit.YEARS ? data.age * 12 : data.age;

    return `
أنت خبير في طب الأطفال وصحة الطفل. استنادًا إلى البيانات التالية لطفل:
- الاسم: ${data.name}
- الجنس: ${data.gender}
- العمر: ${ageInMonths} شهرًا
- الوزن: ${data.weight} كجم
- الطول: ${data.height} سم

قم بإنشاء تقرير مفصل بصيغة JSON. يجب أن يتبع الكائن JSON الهيكل التالي بدقة:
{
  "weightStatus": "[إحدى القيم التالية فقط: 'نحافة', 'وزن مثالي', 'وزن زائد']",
  "heightStatus": "[إحدى القيم التالية فقط: 'قصير القامة', 'طول طبيعي', 'طويل القامة']",
  "summary": "[ملخص قصير وواضح لحالة الطفل ${data.name} بلغة عربية بسيطة ومطمئنة للوالدين. يجب أن يتناول الملخص حالة الوزن والطول بشكل منفصل ويشرحهما.",
  "recommendations": [
      "[نصيحة 1]",
      "[نصيحة 2]",
      "[نصيحة 3]",
      "[نصيحة 4: (اختياري)]"
    ],
  "disclaimer": "هذا التقرير هو مجرد دليل استرشادي ولا يغني عن استشارة الطبيب المختص."
}

**قواعد هامة لإنشاء التقرير:**
1.  **تحليل مستقل:** قم بتقييم وزن الطفل وطوله بشكل مستقل مقارنة بعمره وجنسه وفقًا لمنحنيات النمو القياسية لتحديد 'weightStatus' و 'heightStatus'.
2.  **توصية مشروطة بمنتج:** **إذا كان 'heightStatus' هو 'قصير القامة'،** فيجب أن تكون النصيحة الأولى **(العنصر الأول في مصفوفة recommendations)** توصية مفصلة ومقنعة باستخدام "ان كيو ارجيتون شراب". استخدم المعلومات أدناه لصياغة هذه التوصية، وركز على كيف يساعد المنتج في زيادة الطول ونمو العظام.
3.  **التوصيات الأخرى:** يجب أن تكون باقي النصائح عملية ومخصصة لحالة الطفل العامة (الوزن، الصحة). إذا كان الوزن مثاليًا، قدم نصائح للحفاظ عليه. إذا كان هناك نقص أو زيادة في الوزن، قدم نصائح لتحسين الوضع. إذا لم تكن هناك حاجة لتوصية المنتج، فقدم 4 توصيات عامة.
4.  **تنسيق الإخراج:** تأكد من أن الرد هو كائن JSON صالح فقط، بدون أي نص إضافي أو علامات markdown مثل \`\`\`json.

${NQ_ARGITON_INFO}
    `;
};


export const generateGrowthReport = async (data: ChildData): Promise<ReportData> => {
    const prompt = generatePrompt(data);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
                maxOutputTokens: 1000,
            },
        });

        // Check if response has candidates
        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error("لم يتم الحصول على استجابة من الذكاء الاصطناعي.");
        }

        const candidate = response.candidates[0];
        if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new Error("الاستجابة من الذكاء الاصطناعي فارغة أو غير صالحة.");
        }

        let jsonStr = candidate.content.parts[0].text?.trim();
        if (!jsonStr) {
            throw new Error("لم يتم الحصول على نص من الاستجابة.");
        }

        // Remove markdown code blocks if present
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData: ReportData = JSON.parse(jsonStr);

        // Basic validation of the returned structure
        if (!parsedData.weightStatus || !parsedData.heightStatus || !parsedData.summary || !Array.isArray(parsedData.recommendations)) {
            throw new Error("تنسيق الاستجابة من الذكاء الاصطناعي غير صالح.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error generating report from Gemini:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('JSON')) {
                throw new Error("فشل في تحليل الاستجابة من الذكاء الاصطناعي. قد تكون هناك مشكلة في الخدمة.");
            }
            if (error.message.includes('API key')) {
                throw new Error("مفتاح API غير صحيح أو مفقود. يرجى التحقق من الإعدادات.");
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error("تم تجاوز حدود الاستخدام المسموح بها. يرجى المحاولة لاحقاً.");
            }
            if (error.message.includes('model') || error.message.includes('not found')) {
                throw new Error("النموذج المطلوب غير متوفر. يرجى المحاولة لاحقاً.");
            }
            // Re-throw custom validation errors
            if (error.message.includes('الذكاء الاصطناعي') || error.message.includes('الاستجابة') || error.message.includes('تنسيق')) {
                throw error;
            }
        }
        
        throw new Error("حدث خطأ أثناء إنشاء التقرير. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    }
};