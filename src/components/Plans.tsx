import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Tag, 
  DollarSign, 
  Calendar,
  Layers
} from 'lucide-react';
import { Plan } from '../types';

interface PlansProps {
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, 'id'>) => void;
  onUpdatePlan: (id: string, updated: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
}

export default function Plans({ plans, onAddPlan, onUpdatePlan, onDeletePlan }: PlansProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [durationMonths, setDurationMonths] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const openAddForm = () => {
    setEditingPlan(null);
    setName('');
    setPrice('');
    setDurationMonths(1);
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditForm = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDurationMonths(plan.durationMonths);
    setDescription(plan.description);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || durationMonths === '') {
      alert('الرجاء تعبئة كافة الحقول المطلوبة!');
      return;
    }

    const planData = {
      name,
      price: Number(price),
      durationMonths: Number(durationMonths),
      description,
    };

    if (editingPlan) {
      onUpdatePlan(editingPlan.id, planData);
    } else {
      onAddPlan(planData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 text-right animate-fade-in" id="plans-tab">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">باقات واشتراكات الصالة</h2>
          <p className="text-sm text-slate-400">تعديل باقات الجيم، تحديد الأسعار ومدة الصلاحية بالشهور للأعضاء.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          إضافة باقة جديدة
        </button>
      </div>

      {/* Plans list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Badge & Title */}
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {plan.durationMonths === 1 ? 'شهر واحد' : plan.durationMonths === 12 ? 'سنة كاملة' : `${plan.durationMonths} أشهر`}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-4">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1 h-12 overflow-hidden">{plan.description}</p>

              {/* Price Display */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-400 tracking-tight">{plan.price}</span>
                <span className="text-xs font-semibold text-slate-400">ج.م</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end gap-2">
              <button
                onClick={() => openEditForm(plan)}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-all cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                تعديل
              </button>
              <button
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف الباقة (${plan.name})؟ قد يؤثر ذلك على المشتركين الحاليين.`)) {
                    onDeletePlan(plan.id);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-medium transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingPlan ? `تعديل الباقة: ${editingPlan.name}` : 'إضافة باقة اشتراك جديدة'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">اسم الباقة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الباقة الفضية - 3 أشهر"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">سعر الاشتراك (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="مثال: 500"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">المدة بالشهور *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="36"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="مثال: 3"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">وصف الباقة ومميزاتها</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: دخول غير محدود للصالة الرياضية + حصة تدريب شخصية أولى مجاناً"
                  rows={3}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-5 py-2 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  حفظ الباقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
