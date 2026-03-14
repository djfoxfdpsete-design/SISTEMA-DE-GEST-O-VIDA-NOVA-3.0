
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Filter, MessageCircle, FileText, Users as UsersIcon, AlertTriangle, Smartphone, Banknote } from 'lucide-react';
import { Member, Payment, PaymentMethod, MemberStatus, User } from '../types';
import { MONTH_NAMES } from '../constants';
import jsPDF from 'jspdf';

interface PaymentsProps {
  members: Member[];
  payments: Payment[];
  user: User | null;
  onTogglePayment: (memberId: string, month: number, year: number, method: PaymentMethod) => void;
  onRemovePayment: (memberId: string, month: number, year: number) => void;
}

export const Payments: React.FC<PaymentsProps> = ({ members, payments, user, onTogglePayment, onRemovePayment }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [searchTerm, setSearchTerm] = useState('');

  const canManagePayments = ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'].includes(user?.role || '');

  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentYearReal = today.getFullYear();

  const getPayment = (memberId: string, month: number) => {
    return payments.find(p => p.memberId === memberId && p.month === month && p.year === currentYear);
  };

  const generatePDFReceipt = (payment: Payment, member: Member) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 150] });
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 80, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("ASSOCIAÇÃO VIDA NOVA", 40, 12, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGAMENTO", 40, 35, { align: 'center' });
    doc.setFontSize(9);
    doc.text("------------------------------------------", 40, 42, { align: 'center' });
    doc.text(`ASSOCIADO:`, 10, 52);
    doc.setFont("helvetica", "bold");
    doc.text(member.name.toUpperCase(), 10, 57);
    doc.setFont("helvetica", "normal");
    doc.text(`REFERÊNCIA:`, 10, 67);
    doc.setFont("helvetica", "bold");
    doc.text(`${MONTH_NAMES[payment.month]} / ${payment.year}`, 10, 72);
    doc.setFont("helvetica", "normal");
    doc.text(`VALOR PAGO:`, 10, 82);
    doc.setFont("helvetica", "bold");
    doc.text(`R$ ${payment.amount.toFixed(2)}`, 10, 87);
    doc.setFont("helvetica", "normal");
    doc.text(`MÉTODO:`, 10, 97);
    doc.text(payment.method, 10, 102);
    doc.text(`DATA DO PAGAMENTO:`, 10, 112);
    doc.text(new Date(payment.date).toLocaleString('pt-BR'), 10, 117);
    doc.setFontSize(7);
    doc.text("------------------------------------------", 40, 130, { align: 'center' });
    doc.text("ESTE É UM RECIBO DIGITAL EMITIDO PELO", 40, 135, { align: 'center' });
    doc.text("SISTEMA DE GESTÃO VIDA NOVA - WFOX", 40, 139, { align: 'center' });
    doc.text("AUTENTICAÇÃO: " + payment.id, 40, 144, { align: 'center' });
    doc.save(`Recibo_${member.name.split(' ')[0]}_${MONTH_NAMES[payment.month]}.pdf`);
  };

  const sendWhatsAppReceipt = (payment: Payment, member: Member) => {
    const phone = member.phone.replace(/\D/g, '');
    const message = `*RECIBO DIGITAL - ASSOCIAÇÃO VIDA NOVA*\n\n` +
      `Olá, *${member.name}*! Confirmamos o recebimento da sua mensalidade.\n\n` +
      `📌 *Referência:* ${MONTH_NAMES[payment.month]}/${payment.year}\n` +
      `💰 *Valor:* R$ ${payment.amount.toFixed(2)}\n` +
      `💳 *Forma:* ${payment.method}\n` +
      `🗓️ *Pago em:* ${new Date(payment.date).toLocaleDateString()}\n\n` +
      `_Obrigado por contribuir com a nossa associação!_`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // 1 CLIQUE: MARCA COMO PAGO
  const handleSingleClick = (member: Member, month: number) => {
    if (!canManagePayments) return;
    const existing = getPayment(member.id, month);
    if (!existing) {
      onTogglePayment(member.id, month, currentYear, selectedMethod);
    }
  };

  // 2 CLIQUES: DELETA A MARCAÇÃO (ESTORNO)
  const handleDoubleClick = (memberId: string, month: number) => {
    if (!canManagePayments) return;
    const existing = getPayment(memberId, month);
    if (existing) {
      onRemovePayment(memberId, month, currentYear);
    }
  };

  const filteredMembers = members
    .filter(m => m.status === MemberStatus.ACTIVE)
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Método de Lançamento</span>
            <select 
              value={selectedMethod} 
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-neon-blue outline-none cursor-pointer"
            >
              {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
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
                    const payment = getPayment(member.id, idx);
                    const isPaid = !!payment;
                    const isPast = !isPaid && (currentYear < currentYearReal || (currentYear === currentYearReal && idx < currentMonthIdx));
                    
                    return (
                      <td 
                        key={idx} 
                        onClick={() => handleSingleClick(member, idx)}
                        onDoubleClick={() => handleDoubleClick(member.id, idx)}
                        className={`
                          relative cursor-pointer transition-all duration-150 text-center h-16 border-r border-slate-800/30 select-none
                          ${isPaid ? 'bg-emerald-500/20' : isPast ? 'bg-red-500/10' : 'bg-transparent hover:bg-slate-800'}
                        `}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {isPaid ? (
                            <div className="flex flex-col items-center text-emerald-500 animate-in zoom-in duration-300 relative group/cell">
                              <Check size={18} className="mb-0.5" />
                              <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">{payment.method}</span>
                              
                              {/* Ações de Recibo ao passar o mouse */}
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 rounded-lg p-1 flex gap-1 shadow-2xl opacity-0 group-hover/cell:opacity-100 transition-all z-50">
                                <button onClick={(e) => { e.stopPropagation(); generatePDFReceipt(payment, member); }} className="p-2 hover:bg-slate-800 text-white rounded" title="Baixar PDF"><FileText size={14}/></button>
                                <button onClick={(e) => { e.stopPropagation(); sendWhatsAppReceipt(payment, member); }} className="p-2 hover:bg-slate-800 text-emerald-500 rounded" title="Enviar WhatsApp"><MessageCircle size={14}/></button>
                              </div>
                            </div>
                          ) : isPast ? (
                            <div className="flex flex-col items-center text-red-500 opacity-40">
                              <AlertTriangle size={18} />
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
      
      <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-emerald-500">
             <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
             1 Clique: Registrar Pago
          </div>
          <div className="flex items-center gap-2 text-red-400">
             <div className="w-3 h-3 bg-red-400 rounded-full"></div>
             2 Cliques: Deletar Marcação
          </div>
        </div>
      </div>
    </div>
  );
};
