import React, { useState, useEffect } from 'react';
/**
 * @file src/App.tsx
 * @description الرئيسية لنظام إدارة الجيم الذكي - لوحة تحكم متكاملة ومخطط رياضي معزز بـ Gemini
 */
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Menu, 
  X, 
  Download, 
  Upload, 
  Flame,
  Activity
} from 'lucide-react';
import { Member, Plan, Trainer, Attendance, PaymentLog } from './types';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Plans from './components/Plans';
import Trainers from './components/Trainers';
import AttendanceLog from './components/Attendance';
import AIPlanner from './components/AIPlanner';

// Seed Initial Data if localStorage is empty
const defaultPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'باقة الشهر الفردي (كاردِيو وحديد)',
    price: 400,
    durationMonths: 1,
    description: 'دخول غير محدود لجميع صالات الحديد والكارديو مع قياس الوزن مرتين مجاناً.'
  },
  {
    id: 'plan-2',
    name: 'باقة الـ 3 شهور التوفيرية',
    price: 1000,
    durationMonths: 3,
    description: 'توفر 200 ج.م كاملة، مع قياس إنبادي (InBody) مفصل للدهون والعضلات بداية الاشتراك.'
  },
  {
    id: 'plan-3',
    name: 'باقة الـ 6 شهور الذهبية',
    price: 1800,
    durationMonths: 6,
    description: 'خصم ممتاز ومتابعة قياسات إنبادي شهرية مجانية مع إعداد خطة تمرين أولية.'
  },
  {
    id: 'plan-4',
    name: 'الباقة VIP السنوية الشاملة',
    price: 3200,
    durationMonths: 12,
    description: 'اشتراك عام كامل، تجميد الاشتراك لـ 30 يوماً مجاناً، وخصم 15% على المكملات وصالة المساج.'
  }
];

const defaultTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'كابتن علي الشناوي',
    specialty: 'تدريب القوة وبناء العضلات',
    phone: '01011223344',
    email: 'ali.trainer@gym.com',
    experienceYears: 8,
    salary: 5000,
    assignedMembersCount: 1
  },
  {
    id: 'trainer-2',
    name: 'كابتن يوسف سليم',
    specialty: 'تخسيس ولياقة بدنية',
    phone: '01155667788',
    email: 'youssef.fitness@gym.com',
    experienceYears: 5,
    salary: 4000,
    assignedMembersCount: 1
  },
  {
    id: 'trainer-3',
    name: 'كابتن رانيا يحيى',
    specialty: 'أخصائي تغذية رياضية ومتابعة',
    phone: '01222334455',
    email: 'rania.nutrition@gym.com',
    experienceYears: 4,
    salary: 3800,
    assignedMembersCount: 1
  }
];

const defaultMembers: Member[] = [
  {
    id: 'member-1',
    name: 'أحمد ممدوح عبد الله',
    phone: '01015678944',
    email: 'ahmed.mamdouh@mail.com',
    planId: 'plan-2',
    status: 'active',
    startDate: '2026-06-10',
    endDate: '2026-09-10',
    pricePaid: 1000,
    trainerId: 'trainer-1',
    attendanceCount: 14,
    weight: 84.5,
    height: 178,
    age: 24,
    gender: 'male',
    goal: 'ضخامة عضلية وزيادة وزن',
    notes: 'لا توجد إصابات سابقة. يفضل التركيز على عضلات الصدر والأرجل.'
  },
  {
    id: 'member-2',
    name: 'مصطفى كريم رأفت',
    phone: '01122334455',
    email: 'mostafa.kareem@mail.com',
    planId: 'plan-1',
    status: 'active',
    startDate: '2026-07-05',
    endDate: '2026-08-05',
    pricePaid: 400,
    trainerId: 'trainer-2',
    attendanceCount: 8,
    weight: 96,
    height: 172,
    age: 29,
    gender: 'male',
    goal: 'تخسيس وإنقاص وزن',
    notes: 'يعاني من خشونة خفيفة في الركبة اليسرى، تجنب أوزان السكوات العالية.'
  },
  {
    id: 'member-3',
    name: 'سارة كمال الدين',
    phone: '01233445566',
    email: 'sara.kamal@mail.com',
    planId: 'plan-3',
    status: 'active',
    startDate: '2026-05-15',
    endDate: '2026-11-15',
    pricePaid: 1800,
    trainerId: 'trainer-3',
    attendanceCount: 19,
    weight: 64,
    height: 165,
    age: 22,
    gender: 'female',
    goal: 'تحسين اللياقة البدنية العامة',
    notes: 'تريد زيادة مرونة الجسم وتحمل اللياقة البدنية القلبية.'
  },
  {
    id: 'member-4',
    name: 'خالد وليد محمود',
    phone: '01588776655',
    email: 'khaled.walid@mail.com',
    planId: 'plan-1',
    status: 'expired',
    startDate: '2026-05-01',
    endDate: '2026-06-01',
    pricePaid: 400,
    attendanceCount: 4,
    weight: 79,
    height: 181,
    age: 31,
    gender: 'male',
    goal: 'تحسين اللياقة البدنية العامة'
  }
];

