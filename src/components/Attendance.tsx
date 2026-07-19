import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  UserCheck, 
  ArrowLeftRight, 
  UserX,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Attendance, Member } from '../types';

interface AttendanceProps {
  attendance: Attendance[];
  members: Member[];
  onCheckIn: (memberId: string) => void;
  onCheckOut: (memberId: string) => void;
}

export default function AttendanceLog({ attendance, members, onCheckIn, onCheckOut }: AttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [customMsg, setCustomMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Quick action from dropdown
  const handleRecordAttendance = (type: 'check-in' | 'check-out') => {
    if (!selectedMemberId) {
      alert('الرجاء اختيار لاعب أولاً!');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    if (member.status === 'expired') {
      setCustomMsg({ success: false, text: `عذراً، لا يمكن تسجيل حضور اللاعب (${member.name}) لأن اشتراكه منتهي.` });
      return;
    }

    if (member.status === 'suspended') {
      setCustomMsg({ success: false, text: `عذراً، حساب اللاعب (${member.name}) معلق حالياً.` });
      return;
    }

    if (type === 'check-in') {
      onCheckIn(selectedMemberId);
      setCustomMsg({ success: true, text: `تم تسجيل دخول (${member.name}) بنجاح.` });
    } else {
      onCheckOut(selectedMemberId);
      setCustomMsg({ success: true, text: `تم تسجيل خروج (${member.name}) بنجاح.` });
    }

    setSelectedMemberId('');
    setTimeout(() => setCustomMsg(null), 5000);
  };

  // Filter logs
  const filteredLogs = [...attendance]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(log => {
      const matchesSearch = log.memberName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);

      return matchesSearch && matchesType && matchesDate;
    });

  return (
    <div className="space-y-6 text-right animate-fade-in" id="attendance-tab">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">سجل حضور اللاعبين اليومي</h2>
        <p className="text-sm text-slate-400">متابعة دقيقة لعمليات تسجيل الدخول والخروج لأعضاء الصالة وتواريخها.</p>
      </div>

      {/* Manual Check-in widget and filters */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Manual control */}
        <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            تسجيل حضور يدوي من الاستقبال
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">اختر المشترك النشط:</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- اختر المشترك من القائمة --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone}) {m.status === 'expired' ? '[منتهي]' : m.status === 'suspended' ? '[معلق]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleRecordAttendance('check-in')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
              >
                تسجيل دخول (In)
              </button>
              <button
                type="button"
                onClick={() => handleRecordAttendance('check-out')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-2 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
              >
                تسجيل خروج (Out)
              </button>
            </div>
          </div>

          {customMsg && (
            <div className={`p-3 rounded-lg flex items-start gap-2 border text-xs leading-relaxed ${
              customMsg.success 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {customMsg.success ? (
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>{customMsg.text}</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/20 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-emerald-400" />
            فرز وتصفية سجل الحضور
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث باسم اللاعب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">العملية:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">الكل</option>
                <option value="check-in">تسجيل دخول</option>
                <option value="check-out">تسجيل خروج</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">التاريخ:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none text-right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <UserX className="mx-auto h-12 w-12 text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">لم يتم العثور على أي عمليات تسجيل حضور مطابقة لخيارات الفرز الحالية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">اسم اللاعب</th>
                  <th className="px-6 py-4">العملية</th>
                  <th className="px-6 py-4">التوقيت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const logDate = new Date(log.timestamp).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  const logTime = new Date(log.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-200">{log.memberName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold ${
                          log.type === 'check-in' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}>
                          <ArrowLeftRight className="h-3 w-3" />
                          {log.type === 'check-in' ? 'تسجيل دخول' : 'تسجيل خروج'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <span className="font-semibold text-slate-200 font-mono">{logTime}</span>
                        <span className="mx-1.5">•</span>
                        <span>{logDate}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
