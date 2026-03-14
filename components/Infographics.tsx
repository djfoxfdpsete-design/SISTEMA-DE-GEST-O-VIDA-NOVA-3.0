
import React, { useMemo, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
    Calendar, TrendingUp, Users, AlertCircle, Clock, History, 
    ArrowRight, DollarSign, Wallet, Filter, CheckCircle2, Activity
} from 'lucide-react';
import { Member, Payment, Transaction, PaymentMethod, MemberStatus } from '../types';
import { MONTH_NAMES } from '../constants';

interface InfographicsProps {
    members: Member[];
    payments: Payment[];
    transactions: Transaction[];
}

export const Infographics: React.FC<InfographicsProps> = ({ members, payments, transactions }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    // 1. Tendência Diária de Arrecadação (Mês Selecionado)
    const dailyTrend = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const data = [];
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = i.toString().padStart(2, '0');
            const datePrefix = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${dayStr}`;
            
            const dayPayments = payments.filter(p => p.date.startsWith(datePrefix))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            const dayIncomes = transactions.filter(t => t.type === 'income' && t.date.startsWith(datePrefix))
                .reduce((acc, curr) => acc + curr.amount, 0);

            data.push({
                day: i,
                total: dayPayments + dayIncomes
            });
        }
        return data;
    }, [payments, transactions, selectedYear, selectedMonth]);

    // 2. Dados Comparativos Mensais (Este Ano vs Ano Passado)
    const monthlyComparison = useMemo(() => {
        return MONTH_NAMES.map((month, idx) => {
            const thisYearTotal = payments
                .filter(p => p.month === idx && p.year === selectedYear)
                .reduce((acc, curr) => acc + curr.amount, 0) +
                transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === idx && d.getFullYear() === selectedYear && t.type === 'income';
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            const lastYearTotal = payments
                .filter(p => p.month === idx && p.year === selectedYear - 1)
                .reduce((acc, curr) => acc + curr.amount, 0) +
                transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === idx && d.getFullYear() === selectedYear - 1 && t.type === 'income';
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                name: month.substring(0, 3),
                "Este Ano": thisYearTotal,
                "Ano Passado": lastYearTotal
            };
        });
    }, [payments, transactions, selectedYear]);

    // 3. Status das Mensalidades (Visão de Competência do Mês Selecionado)
    const competenceData = useMemo(() => {
        const monthPayments = payments.filter(p => p.month === selectedMonth && p.year === selectedYear);

        const onTimeTotal = monthPayments
            .filter(p => {
                const payDate = new Date(p.date);
                return payDate.getFullYear() === selectedYear && payDate.getMonth() === selectedMonth;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const arrearsTotal = monthPayments
            .filter(p => {
                const payDate = new Date(p.date);
                return payDate.getFullYear() > selectedYear || (payDate.getFullYear() === selectedYear && payDate.getMonth() > selectedMonth);
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const earlyTotal = monthPayments
            .filter(p => {
                const payDate = new Date(p.date);
                return payDate.getFullYear() < selectedYear || (payDate.getFullYear() === selectedYear && payDate.getMonth() < selectedMonth);
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const data = [
            { name: 'Pagos no Prazo', value: onTimeTotal, color: '#00d4ff' },
            { name: 'Recebidos Atrasados', value: arrearsTotal, color: '#f59e0b' },
            { name: 'Pagos Antecipadamente', value: earlyTotal, color: '#2dd4bf' }
        ];

        return data.filter(d => d.value > 0);
    }, [payments, selectedYear, selectedMonth]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header com Filtros Rápidos */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 glass-panel p-8 rounded-3xl border border-slate-700 bg-slate-900/60 shadow-2xl">
                <div className="flex-1">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                        <TrendingUp className="text-amber-500" size={32}/> Infográficos Detalhados
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Transparência sistêmica: evolução diária, mensal e anual.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase px-2">Ano:</span>
                        <select 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase px-2">Mês:</span>
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                        >
                            {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Linha 1: Tendência Diária e Saúde dos Recebimentos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Tendência Diária (Mês Atual) */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2"><Activity size={18} className="text-neon-blue"/> Fluxo Diário de Caixa</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Volume de dinheiro que entrou a cada dia em {MONTH_NAMES[selectedMonth]}</p>
                        </div>
                        <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue font-mono font-bold text-xs">
                            R$ {dailyTrend.reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR')}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Arrecadado']}
                                />
                                <Bar dataKey="total" fill="#00d4ff" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Saúde dos Recebimentos (Recuperação de Atrasados) */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Status da Competência</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Mensalidades de {MONTH_NAMES[selectedMonth]} {selectedYear}</p>
                        </div>
                        <History className="text-amber-500 opacity-50" size={24}/>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={competenceData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {competenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {competenceData.length === 0 && (
                            <div className="text-center w-full mt-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhum pagamento registrado</p>
                            </div>
                        )}
                        <div className="w-full space-y-4 mt-4">
                            {competenceData.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Linha 2: Crescimento Anual Comparado */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Evolução do Faturamento Anual</h3>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Comparativo de performance: {selectedYear} vs {selectedYear - 1}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neon-blue"></div> <span className="text-[10px] text-slate-500 uppercase font-bold">{selectedYear}</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-600"></div> <span className="text-[10px] text-slate-500 uppercase font-bold">{selectedYear - 1}</span></div>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyComparison}>
                            <defs>
                                <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', padding: '12px' }}
                            />
                            <Area type="monotone" dataKey="Este Ano" stroke="#00d4ff" fillOpacity={1} fill="url(#colorThis)" strokeWidth={4} />
                            <Area type="monotone" dataKey="Ano Passado" stroke="#475569" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Selo de Transparência */}
            <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-12 rounded-[40px] border border-amber-500/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30">
                        <CheckCircle2 size={40} className="text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Sistema Auditável e Transparente</h3>
                    <p className="max-w-2xl text-slate-400 font-medium leading-relaxed">
                        Todos os dados aqui apresentados são baseados em lançamentos reais autenticados no banco de dados. 
                        A <span className="text-amber-500 font-bold">Associação Vida Nova</span> preza pela transparência total 
                        da gestão para com seus associados.
                    </p>
                </div>
            </div>
        </div>
    );
};
