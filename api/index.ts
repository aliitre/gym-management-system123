import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Route: Generate AI training & nutrition program
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { member } = req.body;
    if (!member) {
      return res.status(400).json({ error: "بيانات المشترك مطلوبة" });
    }

    const ai = getAIClient();
    
    const prompt = `
    أنت مدرب رياضي محترف وخبير تغذية سريرية معتمد.
    قم بإنشاء برنامج تدريبي وخطة غذائية مخصصة للمشترك التالي بناءً على بياناته:
    
    الاسم: ${member.name}
    الجنس: ${member.gender === 'male' ? 'ذكر' : 'أنثى'}
    العمر: ${member.age || 'غير محدد'} سنة
    الوزن: ${member.weight || 'غير محدد'} كجم
    الطول: ${member.height || 'غير محدد'} سم
    الهدف الرياضي: ${member.goal || 'غير محدد'}
    ملاحظات إضافية/حالة صحية: ${member.notes || 'لا يوجد'}

    المطلوب هو توفير خطتين مفصلتين في صيغة JSON تحتوي على عنصرين:
    1. workout (الخطة التدريبية): جدول أسبوعي مفصل بالتمارين والمجموعات والتكرارات وفترات الراحة باللغة العربية بأسلوب مشجع واحترافي. استخدم تنسيق Markdown لتسهيل القراءة.
    2. nutrition (الخطة الغذائية): نظام غذائي يومي متوازن يشمل وجبات الفطور والغداء والعشاء والوجبات الخفيفة، مع توضيح مصادر البروتين والكربوهيدرات والدهون الصحية وكمية المياه الموصى بها، مع نصائح عامة. استخدم تنسيق Markdown لتسهيل القراءة.

    أريدك أن ترجع النتيجة بصيغة JSON نظيفة جداً ومطابقة تماماً للهيكل التالي:
    {
      "workout": "نص الخطة التدريبية المنسق بـ Markdown",
      "nutrition": "نص الخطة الغذائية المنسق بـ Markdown"
    }

    ملاحظة هامة: لا تضع أي كلام جانبي قبل أو بعد الـ JSON. أجب فقط بملف الـ JSON الصالح للتحليل المباشر (JSON parsing).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText.trim());
    
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      error: "فشل في توليد البرنامج باستخدام الذكاء الاصطناعي. تأكد من إعداد مفتاح API بشكل صحيح.",
      details: error.message 
    });
  }
});

export default app;
