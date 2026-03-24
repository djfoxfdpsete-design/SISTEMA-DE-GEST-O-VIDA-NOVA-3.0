import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Filter, Users as UsersIcon, AlertCircle, XCircle } from 'lucide-react';
import { Member, Attendance, AttendanceStatus, MemberStatus, User } from '../types';
import { MONTH_NAMES } from '../constants';

interface AttendancesProps {
  members: Member[];
  attendances: Attendance[];
  user: User | null;
  onToggleAttendance: (memberId: string, month: number, year: number, status: AttendanceStatus) => void;
  onRemoveAttendance: (memberId: string, month: number, year: number) => void;
}

export const Attendances: React.FC<AttendancesProps> = ({ members, attendances, user, onToggleAttendance, onRemoveAttendance }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [searchTerm, setSearchTerm] = useState('');

  const canManageAttendances = ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'].includes(user?.role || '');

  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentYearReal = today.getFullYear();

  const getAttendance = (memberId: string, month: number) => {
    return attendances.find(a => a.memberId === memberId && a.month === month && a.year === currentYear);
  };

  // 1 CLIQUE: MARCA A PRESENÇA (OU ATUALIZA)
  const handleSingleClick = (memberId: string, month: number) => {
    if (!canManageAttendances) return;
    onToggleAttendance(memberId, month, currentYear, selectedStatus);
  };

  // 2 CLIQUES: DELETA A MARCAÇÃO (ESTORNO)
  const handleDoubleClick = (memberId: string, month: number) => {
    if (!canManageAttendances) return;
    const existing = getAttendance(memberId, month);
    if (existing) {
      onRemoveAttendance(memberId, month, currentYear);
    }
  };

  const filteredMembers = members
    .filter(m => m.status === MemberStatus.ACTIVE)
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusColorAndIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return { bg: 'bg-emerald-500/20', icon: <Check size={18} className="text-emerald-500 mb-0.5" /> };
      case AttendanceStatus.JUSTIFIED:
        return { bg: 'bg-orange-500/20', icon: <AlertCircle size={18} className="text-orange-500 mb-0.5" /> };
      case AttendanceStatus.UNJUSTIFIED:
        return { bg: 'bg-red-500/20', icon: <XCircle size={18} className="text-red-500 mb-0.5" /> };
      default:
        return { bg: 'bg-transparent', icon: null };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            <button onClick={() => setCurrentYear(y => y - 1)} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <span className="px-6 font-black text-xl text-white min-w-[100px] text-center">{currentYear}</span>
            <button onClick={() => setCurrentYear(y => y + 1)} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronRight size={20} /></button>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Status a Lançar</span>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-neon-blue outline-none cursor-pointer"
            >
              {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="hidden lg:flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Ativos</span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-black text-neon-blue flex items-center gap-2">
              <UsersIcon size={12}/> {filteredMembers.length}
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-auto">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar associado..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm w-full md:w-72 focus:border-neon-blue outline-none transition-all" 
            />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800">
                <th className="sticky left-0 z-30 bg-slate-900 p-4 text-left border-r border-slate-800 min-w-[300px]">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest"># | ASSOCIADO</span>
                </th>
                {MONTH_NAMES.map(m => (
                  <th key={m} className="p-3 text-center border-r border-slate-800/30 min-w-[90px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{m.substring(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="group hover:bg-slate-800/40 transition-colors border-b border-slate-800/30">
                  <td className="sticky left-0 z-20 bg-slate-900/95 p-4 border-r border-slate-800 flex items-center justify-between group-hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-black text-neon-blue font-mono">
                        {(index + 1).toString().padStart(2, '0')}.
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate uppercase tracking-tight">{member.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{member.phone}</div>
                      </div>
                    </div>
                  </td>
                  {MONTH_NAMES.map((_, idx) => {
                    const attendance = getAttendance(member.id, idx);
                    
                    const cellStyle = attendance ? getStatusColorAndIcon(attendance.status) : { bg: 'bg-transparent hover:bg-slate-800', icon: null };
                    
                    return (
                      <td 
                        key={idx} 
                        onClick={() => handleSingleClick(member.id, idx)}
                        onDoubleClick={() => handleDoubleClick(member.id, idx)}
                        className={`
                          relative cursor-pointer transition-all duration-150 text-center h-16 border-r border-slate-800/30 select-none
                          ${cellStyle.bg}
                        `}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {attendance ? (
                            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                              {cellStyle.icon}
                              {attendance.status === 'Presença' && <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 text-emerald-500">PRESENÇA</span>}
                              {attendance.status === 'Ausência Justificada' && <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 text-orange-500">JUSTIF.</span>}
                              {attendance.status === 'Ausência Não Justificada' && <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 text-red-500">FALTA</span>}
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-neon-blue transition-colors"></div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex-wrap">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest flex-wrap">
          <div className="flex items-center gap-2 text-slate-300">
             <div className="w-3 h-3 bg-neon-blue rounded-full"></div>
             1 Clique: Registrar/Atualizar
          </div>
          <div className="flex items-center gap-2 text-red-400">
             <div className="w-3 h-3 bg-red-400 rounded-full"></div>
             2 Cliques: Apagar Registro
          </div>
          <div className="h-4 w-px bg-slate-700 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-emerald-500">
             <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
             PRESENÇA
          </div>
          <div className="flex items-center gap-2 text-orange-500">
             <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
             AUS. JUSTIFICADA
          </div>
          <div className="flex items-center gap-2 text-red-500">
             <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
             FALTA
          </div>
        </div>
      </div>
    </div>
  );
};
