import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Briefcase, 
  Smartphone, 
  DollarSign, 
  Award,
  Users
} from 'lucide-react';
import { Trainer, Member } from '../types';

interface TrainersProps {
  trainers: Trainer[];
  members: Member[];
  onAddTrainer: (trainer: Omit<Trainer, 'id' | 'assignedMembersCount'>) => void;
  onUpdateTrainer: (id: string, updated: Partial<Trainer>) => void;
  onDeleteTrainer: (id: string) => void;
}

export default function Trainers({ trainers, members, onAddTrainer, onUpdateTrainer, onDeleteTrainer }: TrainersProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [salary, setSalary] = useState<number | ''>('');

  const openAddForm = () => {
    setEditingTrainer(null);
    setName('');
    setSpecialty('تدريب القوة وبناء العضلات');
    setPhone('');
    setEmail('');
    setExperienceYears(2);
    setSalary('');
    setIsFormOpen(true);
  };

  const openEditForm = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setName(trainer.name);
    setSpecialty(trainer.specialty);
    setPhone(trainer.phone);
    setEmail(trainer.email);
    setExperienceYears(trainer.experienceYears);
    setSalary(trainer.salary);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || salary === '' || experienceYears === '') {
      alert('الرجاء ملء الحقول المطلوبة!');
      return;
    }

    const trainerData = {
      name,
      specialty,
      phone,
      email,
      experienceYears: Number(experienceYears),
      salary: Number(salary),
    };

    if (editingTrainer) {
      onUpdateTrainer(editingTrainer.id, trainerData);
    } else {
      onAddTrainer(trainerData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 text-right animate-fade-in" id="trainers-tab">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">إدارة الكادر التدريبي</h2>
          <p className="text-sm text-slate-400">إضافة مدربين جدد، تحديد الرواتب والمهارات، ومتابعة اللاعبين المسندين إليهم.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          إضافة مدرب جديد
        </button>
      </div>

      {/* Trainers Cards Grid */}
      {trainers.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/10 p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-md font-bold text-slate-300">لا يوجد مدربين مضافين</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            قم بتعيين وإدخال أول كابتن/مدرب بالنظام لبدء إسناد اللاعبين إليه.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => {
            const assignedCount = members.filter(m => m.trainerId === trainer.id).length;

            return (
              <div 
                key={trainer.id} 
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Name and Avatar row */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-amber-400 text-lg">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{trainer.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">{trainer.specialty}</span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="mt-4 space-y-2 text-xs border-t border-slate-800/80 pt-3 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Smartphone className="h-3.5 w-3.5" />
                        الهاتف:
                      </span>
                      <span className="font-semibold font-mono">{trainer.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        سنوات الخبرة:
                      </span>
                      <span className="font-semibold">{trainer.experienceYears} سنوات</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        الراتب الشهري:
                      </span>
                      <span className="font-semibold text-emerald-400">{trainer.salary} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        اللاعبين المسندين:
                      </span>
                      <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                        {assignedCount} مشتركين
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end gap-2">
                  <button
                    onClick={() => openEditForm(trainer)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    تعديل
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف المدرب (${trainer.name}) من النظام؟`)) {
                        onDeleteTrainer(trainer.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trainer Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingTrainer ? `تعديل المدرب: ${editingTrainer.name}` : 'إضافة مدرب جديد'}
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
                <label className="text-xs font-semibold text-slate-300">اسم الكابتن/المدرب *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: كابتن حازم الشريف"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">التخصص *</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="تدريب القوة وبناء العضلات">تدريب القوة وبناء العضلات (Bodybuilding)</option>
                  <option value="تخسيس ولياقة بدنية">تخسيس ولياقة بدنية وإعداد بدني (CrossFit)</option>
                  <option value="تدريب الفنون القتالية والدفاع">تدريب الفنون القتالية والدفاع عن النفس (MMA)</option>
                  <option value="أخصائي تغذية رياضية ومتابعة">أخصائي تغذية رياضية ومتابعة قياسات</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trainer@mail.com"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">سنوات الخبرة *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">الراتب الشهري (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>
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
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