const defaultAttendance: Attendance[] = [
  {
    id: 'log-1',
    memberId: 'member-1',
    memberName: 'أحمد ممدوح عبد الله',
    timestamp: '2026-07-18T18:30:00.000Z',
    type: 'check-in'
  },
  {
    id: 'log-2',
    memberId: 'member-2',
    memberName: 'مصطفى كريم رأفت',
    timestamp: '2026-07-18T19:15:00.000Z',
    type: 'check-in'
  },
  {
    id: 'log-3',
    memberId: 'member-3',
    memberName: 'سارة كمال الدين',
    timestamp: '2026-07-18T17:00:00.000Z',
    type: 'check-in'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gym database state
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem('gym_members');
    const savedPlans = localStorage.getItem('gym_plans');
    const savedTrainers = localStorage.getItem('gym_trainers');
    const savedAttendance = localStorage.getItem('gym_attendance');

    if (savedMembers && savedPlans && savedTrainers && savedAttendance) {
      setMembers(JSON.parse(savedMembers));
      setPlans(JSON.parse(savedPlans));
      setTrainers(JSON.parse(savedTrainers));
      setAttendance(JSON.parse(savedAttendance));
    } else {
      // Seed defaults
      setMembers(defaultMembers);
      setPlans(defaultPlans);
      setTrainers(defaultTrainers);
      setAttendance(defaultAttendance);

      localStorage.setItem('gym_members', JSON.stringify(defaultMembers));
      localStorage.setItem('gym_plans', JSON.stringify(defaultPlans));
      localStorage.setItem('gym_trainers', JSON.stringify(defaultTrainers));
      localStorage.setItem('gym_attendance', JSON.stringify(defaultAttendance));
    }
  }, []);

  // Sync to local storage helper
  const syncState = (updatedMembers: Member[], updatedPlans: Plan[], updatedTrainers: Trainer[], updatedAttendance: Attendance[]) => {
    setMembers(updatedMembers);
    setPlans(updatedPlans);
    setTrainers(updatedTrainers);
    setAttendance(updatedAttendance);

    localStorage.setItem('gym_members', JSON.stringify(updatedMembers));
    localStorage.setItem('gym_plans', JSON.stringify(updatedPlans));
    localStorage.setItem('gym_trainers', JSON.stringify(updatedTrainers));
    localStorage.setItem('gym_attendance', JSON.stringify(updatedAttendance));
  };

  // --- MEMBERS CRUDS ---
  const handleAddMember = (newMem: Omit<Member, 'id' | 'attendanceCount'>) => {
    const fresh: Member = {
      ...newMem,
      id: `member-${Date.now()}`,
      attendanceCount: 0
    };
    const updated = [fresh, ...members];
    syncState(updated, plans, trainers, attendance);
  };

  const handleUpdateMember = (id: string, updatedFields: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    syncState(updated, plans, trainers, attendance);
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    syncState(updated, plans, trainers, attendance);
  };

  // --- PLANS CRUDS ---
  const handleAddPlan = (newPlan: Omit<Plan, 'id'>) => {
    const fresh: Plan = {
      ...newPlan,
      id: `plan-${Date.now()}`
    };
    const updated = [...plans, fresh];
    syncState(members, updated, trainers, attendance);
  };

  const handleUpdatePlan = (id: string, updatedFields: Partial<Plan>) => {
    const updated = plans.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    syncState(members, updated, trainers, attendance);
  };

  const handleDeletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    syncState(members, updated, trainers, attendance);
  };

  // --- TRAINERS CRUDS ---
  const handleAddTrainer = (newTrainer: Omit<Trainer, 'id' | 'assignedMembersCount'>) => {
    const fresh: Trainer = {
      ...newTrainer,
      id: `trainer-${Date.now()}`,
      assignedMembersCount: 0
    };
    const updated = [...trainers, fresh];
    syncState(members, plans, updated, attendance);
  };

  const handleUpdateTrainer = (id: string, updatedFields: Partial<Trainer>) => {
    const updated = trainers.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    syncState(members, plans, updated, attendance);
  };

  const handleDeleteTrainer = (id: string) => {
    const updated = trainers.filter(t => t.id !== id);
    // Remove references in members
    const updatedMembers = members.map(m => m.trainerId === id ? { ...m, trainerId: undefined } : m);
    syncState(updatedMembers, plans, updated, attendance);
  };

  // --- ATTENDANCE ACTIONS ---
  const handleCheckIn = (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;

    const newLog: Attendance = {
      id: `log-${Date.now()}`,
      memberId,
      memberName: mem.name,
      timestamp: new Date().toISOString(),
      type: 'check-in'
    };

    const updatedMembers = members.map(m => 
      m.id === memberId ? { ...m, attendanceCount: (m.attendanceCount || 0) + 1 } : m
    );

    const updatedAttendance = [newLog, ...attendance];
    syncState(updatedMembers, plans, trainers, updatedAttendance);
  };

  const handleCheckOut = (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;

    const newLog: Attendance = {
      id: `log-${Date.now()}`,
      memberId,
      memberName: mem.name,
      timestamp: new Date().toISOString(),
      type: 'check-out'
    };

    const updatedAttendance = [newLog, ...attendance];
    syncState(members, plans, trainers, updatedAttendance);
  };

  // --- AI PLAN SAVE ---
  const handleSaveAIPlan = (memberId: string, aiPlan: { workout: string; nutrition: string }) => {
    const updated = members.map(m => m.id === memberId ? {
      ...m,
      aiPlan: {
        ...aiPlan,
        generatedAt: new Date().toISOString().split('T')[0]
      }
    } : m);
    syncState(updated, plans, trainers, attendance);
  };

  // --- EXPORT DATABASE BACKUP ---
  const exportDatabase = () => {
    const db = { members, plans, trainers, attendance };
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_db_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- IMPORT DATABASE BACKUP ---
  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.plans && parsed.trainers && parsed.attendance) {
          syncState(parsed.members, parsed.plans, parsed.trainers, parsed.attendance);
          alert('تم استعادة قاعدة بيانات الصالة الرياضية بنجاح!');
        } else {
          alert('تنسيق ملف النسخة الاحتياطية غير صالح.');
        }
      } catch (err) {
        alert('فشل في قراءة ملف قاعدة البيانات.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans" id="app-root">
      {/* Top navbar */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Gym brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/10">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">النظام الذكي لإدارة الجيم</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                <Activity className="h-3 w-3" />
                صالة الألعاب الرياضية المحترفة
              </p>
            </div>
          </div>

          {/* Backup utility */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={exportDatabase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition-all cursor-pointer border border-slate-700/60"
              title="تصدير نسخة احتياطية من قاعدة البيانات"
            >
              <Download className="h-3.5 w-3.5" />
              تصدير النسخة الاحتياطية
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-all cursor-pointer border border-slate-800 border-dashed">
              <Upload className="h-3.5 w-3.5" />
              استيراد قاعدة بيانات
              <input
                type="file"
                accept=".json"
                onChange={importDatabase}
                className="hidden"
              />
            </label>
          </div>

          {/* Mobile menu triggers */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:gap-8 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">القوائم الرئيسية</p>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              لوحة التحكم الشاملة
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="h-5 w-5" />
              إدارة الأعضاء والمشتركين
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="h-5 w-5" />
              الباقات والاشتراكات
            </button>

            <button
              onClick={() => setActiveTab('trainers')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'trainers'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="h-5 w-5" />
              الكادر التدريبي (المدربين)
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Clock className="h-5 w-5" />
              سجل حضور الاستقبال
            </button>

            <button
              onClick={() => setActiveTab('ai-planner')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                activeTab === 'ai-planner'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              مخطط التدريب بالذكاء الاصطناعي
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              لوحة التحكم الشاملة
            </button>
            <button
              onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'members' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Users className="h-5 w-5" />
              إدارة الأعضاء والمشتركين
            </button>
            <button
              onClick={() => { setActiveTab('plans'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'plans' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Layers className="h-5 w-5" />
              الباقات والاشتراكات
            </button>
            <button
              onClick={() => { setActiveTab('trainers'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'trainers' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Users className="h-5 w-5" />
              الكادر التدريبي (المدربين)
            </button>
            <button
              onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Clock className="h-5 w-5" />
              سجل حضور الاستقبال
            </button>
            <button
              onClick={() => { setActiveTab('ai-planner'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-right cursor-pointer ${
                activeTab === 'ai-planner' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Sparkles className="h-5 w-5 text-emerald-400" />
              مخطط التدريب بالذكاء الاصطناعي
            </button>

            {/* Export / Import options inside mobile view */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={exportDatabase}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 font-bold"
              >
                <Download className="h-4 w-4" />
                تصدير نسخة احتياطية
              </button>
              <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-800 border-dashed text-xs text-slate-400 font-bold">
                <Upload className="h-4 w-4" />
                استيراد قاعدة بيانات
                <input
                  type="file"
                  accept=".json"
                  onChange={importDatabase}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Dynamic Tab Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              members={members} 
              plans={plans} 
              trainers={trainers} 
              attendance={attendance} 
              onCheckIn={handleCheckIn}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'members' && (
            <Members 
              members={members} 
              plans={plans} 
              trainers={trainers} 
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'plans' && (
            <Plans 
              plans={plans} 
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeTab === 'trainers' && (
            <Trainers 
              trainers={trainers} 
              members={members}
              onAddTrainer={handleAddTrainer}
              onUpdateTrainer={handleUpdateTrainer}
              onDeleteTrainer={handleDeleteTrainer}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceLog 
              attendance={attendance} 
              members={members}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeTab === 'ai-planner' && (
            <AIPlanner 
              members={members}
              onSaveAIPlan={handleSaveAIPlan}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a12] py-4 text-center text-xs text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} نظام إدارة الجيم الذكي. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">الإصدار 1.2.0</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              تخطيط رياضي معزز بـ Gemini
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
