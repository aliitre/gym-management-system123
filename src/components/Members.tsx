import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Activity, 
  Check, 
  X, 
  Info,
  Sparkles,
  Phone,
  Calendar,
  AlertTriangle,
  RotateCcw,
  User,
  Plus
} from 'lucide-react';
import { Member, Plan, Trainer, SubscriptionStatus } from '../types';

interface MembersProps {
  members: Member[];
  plans: Plan[];
  trainers: Trainer[];
  onAddMember: (member: Omit<Member, 'id' | 'attendanceCount'>) => void;
  onUpdateMember: (id: string, updated: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Members({
  members,
  plans,
  trainers,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onNavigate
}: MembersProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Detail Modal states
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Inputs state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [pricePaid, setPricePaid] = useState<number>(0);
  const [trainerId, setTrainerId] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');

  // Open Form for Adding
  const openAddForm = () => {
    setEditingMember(null);
    setName('');
    setPhone('');
    setEmail('');
    setPlanId(plans[0]?.id || '');
    setPricePaid(plans[0]?.price || 0);
    setTrainerId('');
    setStatus('active');
    setGender('male');
    setAge('');
    setWeight('');
    setHeight('');
    setGoal('تخسيس وإنقاص وزن');
    setNotes('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setPhone(member.phone);
    setEmail(member.email);
    setPlanId(member.planId);
    setPricePaid(member.pricePaid);
    setTrainerId(member.trainerId || '');
    setStatus(member.status);
    setGender(member.gender);
    setAge(member.age || '');
    setWeight(member.weight || '');
    setHeight(member.height || '');
    setGoal(member.goal || '');
    setNotes(member.notes || '');
    setIsFormOpen(true);
  };

  // Sync pricing when plan changes
  const handlePlanChange = (selectedId: string) => {
    setPlanId(selectedId);
    const plan = plans.find(p => p.id === selectedId);
    if (plan) {
      setPricePaid(plan.price);
    }
  };

  // Save member form (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('الاسم ورقم الهاتف حقول مطلوبة!');
      return;
    }

    // Calc subscription dates based on plan duration
    const plan = plans.find(p => p.id === planId);
    const duration = plan ? plan.durationMonths : 1;
    
    let startDate = new Date().toISOString().split('T')[0];
    let endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);
    let endDateStr = endDate.toISOString().split('T')[0];

    const memberData: Omit<Member, 'id' | 'attendanceCount' | 'startDate' | 'endDate'> = {
      name,
      phone,
      email,
      planId,
      status,
      pricePaid: Number(pricePaid),
      trainerId: trainerId || undefined,
      gender,
      age: age ? Number(age) : undefined,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      goal,
      notes,
    };

    if (editingMember) {
      onUpdateMember(editingMember.id, memberData);
    } else {
      onAddMember({
        ...memberData,
        startDate,
        endDate: endDateStr,
      });
    }

    setIsFormOpen(false);
  };

  // Calculate BMI and weight status
  const calculateBMI = (w?: number, h?: number) => {
    if (!w || !h) return null;
    const heightInMeters = h / 100;
    const bmi = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
    
    let statusText = '';
    let colorClass = '';
    if (bmi < 18.5) {
      statusText = 'نقص في الوزن';
      colorClass = 'text-amber-400';
    } else if (bmi >= 18.5 && bmi < 25) {
      statusText = 'وزن مثالي';
      colorClass = 'text-emerald-400';
    } else if (bmi >= 25 && bmi < 30) {
      statusText = 'وزن زائد';
      colorClass = 'text-orange-400';
    } else {
      statusText = 'سمنة';
      colorClass = 'text-rose-400';
    }

    return { value: bmi, label: statusText, color: colorClass };
  };

