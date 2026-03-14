
import React, { useState, useEffect } from 'react';
import { Handshake, Plus, Calendar, User, DollarSign, Trash2, X, AlertCircle, CheckCircle2, Clock, Check } from 'lucide-react';
import { Member, Negotiation, Installment, User as AppUser } from '../types';

interface NegotiationsProps {
    negotiations: Negotiation[];
    members: Member[];
    onSave: (negotiation: Negotiation) => void;
    onDelete: (id: string) => void;
    user: AppUser | null;
}

export const Negotiations: React.FC<NegotiationsProps> = ({ negotiations, members, onSave, onDelete, user }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isFoxAdm = user?.role === 'FOX_ADM';
    
    // Form State
    const [memberId, setMemberId] = useState('');
    const [totalDebt, setTotalDebt] = useState('');
    const [installmentsCount, setInstallmentsCount] = useState(2);
    const [negotiator, setNegotiator] = useState<'Edinaldo' | 'Celma'>('Edinaldo');
    const [installments, setInstallments] = useState<Installment[]>([]);

    useEffect(() => {
        if (!isModalOpen) return;

        const count = Number(installmentsCount) || 1;
        const total = Number(totalDebt) || 0;
        const installmentValue = total / count;
        
        const newList: Installment[] = [];
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 30);

        for (let i = 1; i <= count; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + (i - 1));
            
            newList.push({
                number: i,
                dueDate: dueDate.toISOString().split('T')[0],
                amount: installmentValue,
                status: 'pending'
            });
        }
        setInstallments(newList);
    }, [installmentsCount, totalDebt, isModalOpen]);

    const handleDateChange = (index: number, newDate: string) => {
        const updated = [...installments];
        updated[index] = { ...updated[index], dueDate: newDate };
        setInstallments(updated);
    };

    const handleToggleInstallmentStatus = (e: React.MouseEvent, neg: Negotiation, installmentIndex: number) => {
        // Interrompe a propagação para evitar que o clique chegue ao Layout/Menu lateral
        e.preventDefault();
        e.stopPropagation();
        
        const updatedNeg = { ...neg };
        const currentInst = updatedNeg.installments[installmentIndex];
        
        if (currentInst.status === 'pending') {
            currentInst.status = 'paid';
            currentInst.paymentDate = new Date().toISOString();
        } else {
            currentInst.status = 'pending';
            delete currentInst.paymentDate;
        }
        
        onSave(updatedNeg);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!memberId) return alert("Selecione um associado.");
        if (installments.some(inst => !inst.dueDate)) return alert("Preencha todas as datas de vencimento.");

        const newNegotiation: Negotiation = {
            id: Date.now().toString(),
            memberId,
            totalDebt: Number(totalDebt),
            installmentsCount: installments.length,
            negotiator,
            createdAt: new Date().toISOString(),
            installments: installments
        };

        onSave(newNegotiation);
        setIsModalOpen(false);
        setMemberId('');
        setTotalDebt('');
        setInstallmentsCount(2);
    };

    const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Desconhecido';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Handshake className="text-pink-500"/> <span className="text-pink-500 uppercase font-black tracking-tighter">Negociação Parceladas</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-[10px]">Clique no quadrado para marcar como pago e dar baixa.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-black rounded-lg hover:bg-pink-600 transition-all text-xs uppercase tracking-widest shadow-lg shadow-pink-500/20">
                    <Plus size={18} /> Novo Acordo
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {negotiations.map(neg => (
                     <div key={neg.id} className="glass-panel p-6 rounded-2xl border border-pink-500/30 hover:border-pink-500 transition-all">
                         <div className="flex justify-between items-start mb-4">
                             <div>
                                 <h3 className="text-lg font-black text-white uppercase tracking-tight">{getMemberName(neg.memberId)}</h3>
                                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Tesouraria: <span className="text-pink-400">{neg.negotiator}</span></p>
                             </div>
                             <div className="text-right">
                                 <p className="text-2xl font-black text-pink-500">R$ {neg.totalDebt.toFixed(2)}</p>
                                 <p className="text-[10px] text-slate-400 uppercase font-bold">{neg.installmentsCount} parcelas</p>
                             </div>
                         </div>

                         <div className="bg-slate-950/40 rounded-xl p-3 space-y-2 max-h-52 overflow-y-auto custom-scrollbar border border-slate-800">
                             {neg.installments.map((inst, idx) => (
                                 <div 
                                    key={idx} 
                                    className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                                        inst.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                                    }`}
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${inst.status === 'paid' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                                             {inst.number}
                                         </div>
                                         <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tighter">Venc: {new Date(inst.dueDate).toLocaleDateString()}</p>
                                            {inst.paymentDate && <p className="text-[8px] text-emerald-400 font-bold uppercase">Pago em: {new Date(inst.paymentDate).toLocaleDateString()}</p>}
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-4">
                                         <span className="font-mono text-white font-bold text-xs">R$ {inst.amount.toFixed(2)}</span>
                                         
                                         {/* O Quadrado solicitado pelo usuário para dar baixa */}
                                         <button 
                                            onClick={(e) => handleToggleInstallmentStatus(e, neg, idx)}
                                            title={inst.status === 'paid' ? "Marcar como pendente" : "Clique para marcar como PAGO"}
                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-lg ${
                                                inst.status === 'paid' 
                                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105' 
                                                : 'bg-slate-950 border-slate-700 text-transparent hover:border-pink-500'
                                            }`}
                                         >
                                             {inst.status === 'paid' ? <Check size={18} strokeWidth={4} /> : <div className="w-1 h-1 rounded-full bg-slate-800"></div>}
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>

                         <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                             <p className="text-[9px] text-slate-500 font-black uppercase">Acordo firmado em {new Date(neg.createdAt).toLocaleDateString()}</p>
                             {isFoxAdm ? (
                                <button onClick={() => confirm('Excluir negociação permanentemente?') && onDelete(neg.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2" title="Fox ADM: Excluir negociação">
                                    <Trash2 size={16} />
                                </button>
                             ) : (
                                <span title="🛡️ Somente Fox ADM pode excluir" className="text-slate-800 cursor-not-allowed p-2">
                                    <Trash2 size={16} />
                                </span>
                             )}
                         </div>
                     </div>
                 ))}
                 
                 {negotiations.length === 0 && (
                     <div className="md:col-span-2 text-center p-16 border border-dashed border-pink-500/30 rounded-3xl bg-pink-500/5">
                         <Handshake size={64} className="mx-auto text-pink-500 mb-6 opacity-30"/>
                         <p className="text-pink-200 font-black uppercase text-sm tracking-widest">Nenhuma negociação registrada.</p>
                         <p className="text-pink-200/40 text-[10px] uppercase font-bold mt-2">Os parcelamentos de dívidas aparecerão aqui.</p>
                     </div>
                 )}
             </div>

             {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                     <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-pink-500/50 max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                <Handshake className="text-pink-500"/> Nova Negociação
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                         </div>

                         <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="md:col-span-2">
                                     <label className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2 ml-1">Associado Devedor</label>
                                     <div className="relative">
                                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 opacity-50" size={16}/>
                                         <select required value={memberId} onChange={e => setMemberId(e.target.value)} 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-white focus:border-pink-500 outline-none font-bold uppercase text-sm">
                                             <option value="">Selecione...</option>
                                             {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                         </select>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2 ml-1">Total da Dívida</label>
                                     <div className="relative">
                                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 opacity-50" size={16}/>
                                         <input required type="number" step="0.01" value={totalDebt} onChange={e => setTotalDebt(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-white focus:border-pink-500 outline-none font-mono text-lg" placeholder="0,00"/>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2 ml-1">Parcelas</label>
                                     <input required type="number" min="1" max="60" value={installmentsCount} onChange={e => setInstallmentsCount(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:border-pink-500 outline-none font-bold"/>
                                 </div>

                                 <div className="md:col-span-2">
                                     <label className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2 ml-1">Responsável pela Negociação</label>
                                     <select required value={negotiator} onChange={e => setNegotiator(e.target.value as any)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:border-pink-500 outline-none font-black uppercase text-xs">
                                         <option value="Edinaldo">Edinaldo (Tesoureiro)</option>
                                         <option value="Celma">Celma (Assistente Social)</option>
                                     </select>
                                 </div>
                             </div>

                             <div className="pt-4 border-t border-slate-800">
                                 <div className="flex items-center gap-2 mb-4">
                                     <Calendar size={14} className="text-pink-500"/>
                                     <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Cronograma de Pagamento</h4>
                                 </div>
                                 
                                 <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-2 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                     {installments.map((inst, idx) => (
                                         <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-pink-500/30 transition-all">
                                             <span className="text-[10px] font-black text-slate-500 w-6">{inst.number}ª</span>
                                             <div className="flex-1">
                                                 <input 
                                                    type="date" 
                                                    required
                                                    value={inst.dueDate}
                                                    onChange={(e) => handleDateChange(idx, e.target.value)}
                                                    className="w-full bg-transparent text-white text-xs font-bold outline-none focus:text-pink-400"
                                                 />
                                             </div>
                                             <div className="text-xs font-black text-white font-mono">
                                                 R$ {inst.amount.toFixed(2)}
                                             </div>
                                         </div>
                                     ))}
                                     {installments.length === 0 && (
                                         <p className="text-center py-8 text-slate-600 text-[10px] font-black uppercase tracking-widest">Aguardando dados da dívida...</p>
                                     )}
                                 </div>
                             </div>

                             <div className="flex gap-4 pt-4 sticky bottom-0 bg-slate-900/90 backdrop-blur-md pb-2 mt-auto">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 bg-pink-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:brightness-110 shadow-2xl shadow-pink-500/30 transition-all">Salvar Acordo</button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};
