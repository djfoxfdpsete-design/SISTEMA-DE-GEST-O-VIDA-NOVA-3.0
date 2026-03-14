
import React, { useState, useMemo } from 'react';
// Added DollarSign to the imports from lucide-react
import { Download, CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle, Clock, History, DollarSign } from 'lucide-react';
import { Member, Payment, MemberStatus, Transaction } from '../types';
import { MONTH_NAMES, MONTHLY_FEE } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  members: Member[];
  payments: Payment[];
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ members, payments, transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reportData = useMemo(() => {
    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE);
    
    // Todos os pagamentos recebidos NO PERÍODO selecionado (Data do Recebimento)
    const periodReceipts = payments.filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // 1. Quanto entrou de mensalidades do próprio mês selecionado
    const feeRevenueCurrent = periodReceipts
        .filter(p => p.month === selectedMonth && p.year === selectedYear)
        .reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Quanto entrou de mensalidades de meses anteriores (Atrasados recuperados)
    const recoveredArrears = periodReceipts
        .filter(p => p.year < selectedYear || (p.year === selectedYear && p.month < selectedMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Quanto entrou de Fluxo de Caixa extra (Vendas, Aluguéis)
    const periodTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const extraRevenue = periodTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = periodTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

    const totalRevenue = feeRevenueCurrent + recoveredArrears + extraRevenue;
    const finalBalance = totalRevenue - totalExpenses;
    
    const paidMemberIds = payments.filter(p => p.month === selectedMonth && p.year === selectedYear).map(p => p.memberId);
    const unpaidList = activeMembers.filter(m => !paidMemberIds.includes(m.id)).map(m => ({
        name: m.name,
        phone: m.phone
    }));

    return {
      feeRevenueCurrent,
      recoveredArrears,
      extraRevenue,
      totalRevenue,
      totalExpenses,
      finalBalance,
      expensesList: periodTransactions.filter(t => t.type === 'expense'),
      recoveredList: periodReceipts.filter(p => p.year < selectedYear || (p.year === selectedYear && p.month < selectedMonth)),
      unpaidList,
      delinquencyRate: activeMembers.length > 0 ? (unpaidList.length / activeMembers.length) * 100 : 0
    };
  }, [members, payments, transactions, selectedMonth, selectedYear]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const monthName = MONTH_NAMES[selectedMonth];

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Associação Vida Nova", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Demonstrativo de Fluxo Detalhado - ${monthName} / ${selectedYear}`, 14, 30);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumo de Entradas (Modo Caixa)", 14, 45);

    const summaryData = [
        ["(+) Mensalidades (Mês Corrente)", `R$ ${reportData.feeRevenueCurrent.toFixed(2)}`],
        ["(+) Recuperação de Atrasados", `R$ ${reportData.recoveredArrears.toFixed(2)}`],
        ["(+) Receitas Extras do Caixa", `R$ ${reportData.extraRevenue.toFixed(2)}`],
        ["(=) RECEITA TOTAL BRUTA", `R$ ${reportData.totalRevenue.toFixed(2)}`],
        ["(-) DESPESAS TOTAIS", `R$ ${reportData.totalExpenses.toFixed(2)}`],
        ["(=) RESULTADO LÍQUIDO", `R$ ${reportData.finalBalance.toFixed(2)}`]
    ];

    autoTable(doc, {
        startY: 50,
        head: [['Detalhamento', 'Valor']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Atrasados Recuperados Detalhados
    if (reportData.recoveredList.length > 0) {
        doc.text("Atrasados Recuperados (Referência de meses passados)", 14, finalY);
        const recRows = reportData.recoveredList.map(p => {
            const m = members.find(mem => mem.id === p.memberId);
            return [
                m?.name || '?',
                `${MONTH_NAMES[p.month]}/${p.year}`,
                new Date(p.date).toLocaleDateString(),
                p.method,
                `R$ ${p.amount.toFixed(2)}`
            ];
        });

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Sócio', 'Mês Referência', 'Recebido em', 'Via', 'Valor']],
            body: recRows,
            theme: 'striped',
            headStyles: { fillColor: [245, 158, 11] }
        });
        finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`Balanco_VidaNova_DETALHADO_${monthName}_${selectedYear}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-2xl border-l-4 border-neon-blue flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Relatórios de Caixa</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Análise sistêmica de entradas reais e recuperação de dívidas.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-2xl">
            <div className="flex gap-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-black uppercase outline-none">
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-black uppercase outline-none">
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <button onClick={generatePDF} className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-slate-900 font-black rounded-lg hover:brightness-110 transition-all text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20">
                <Download size={18} /> Baixar PDF Detalhado
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl">
             <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-4">
                 <DollarSign size={18} className="text-emerald-500"/> Breakdown Financeiro (Competência)
             </h3>
             
             <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-slate-950/40 rounded-2xl border border-slate-800 group hover:border-neon-blue transition-all">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Mensalidades do Mês</p>
                        <p className="text-xs text-slate-400">Recebimentos no prazo</p>
                    </div>
                    <span className="font-mono text-white font-bold text-lg">R$ {reportData.feeRevenueCurrent.toFixed(2)}</span>
                 </div>

                 <div className="flex justify-between items-center p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 group hover:border-amber-500 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase">Recuperação de Atrasados</p>
                        <p className="text-xs text-slate-400">Pagtos de meses anteriores</p>
                    </div>
                    <span className="font-mono text-amber-500 font-bold text-lg">R$ {reportData.recoveredArrears.toFixed(2)}</span>
                 </div>

                 <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase">Receitas Extras</p>
                        <p className="text-xs text-slate-400">Doações e outros</p>
                    </div>
                    <span className="font-mono text-emerald-500 font-bold text-lg">R$ {reportData.extraRevenue.toFixed(2)}</span>
                 </div>

                 <div className="pt-4 border-t border-slate-800 flex justify-between items-center px-2">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Total Arrecadado</span>
                    <span className="text-2xl font-black text-neon-blue">R$ {reportData.totalRevenue.toFixed(2)}</span>
                 </div>
             </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
              <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <History size={16} className="text-amber-500"/> Detalhes de Recuperação ({reportData.recoveredList.length})
                  </h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-800">
                        {reportData.recoveredList.map((p, idx) => {
                            const m = members.find(mem => mem.id === p.memberId);
                            return (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-all">
                                    <td className="p-4">
                                        <p className="text-xs font-black text-white uppercase">{m?.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Ref: {MONTH_NAMES[p.month]}/{p.year}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-xs font-bold text-amber-500">R$ {p.amount.toFixed(2)}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5">{p.method}</p>
                                    </td>
                                </tr>
                            );
                        })}
                        {reportData.recoveredList.length === 0 && (
                            <tr><td className="p-12 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhum atrasado quitado este mês.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      </div>
    </div>
  );
};
