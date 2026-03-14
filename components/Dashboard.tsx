
import React, { useMemo, useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Handshake, Smartphone, Banknote, History, ShieldAlert, Clock, Activity } from 'lucide-react';
import { Member, Payment, MemberStatus, Transaction, Negotiation, PaymentMethod } from '../types';
import { StorageService } from '../services/storageService';

interface DashboardProps {
  members: Member[];
  payments: Payment[];
  transactions: Transaction[];
  negotiations: Negotiation[];
}

export const Dashboard: React.FC<DashboardProps> = ({ members, payments, transactions, negotiations }) => {
  const [showBackupAlert, setShowBackupAlert] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const lastBackup = StorageService.getLastBackupDate();
    if (!lastBackup) {
      setShowBackupAlert(true);
    } else {
      const lastDate = new Date(lastBackup);
      const today = new Date();
      const diffDays = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 7) setShowBackupAlert(true);
    }
  }, []);
  
  const stats = useMemo(() => {
    const currentYear = selectedYear;
    const currentMonth = selectedMonth;

    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE);
    
    const allReceivedThisMonth = payments.filter(p => {
        const payDate = new Date(p.date);
        return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
    });

    const currentMonthRefRevenue = allReceivedThisMonth
        .filter(p => p.month === currentMonth && p.year === currentYear)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const recoveredArrearsRevenue = allReceivedThisMonth
        .filter(p => p.year < currentYear || (p.year === currentYear && p.month < currentMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const negotiationRevenue = negotiations.reduce((acc, neg) => {
        const paidThisMonth = neg.installments
            .filter(inst => {
                if (inst.status !== 'paid' || !inst.paymentDate) return false;
                const pDate = new Date(inst.paymentDate);
                return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
            })
            .reduce((sum, inst) => sum + inst.amount, 0);
        return acc + paidThisMonth;
    }, 0);

    const extraRevenue = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'income';
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expenses = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalRevenue = currentMonthRefRevenue + recoveredArrearsRevenue + negotiationRevenue + extraRevenue;
    const balance = totalRevenue - expenses;

    const currentMonthPaidCount = payments.filter(p => p.month === currentMonth && p.year === currentYear).length;
    const delinquencyRate = activeMembers.length > 0 ? ((activeMembers.length - currentMonthPaidCount) / activeMembers.length) * 100 : 0;

    return {
      totalRevenue,
      currentMonthRefRevenue,
      recoveredArrearsRevenue,
      negotiationRevenue,
      expenses,
      balance,
      delinquencyRate,
      methodStats: allReceivedThisMonth.reduce((acc: any, curr) => {
        acc[curr.method] = (acc[curr.method] || 0) + curr.amount;
        return acc;
      }, {})
    };
  }, [members, payments, transactions, negotiations, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {showBackupAlert && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg text-slate-900"><ShieldAlert size={20}/></div>
                  <div>
                      <p className="text-white text-xs font-black uppercase">Segurança de Dados: Backup Necessário</p>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">O sistema não detectou backups recentes.</p>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-neon-blue"/> Resumo do Período
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
              <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="flex-1 sm:flex-none bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-neon-blue focus:outline-none transition-all cursor-pointer"
              >
                  {Array.from({length: 12}).map((_, i) => (
                      <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                  ))}
              </select>
              <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="flex-1 sm:flex-none bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-neon-blue focus:outline-none transition-all cursor-pointer"
              >
                  {Array.from({length: 10}).map((_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return <option key={year} value={year}>{year}</option>;
                  })}
              </select>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 shadow-xl transition-all hover:scale-[1.02]">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Entrada Total</p>
            <h3 className="text-2xl font-black text-white">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-blue shadow-xl transition-all hover:scale-[1.02]">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">No Prazo</p>
            <h3 className="text-2xl font-black text-white">R$ {stats.currentMonthRefRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 shadow-xl transition-all hover:scale-[1.02]">
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Atrasados <History size={10}/></p>
            <h3 className="text-2xl font-black text-amber-500">R$ {stats.recoveredArrearsRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-pink-500 shadow-xl transition-all hover:scale-[1.02]">
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest mb-1">Acordos <Handshake size={10}/></p>
            <h3 className="text-2xl font-black text-pink-500">R$ {stats.negotiationRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-purple shadow-xl transition-all hover:scale-[1.02]">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Líquido</p>
            <h3 className={`text-2xl font-black ${stats.balance >= 0 ? 'text-neon-blue' : 'text-red-400'}`}>R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={18} className="text-neon-blue"/> Saúde Financeira
            </h3>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxa de Inadimplência</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold">Membros pendentes no mês atual</p>
                    </div>
                    <p className={`text-3xl font-black ${stats.delinquencyRate > 20 ? 'text-red-500' : 'text-orange-400'}`}>{stats.delinquencyRate.toFixed(1)}%</p>
                </div>
                <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${stats.delinquencyRate > 20 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${stats.delinquencyRate}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Meta: Abaixo de 10%</span>
                    <span>Status: {stats.delinquencyRate > 20 ? 'Crítico' : 'Estável'}</span>
                </div>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Meios de Pagamento (Mês Atual)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center gap-2 group hover:border-neon-blue transition-all">
                    <Smartphone size={24} className="text-neon-blue mb-1"/>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Via Pix</span>
                    <span className="text-white font-mono font-black text-xl">R$ {(stats.methodStats[PaymentMethod.PIX] || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center gap-2 group hover:border-emerald-500 transition-all">
                    <Banknote size={24} className="text-emerald-500 mb-1"/>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Via Dinheiro</span>
                    <span className="text-white font-mono font-black text-xl">R$ {(stats.methodStats[PaymentMethod.CASH] || 0).toLocaleString('pt-BR')}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