  // Filtered members list
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesPlan = planFilter === 'all' || member.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6 text-right animate-fade-in" id="members-tab">
      {/* Title & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">إدارة المشتركين</h2>
          <p className="text-sm text-slate-400">إضافة وتعديل ومتابعة اشتراكات الأعضاء وحالاتهم البدنية والرياضية.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 hover:shadow-emerald-500/10 transition-all cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          إضافة مشترك جديد
        </button>
      </div>

      {/* Filter Tools Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالاسم، الهاتف، البريد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-slate-800/80 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0 font-medium">حالة الاشتراك:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="expired">منتهي</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0 font-medium">نوع الباقة:</label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع الباقات</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid / List */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/10 p-12 text-center">
          <User className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-md font-bold text-slate-300">لم يتم العثور على أي مشتركين</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            تأكد من كتابة معايير بحث صحيحة أو ابدأ بإضافة مشترك جديد بالنظام.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const plan = plans.find(p => p.id === member.planId);
            const trainer = trainers.find(t => t.id === member.trainerId);
            const bmiInfo = calculateBMI(member.weight, member.height);

            return (
              <div 
                key={member.id} 
                className="group relative rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-md hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
              >
                {/* Upper row: Name, Avatar, Status badge */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                          {member.name}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono tracking-tight flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-600" />
                          {member.phone}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                      member.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : member.status === 'expired' 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        member.status === 'active' ? 'bg-emerald-400' : member.status === 'expired' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      {member.status === 'active' ? 'نشط' : member.status === 'expired' ? 'منتهي' : 'معلق'}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-slate-800/80 pt-3">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">الباقة الحالية:</span>
                      <p className="font-bold text-slate-200">{plan ? plan.name : 'غير محددة'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">تاريخ الانتهاء:</span>
                      <p className="font-bold text-slate-200 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {member.endDate}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">المدرب الشخصي:</span>
                      <p className="font-bold text-slate-300">{trainer ? trainer.name : 'بدون مدرب'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">عدد مرات الحضور:</span>
                      <p className="font-bold text-slate-300">{member.attendanceCount || 0} مرات</p>
                    </div>
                  </div>

                  {/* BMI Widget if weights available */}
                  {bmiInfo && (
                    <div className="mt-3 p-2 bg-slate-800/30 rounded border border-slate-800/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="h-3 w-3 text-sky-400" />
                        كتلة الجسم (BMI): <strong className="text-slate-200 font-semibold">{bmiInfo.value}</strong>
                      </span>
                      <span className={`font-bold ${bmiInfo.color}`}>{bmiInfo.label}</span>
                    </div>
                  )}
                </div>

                {/* Lower Row: Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(member)}
                      title="تعديل"
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المشترك (${member.name}) نهائياً من النظام؟`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      title="حذف"
                      className="p-1.5 rounded bg-slate-800/40 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onNavigate('ai-planner');
                        // Wait a tiny bit then select the member
                        setTimeout(() => {
                          const customEvent = new CustomEvent('selectAIPlannerMember', { detail: member.id });
                          window.dispatchEvent(customEvent);
                        }, 100);
                      }}
                      className="flex items-center gap-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/80 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      الذكاء الاصطناعي
                    </button>
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="flex items-center gap-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Info className="h-3 w-3" />
                      التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-right space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedMember.name}</h3>
                  <p className="text-xs text-slate-400">{selectedMember.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Subscription details */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-800/40 p-4 text-xs">
                <div>
                  <span className="text-slate-500">تاريخ بدء الاشتراك:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedMember.startDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">تاريخ انتهاء الاشتراك:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedMember.endDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">المبلغ المدفوع:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedMember.pricePaid} ج.م</p>
                </div>
                <div>
                  <span className="text-slate-500">نوع الباقة المشترك فيها:</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {plans.find(p => p.id === selectedMember.planId)?.name || 'غير محدد'}
                  </p>
                </div>
              </div>

              {/* Physical measurements */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-sky-400" />
                  المقاييس البدنية الحالية
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-800/30 p-3 rounded-lg text-center">
                  <div className="p-2 border-l border-slate-800">
                    <span className="text-slate-500">الوزن</span>
                    <p className="font-extrabold text-slate-200 text-sm mt-0.5">
                      {selectedMember.weight ? `${selectedMember.weight} كجم` : '--'}
                    </p>
                  </div>
                  <div className="p-2 border-l border-slate-800">
                    <span className="text-slate-500">الطول</span>
                    <p className="font-extrabold text-slate-200 text-sm mt-0.5">
                      {selectedMember.height ? `${selectedMember.height} سم` : '--'}
                    </p>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500">السن</span>
                    <p className="font-extrabold text-slate-200 text-sm mt-0.5">
                      {selectedMember.age ? `${selectedMember.age} سنة` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Athletic Goal & Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold">الهدف الرياضي:</span>
                  <p className="text-slate-200 bg-slate-800/20 p-2.5 rounded mt-1 border border-slate-800">
                    {selectedMember.goal || 'تخسيس وإنقاص وزن وصحة عامة'}
                  </p>
                </div>
                {selectedMember.notes && (
                  <div>
                    <span className="text-slate-500 font-bold">ملاحظات المدرب والحالة البدنية:</span>
                    <p className="text-slate-400 bg-slate-800/20 p-2.5 rounded mt-1 border border-slate-800 leading-relaxed">
                      {selectedMember.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Has AI Plan button */}
              {selectedMember.aiPlan && (
                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    لديه برنامج رياضي مولد بالذكاء الاصطناعي
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      onNavigate('ai-planner');
                      setTimeout(() => {
                        const customEvent = new CustomEvent('selectAIPlannerMember', { detail: selectedMember.id });
                        window.dispatchEvent(customEvent);
                      }, 100);
                    }}
                    className="text-slate-300 hover:text-white underline"
                  >
                    عرض البرنامج المولد
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedMember(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg cursor-pointer font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Form Modal (Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-right my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingMember ? `تعديل بيانات المشترك: ${editingMember.name}` : 'إضافة مشترك جديد للنظام'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد محمد علي"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 01012345678"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">الجنس</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        gender === 'male' 
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      ذكر
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        gender === 'female' 
                          ? 'bg-pink-600/20 border-pink-500 text-pink-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      أنثى
                    </button>
                  </div>
                </div>

                {/* Subscription Plan */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">باقة الاشتراك</label>
                  <select
                    value={planId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price} ج.م)</option>
                    ))}
                  </select>
                </div>

                {/* Price paid override */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">المبلغ المدفوع فعلياً (ج.م)</label>
                  <input
                    type="number"
                    value={pricePaid}
                    onChange={(e) => setPricePaid(Number(e.target.value))}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                </div>

                {/* Personal Trainer */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">تعيين مدرب شخصي</label>
                  <select
                    value={trainerId}
                    onChange={(e) => setTrainerId(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">بدون مدرب (اشتراك فردي)</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>

                {/* Status - only when editing */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">حالة الاشتراك</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">نشط</option>
                    <option value="expired">منتهي</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>
              </div>

              {/* Physical measurements and goals */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  المقاييس البدنية والأهداف للذكاء الاصطناعي (اختياري)
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">الوزن الحالي (كجم)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 78.5"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">الطول الحالي (سم)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 175"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">العمر (سنوات)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 26"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">الهدف الرياضي للمشترك</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="تخسيس وإنقاص وزن">تخسيس وإنقاص وزن وبناء عضلات صافية</option>
                      <option value="ضخامة عضلية وزيادة وزن">ضخامة عضلية وزيادة وزن وتدريب القوة</option>
                      <option value="تنشيف وإبراز العضلات">تنشيف وإبراز التفاصيل العضلية والتحمل</option>
                      <option value="تحسين اللياقة البدنية العامة">تحسين اللياقة البدنية العامة والصحة القلبية</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">حالة صحية أو ملاحظات خاصة</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثال: لديه إصابة في الركبة، يرجى تجنب السكوات الثقيل"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2 rounded-lg font-semibold cursor-pointer shadow-md"
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
