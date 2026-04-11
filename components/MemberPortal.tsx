
import React, { useMemo, useState } from 'react';
import { Member, Payment, PaymentMethod, MemberMessage, Poll } from '../types';
import { MONTH_NAMES } from '../constants';
import { LogOut, CheckCircle, XCircle, FileText, User, Phone, Calendar, MessageSquare, Send, History, Vote, BarChart2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface MemberPortalProps {
    member: Member;
    payments: Payment[];
    messages: MemberMessage[];
    polls: Poll[];
    onSendMessage: (msg: MemberMessage) => void;
    onVote: (pollId: string, optionId: string) => void;
    onLogout: () => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({ member, payments, messages, polls, onSendMessage, onVote, onLogout }) => {
    const currentYear = new Date().getFullYear();
    const myPayments = useMemo(() => {
        return payments.filter(p => p.memberId === member.id && p.year === currentYear);
    }, [payments, member.id]);

    const generateReceipt = (payment: Payment) => {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, 120]
        });
    
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 80, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("Associação Vida Nova", 40, 12, { align: 'center' });
    
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("RECIBO", 40, 30, { align: 'center' });
    
        doc.setFontSize(9);
        doc.text(`Valor: R$ ${payment.amount.toFixed(2)}`, 10, 40);
        doc.text(`Data Pagto: ${new Date(payment.date).toLocaleDateString()}`, 10, 45);
        doc.text(`Ref: ${MONTH_NAMES[payment.month]}/${payment.year}`, 10, 50);
        doc.text(`Associado: ${member.name}`, 10, 60);
        
        doc.setLineWidth(0.5);
        doc.line(10, 75, 70, 75);
        doc.setFontSize(7);
        doc.text("Autenticação Digital:", 40, 80, { align: 'center' });
        doc.text(payment.id, 40, 85, { align: 'center' });
    
        doc.save(`Recibo_${MONTH_NAMES[payment.month]}.pdf`);
    };



    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-lg">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-white font-bold leading-tight truncate max-w-[150px] sm:max-w-none">{member.name}</h1>
                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Associado Ativo</span>
                        </div>
                    </div>
                    <button 
                      onClick={onLogout} 
                      title="Sair do portal do associado."
                      className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                
                {/* Welcome Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                     {/* Decor */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-xl font-bold text-white mb-2 relative z-10">Portal de Transparência</h2>
                    <p className="text-slate-400 text-sm mb-4 relative z-10">
                        Bem-vindo ao seu espaço exclusivo. Acompanhe sua situação financeira, vote nas assembleias e fale com a administração.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-700/50 relative z-10">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Phone size={16} className="text-neon-blue"/>
                            <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Calendar size={16} className="text-neon-blue"/>
                            <span>Membro desde {new Date(member.joinedAt).getFullYear()}</span>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg font-bold text-white mt-2 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-neon-purple"/> Histórico de {currentYear}
                        </h3>

                        <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                            <div className="divide-y divide-slate-800">
                                {MONTH_NAMES.map((month, index) => {
                                    if (index > new Date().getMonth()) return null; // Don't show future months

                                    const payment = myPayments.find(p => p.month === index);
                                    const isPaid = !!payment;

                                    return (
                                        <div key={month} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div 
                                                  title={isPaid ? "Pagamento confirmado no sistema." : "Mensalidade pendente de regularização."}
                                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                                                >
                                                    {isPaid ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{month}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {isPaid ? `Pago em ${new Date(payment.date).toLocaleDateString()}` : 'Pendente'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {isPaid ? (
                                                <button 
                                                    title="Clique para baixar seu recibo oficial em PDF."
                                                    onClick={() => generateReceipt(payment)}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FileText size={14}/> <span className="hidden sm:inline">Baixar Recibo</span>
                                                </button>
                                            ) : (
                                                <span 
                                                  title="Aguardando confirmação de pagamento pela tesouraria."
                                                  className="text-xs font-bold text-red-400 border border-red-500/30 px-2 py-1 rounded bg-red-500/5 cursor-help"
                                                >
                                                    Aguardando
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                <div className="text-center pt-8 pb-4 opacity-50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Todos os direitos reservados para <span className="text-neon-blue">WFOX SOLUÇÕES INTELIGENTES</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
