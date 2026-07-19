import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  ArrowUpRight,
  Sparkles,
  Search,
  UserPlus,
  Moon,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Member, Plan, Trainer, Attendance } from '../types';

interface DashboardProps {
  members: Member[];
  plans: Plan[];
  trainers: Trainer[];
  attendance: Attendance[];
  onCheckIn: (memberId: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  members, 
  plans, 
  trainers, 
  attendance, 
  onCheckIn, 
  onNavigate 
}: DashboardProps) {
  const [quickSearch, setQuickSearch] = useState('');
  const [checkInStatus, setCheckInStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Stats calculations
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const suspendedMembers = members.filter(m => m.status === 'suspended').length;
  
  // Today's date in local YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.timestamp.startsWith(todayStr));
  const todayCheckIns = todayAttendance.filter(a => a.type === 'check-in').length;

  // Monthly Revenue estimation (sum of price paid by active members)
  const totalRevenue = members.reduce((sum, m) => sum + (m.pricePaid || 0), 0);
  const activeRevenue = members.filter(m => m.status === 'active').reduce((sum, m) => sum + (m.pricePaid || 0), 0);

  // Quick Check-In handler
  const handleQuickCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;

    // Search by name or phone or ID
    const member = members.find(m => 
      m.id === quickSearch.trim() || 
      m.phone.includes(quickSearch.trim()) || 
      m.name.toLowerCase().includes(quickSearch.trim().toLowerCase())
    );

    if (!member) {
      setCheckInStatus({ success: false, message: 'المشترك غير موجود، يرجى التحقق من الاسم أو الهاتف' });
      return;
    }

    if (member.status === 'expired') {
      setCheckInStatus({ 
        success: false, 
        message: `اشتراك المشترك (${member.name}) منتهي! يرجى تجديد الاشتراك أولاً.` 
      });
      return;
    }

    if (member.status === 'suspended') {
      setCheckInStatus({ 
        success: false, 
        message: `حساب المشترك (${member.name}) معلق حالياً.` 
      });
      return;
    }

    onCheckIn(member.id);
    setCheckInStatus({ 
      success: true, 
      message: `تم تسجيل حضور (${member.name}) بنجاح! طاب يومك الرياضي.` 
    });
    setQuickSearch('');
    setTimeout(() => setCheckInStatus(null), 5000);
  };

  // Recharts: Subscription distribution
  const planStats = plans.map(p => {
    const count = members.filter(m => m.planId === p.id).length;
    return { name: p.name, value: count };
  }).filter(p => p.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  // Recharts: Monthly registration growth (simulated past 6 months based on actual members start date)
  const getGrowthData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const currentMonthIndex = new Date().getMonth();
    
    // Generate last 6 months list
    const chartMonths = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      chartMonths.push({ monthIndex: idx, name: months[idx], count: 0, revenue: 0 });
    }

    // Count actual members registered in these months
    members.forEach(m => {
      const date = new Date(m.startDate);
      const mIdx = date.getMonth();
      const chartItem = chartMonths.find(cm => cm.monthIndex === mIdx);
      if (chartItem) {
        chartItem.count += 1;
        chartItem.revenue += m.pricePaid;
      }
    });

    // Fallback default values if no data to show beautiful empty-state chart
    if (members.length === 0) {
      return chartMonths.map((cm, i) => ({
        ...cm,
        count: [12, 19, 15, 25, 32, 45][i],
        revenue: [1200, 1900, 1500, 2500, 3200, 4500][i]
      }));
    }

    return chartMonths;
  };

  const growthData = getGrowthData();

  // Recent attendance list (latest 5 logs)
  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in text-right" id="dashboard-tab">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-600 via-teal-700 to-slate-900 p-8 shadow-xl">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            نظام الإدارة الذكي نشط
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            أهلاً بك في لوحة تحكم الجيم
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed">
            تابع تحليلات الاشتراك، سجل الحضور والغياب اليومي، وأصدر جداول التدريب الرياضية للأعضاء المدعومة بالذكاء الاصطناعي من مكان واحد.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate('members')} 
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-950 shadow-md hover:bg-slate-100 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              إضافة مشترك جديد
            </button>
            <button 
              onClick={() => onNavigate('ai-planner')}
              className="flex items-center gap-2 rounded-lg bg-emerald-500/30 border border-emerald-400/40 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-500/40 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              مخطط التدريب الذكي
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Members Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {activeMembers} نشط
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-400 font-medium">إجمالي المشتركين</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{totalMembers}</h2>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex gap-2">
            <span className="text-yellow-500">{suspendedMembers} معلق</span>
            <span>•</span>
            <span className="text-rose-500">{expiredMembers} منتهي</span>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-sky-500/10 rounded-lg text-sky-400">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-sky-400">اليوم</span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-400 font-medium">الحضور اليومي</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{todayCheckIns}</h2>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            تم تسجيل الدخول لـ {todayCheckIns} لاعبين هذا اليوم
          </div>
        </div>

        {/* Active Revenue Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-amber-400">متوقع</span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-400 font-medium">الإيرادات من الاشتراكات النشطة</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {activeRevenue.toLocaleString()} <span className="text-sm font-medium">ج.م</span>
            </h2>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            الإيرادات الإجمالية المحصلة: {totalRevenue.toLocaleString()} ج.م
          </div>
        </div>

        {/* Trainers Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-purple-400">الكادر التدريبي</span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-400 font-medium">المدربين النشطين</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{trainers.length}</h2>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            يديرون تدريب الأعضاء المشتركين بالحصص الشخصية
          </div>
        </div>
      </div>

      {/* Quick Check-In Section and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Clock-in Panel */}
        <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-md space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              تسجيل حضور سريع للاعبين
            </h3>
            <p className="text-xs text-slate-400">
              أدخل اسم المشترك، رقم هاتفه أو معرفه لتسجيل حضوره فوراً
            </p>
          </div>

          <form onSubmit={handleQuickCheckIn} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم، الهاتف أو المعرف..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition-all cursor-pointer shadow-md"
            >
              تسجيل الحضور (Check-In)
            </button>
          </form>

          {checkInStatus && (
            <div className={`p-4 rounded-lg flex items-start gap-3 border ${
              checkInStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}>
              {checkInStatus.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                {checkInStatus.message}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-semibold text-slate-400">آخر حضور اليوم</h4>
              <button 
                onClick={() => onNavigate('attendance')} 
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                عرض السجل الكامل
              </button>
            </div>
            {recentAttendance.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">لم يتم تسجيل حضور أي لاعب اليوم بعد.</p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((log) => {
                  const logTime = new Date(log.timestamp).toLocaleTimeString('ar-EG', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  return (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-xs">
                      <div className="font-medium text-slate-200">{log.memberName}</div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{logTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue and Member Growth Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">إحصائيات الاشتراك والمبيعات</h3>
                <p className="text-xs text-slate-400">معدل التسجيل والإيرادات في آخر 6 أشهر</p>
              </div>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                آخر 6 أشهر
              </span>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', textAlign: 'right' }} 
                    labelFormatter={(value) => `شهر ${value}`}
                  />
                  <Area type="monotone" dataKey="count" name="عدد المسجلين الجدد" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions breakdown & Trainers List */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Plans share */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-md">
          <h3 className="text-lg font-bold text-white mb-4">توزيع المشتركين حسب الباقات</h3>
          {planStats.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              لا توجد اشتراكات نشطة حالياً لتصنيف الباقات
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm w-full sm:w-auto">
                {planStats.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-300 font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-xs">
                      {entry.value} لاعب
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Trainer list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">قائمة المدربين وحصصهم</h3>
            {trainers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">لم يتم إضافة مدربين في النظام بعد.</p>
            ) : (
              <div className="space-y-3">
                {trainers.slice(0, 4).map((trainer) => (
                  <div key={trainer.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800/80">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-100 text-sm">{trainer.name}</div>
                      <div className="text-xs text-emerald-400 font-medium">{trainer.specialty}</div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 font-semibold px-2.5 py-1 rounded-full">
                        {members.filter(m => m.trainerId === trainer.id).length} مشتركين
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button 
              onClick={() => onNavigate('trainers')}
              className="w-full text-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
            >
              إدارة المدربين بالكامل ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
