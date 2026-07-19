import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  Dumbbell, 
  Utensils, 
  Loader2, 
  Copy, 
  Check, 
  Save, 
  TrendingUp, 
  Scale, 
  Ruler, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Member } from '../types';

interface AIPlannerProps {
  members: Member[];
  onSaveAIPlan: (memberId: string, plan: { workout: string; nutrition: string }) => void;
}

export default function AIPlanner({ members, onSaveAIPlan }: AIPlannerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active view tab inside generated program
  const [activeSubTab, setActiveSubTab] = useState<'workout' | 'nutrition'>('workout');

  // Copy success indicator
  const [copied, setCopied] = useState(false);

  // Loaded/generated results
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [nutritionPlan, setNutritionPlan] = useState('');

  // Selected member object
  const member = members.find(m => m.id === selectedMemberId);

  // Listen to custom selection event from other pages
  useEffect(() => {
    const handleSelectMember = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedMemberId(customEvent.detail);
      }
    };
    window.addEventListener('selectAIPlannerMember', handleSelectMember);
    return () => window.removeEventListener('selectAIPlannerMember', handleSelectMember);
  }, []);

  // Update plans if selected member already has a saved AI plan
  useEffect(() => {
    if (member?.aiPlan) {
      setWorkoutPlan(member.aiPlan.workout);
      setNutritionPlan(member.aiPlan.nutrition);
      setError(null);
    } else {
      setWorkoutPlan('');
      setNutritionPlan('');
      setError(null);
    }
  }, [selectedMemberId, members]);

  // Loading quotes for gym owners
  const [quoteIndex, setQuoteIndex] = useState(0);
  const loadingQuotes = [
    "جاري تحليل البنية الجسدية ونسبة الكتلة العضلية والمقاييس...",
    "يقوم الذكاء الاصطناعي ببناء خطة وجبات متوازنة وحساب السعرات...",
    "جاري تفصيل جدول تدريبي أسبوعي متكامل وفقاً للأهداف المدخلة...",
    "يتم الآن صياغة نصائح الاستشفاء العضلي الموصى بها...",
    "تحضير البرنامج النهائي بصيغة قابلة للمشاركة والحفظ..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Call express server-side Gemini endpoint
  const handleGeneratePlan = async () => {
    if (!selectedMemberId || !member) {
      alert('الرجاء اختيار لاعب أولاً!');
      return;
    }

    setLoading(true);
    setError(null);
    setWorkoutPlan('');
    setNutritionPlan('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشل في الاتصال بخادم الذكاء الاصطناعي');
      }

      const data = await response.json();
      
      if (data.workout && data.nutrition) {
        setWorkoutPlan(data.workout);
        setNutritionPlan(data.nutrition);
        // Automatically save back to local storage
        onSaveAIPlan(member.id, {
          workout: data.workout,
          nutrition: data.nutrition,
        });
      } else {
        throw new Error('لم يرجع نموذج الذكاء الاصطناعي النتيجة بالشكل المتوقع، يرجى إعادة المحاولة.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء توليد الخطة');
    } finally {
      setLoading(false);
    }
  };

  // Copy current plan text to clipboard
  const handleCopy = () => {
    const textToCopy = activeSubTab === 'workout' ? workoutPlan : nutritionPlan;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // A very simple markdown to HTML parser that handles linebreaks, bolding (**text**), lists (- or *), and custom headings (#, ##, ###)
  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return (
      <div className="space-y-4 text-slate-200 text-sm leading-relaxed text-right font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-sm font-black text-emerald-400 border-b border-emerald-500/10 pb-1 mt-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded" />
                {trimmed.replace('###', '').trim()}
              </h4>
            );
          }
          if (trimmed.startsWith('##')) {
            return (
              <h3 key={idx} className="text-base font-black text-white mt-6 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                {trimmed.replace('##', '').trim()}
              </h3>
            );
          }
          if (trimmed.startsWith('#')) {
            return (
              <h2 key={idx} className="text-lg font-black text-white bg-slate-800/40 px-3 py-1.5 rounded-lg border-r-4 border-emerald-500 mt-6 mb-3">
                {trimmed.replace('#', '').trim()}
              </h2>
            );
          }
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const content = trimmed.substring(1).trim();
            // Parse inline bolding **text**
            const boldParts = content.split('**');
            return (
              <div key={idx} className="flex items-start gap-2 pr-4 text-slate-300">
                <span className="text-emerald-500 font-bold select-none mt-1">•</span>
                <span>
                  {boldParts.map((part, pIdx) => (
                    pIdx % 2 === 1 ? <strong key={pIdx} className="text-emerald-400 font-bold">{part}</strong> : part
                  ))}
                </span>
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Parse normal text line with potential bold markers
          const boldParts = trimmed.split('**');
          return (
            <p key={idx} className="text-slate-300">
              {boldParts.map((part, pIdx) => (
                pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-right animate-fade-in" id="ai-planner-tab">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md">
        <div className="absolute -top-12 -left-12 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-0.5">
              <Sparkles className="h-3.5 w-3.5" />
              مدعوم بنموذج Gemini 3.5 Flash
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">مخطط التدريب والتغذية بالذكاء الاصطناعي</h2>
            <p className="text-sm text-slate-400">ابتكر برامج غذائية وتدريبية مخصصة وعلمية بنقرة واحدة بناءً على مقاييس اللاعب وهدفه.</p>
          </div>
        </div>
      </div>

      {/* Selector card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-md">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="w-full space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              اختر لاعب الجيم لإنشاء خطة له:
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
            >
              <option value="">-- اضغط للاختيار من لاعبي الجيم النشطين --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.phone}) - {m.goal || 'تخسيس ولياقة'}
                </option>
              ))}
            </select>
          </div>

          {member && (
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full md:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
              )}
              {member.aiPlan ? 'تحديث/إعادة توليد الخطة' : 'توليد برنامج ذكي مخصص'}
            </button>
          )}
        </div>

        {/* Selected Member Metrics Panel */}
        {member && (
          <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="p-3 rounded bg-slate-800/30 flex items-center gap-2.5">
              <Scale className="h-4 w-4 text-sky-400" />
              <div>
                <span className="text-slate-500 block">الوزن الحالي</span>
                <span className="font-extrabold text-slate-200 text-sm">{member.weight ? `${member.weight} كجم` : 'غير مسجل'}</span>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-800/30 flex items-center gap-2.5">
              <Ruler className="h-4 w-4 text-amber-400" />
              <div>
                <span className="text-slate-500 block">الطول</span>
                <span className="font-extrabold text-slate-200 text-sm">{member.height ? `${member.height} سم` : 'غير مسجل'}</span>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-800/30 flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="text-slate-500 block">الهدف الرئيسي</span>
                <span className="font-extrabold text-slate-100">{member.goal || 'تخسيس وصحة'}</span>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-800/30 flex items-center gap-2.5">
              <Users className="h-4 w-4 text-purple-400" />
              <div>
                <span className="text-slate-500 block">الجنس والعمر</span>
                <span className="font-extrabold text-slate-200">
                  {member.gender === 'male' ? 'ذكر' : 'أنثى'}{member.age ? ` (${member.age} سنة)` : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
          <h3 className="text-lg font-bold text-white">جاري إعداد وتحليل البرنامج بواسطة الذكاء الاصطناعي...</h3>
          <p className="text-sm text-emerald-400/80 animate-pulse font-medium">{loadingQuotes[quoteIndex]}</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-right text-rose-200 text-xs leading-relaxed">
          <strong>عذراً، حدث خطأ:</strong> {error}
          <div className="mt-2 text-slate-400">يرجى التأكد من تشغيل الخادم وتوافر مفتاح GEMINI_API_KEY في الإعدادات ثم إعادة المحاولة.</div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {!loading && !error && (workoutPlan || nutritionPlan) && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main program output panel */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 shadow-md overflow-hidden">
            {/* Tab selector bar */}
            <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-between items-center">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveSubTab('workout')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeSubTab === 'workout'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  جدول التمارين الرياضية (Workout)
                </button>
                <button
                  onClick={() => setActiveSubTab('nutrition')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeSubTab === 'nutrition'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Utensils className="h-4 w-4" />
                  برنامج التغذية اليومي (Nutrition)
                </button>
              </div>

              {/* Copy actions */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>
            </div>

            {/* Formatted body */}
            <div className="p-6 h-[500px] overflow-y-auto">
              {activeSubTab === 'workout' ? (
                renderFormattedContent(workoutPlan)
              ) : (
                renderFormattedContent(nutritionPlan)
              )}
            </div>
          </div>

          {/* Side panel with tips */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              نصائح كابتن الذكاء الاصطناعي للاعب
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded bg-slate-800/40 border border-slate-800">
                <h4 className="font-bold text-white mb-1">💡 الالتزام هو سر النتائج</h4>
                <p className="text-slate-400">انصح المشترك بالالتزام بهذا البرنامج لمدة 4-6 أسابيع على الأقل لملاحظة تغيرات واضحة في كتلته البدنية ومعدل طاقته.</p>
              </div>

              <div className="p-3 rounded bg-slate-800/40 border border-slate-800">
                <h4 className="font-bold text-white mb-1">💧 شرب المياه بانتظام</h4>
                <p className="text-slate-400">المعدل الموصى به للمشترك هو لا يقل عن 3-4 لترات مياه يومياً، خصوصاً أثناء ممارسة التدريب عالي الكثافة.</p>
              </div>

              <div className="p-3 rounded bg-slate-800/40 border border-slate-800">
                <h4 className="font-bold text-white mb-1">⏱️ فترات الاستشفاء العضلي</h4>
                <p className="text-slate-400">تأكد من إبلاغ اللاعب بأهمية النوم لمدة 7-8 ساعات يومياً لإعادة بناء الألياف العضلية وتجنب الإرهاق البدني المفرط.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unselected state fallback */}
      {!selectedMemberId && !loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-16 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-slate-700 mb-3 animate-pulse" />
          <h3 className="text-md font-bold text-slate-300">الذكاء الاصطناعي بانتظار اختيار لاعب</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            اختر أحد المشتركين من القائمة المنسدلة في الأعلى، ثم اضغط على زر توليد لإنشاء برنامج تدريب وغذاء رياضي فائق الدقة ومفصل.
          </p>
        </div>
      )}
    </div>
  );
}
