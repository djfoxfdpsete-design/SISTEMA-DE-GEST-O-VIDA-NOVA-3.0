
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
    const [activeTab, setActiveTab] = useState<'financial' | 'messages' | 'polls'>('financial');
    
    // Messaging State
    const [msgText, setMsgText] = useState('');
    const [msgType, setMsgType] = useState<MemberMessage['type']>('Sugestão');
    const [isSending, setIsSending] = useState(false);

    const myPayments = useMemo(() => {
        return payments.filter(p => p.memberId === member.id && p.year === currentYear);
    }, [payments, member.id]);

    const myMessages = useMemo(() => {
        return messages
            .filter(m => m.memberId === member.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [messages, member.id]);

    const activePolls = useMemo(() => {
        return polls.filter(p => p.active);
    }, [polls]);

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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgText.trim()) return;

        setIsSending(true);
        const newMessage: MemberMessage = {
            id: Date.now().toString(),
            memberId: member.id,
            memberName: member.name,
            text: msgText,
            type: msgType,
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Simulate network delay for UX
        setTimeout(() => {
            onSendMessage(newMessage);
            setMsgText('');
            setIsSending(false);
            alert('Mensagem enviada com sucesso! A administração retornará em breve.');
        }, 800);
    };

    const handleCastVote = (pollId: string, optionId: string) => {
        if(confirm("Confirma seu voto? Esta ação não pode ser desfeita.")) {
            onVote(pollId, optionId);
        }
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

                {/* Navigation Tabs */}
                <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                    <button 
                        title="Visualize seu histórico de mensalidades e baixe recibos."
                        onClick={() => setActiveTab('financial')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <FileText size={16}/> Financeiro
                    </button>
                     <button 
                        title="Participe das votações e assembleias ativas."
                        onClick={() => setActiveTab('polls')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'polls' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Vote size={16}/> Assembleia
                    </button>
                    <button 
                        title="Envie mensagens, sugestões ou dúvidas para a diretoria."
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <MessageSquare size={16}/> Suporte
                    </button>
                </div>

                {/* CONTENT AREA */}
                {activeTab === 'financial' && (
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
                )}

                {activeTab === 'polls' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                         <div className="bg-gradient-to-r from-purple-900/50 to-slate-900 border border-purple-500/30 p-4 rounded-xl">
                            <h3 className="font-bold text-white flex items-center gap-2"><Vote size={20} className="text-neon-purple"/> Assembleia Digital</h3>
                            <p className="text-sm text-slate-400 mt-1">Participe das decisões da associação diretamente pelo app.</p>
                         </div>

                         {activePolls.length === 0 ? (
                             <div className="text-center p-12 glass-panel rounded-xl border border-slate-700">
                                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                     <Vote size={32}/>
                                 </div>
                                 <h3 className="text-white font-bold">Nenhuma votação ativa</h3>
                                 <p className="text-slate-500 text-sm mt-2">No momento não há assembleias ou enquetes em andamento.</p>
                             </div>
                         ) : (
                             activePolls.map(poll => {
                                 const hasVoted = poll.votedMembers.includes(member.id);
                                 return (
                                     <div key={poll.id} className="glass-panel p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                                         {hasVoted && (
                                             <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-500/30 flex items-center gap-1">
                                                 <CheckCircle size={12}/> Voto Registrado
                                             </div>
                                         )}
                                         
                                         <h3 className="text-lg font-bold text-white mb-4 pr-12">{poll.question}</h3>
                                         
                                         <div className="space-y-4">
                                             {poll.options.map(opt => {
                                                 const percent = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
                                                 return (
                                                     <div key={opt.id} className="relative">
                                                         {hasVoted ? (
                                                             // Result View
                                                             <div className="mt-2">
                                                                <div className="flex justify-between text-sm text-slate-300 mb-1">
                                                                    <span>{opt.text}</span>
                                                                    <span className="font-mono font-bold">{percent.toFixed(1)}%</span>
                                                                </div>
                                                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                                                    <div 
                                                                        className="h-full bg-gradient-to-r from-neon-purple to-pink-500 transition-all duration-1000 ease-out" 
                                                                        style={{ width: `${percent}%` }}
                                                                    ></div>
                                                                </div>
                                                             </div>
                                                         ) : (
                                                             // Voting View
                                                             <button 
                                                                title={`Clique para votar na opção: ${opt.text}`}
                                                                onClick={() => handleCastVote(poll.id, opt.id)}
                                                                className="w-full text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-neon-blue transition-all group"
                                                             >
                                                                 <div className="flex items-center justify-between">
                                                                     <span className="text-slate-200 font-medium group-hover:text-white">{opt.text}</span>
                                                                     <div className="w-5 h-5 rounded-full border-2 border-slate-500 group-hover:border-neon-blue group-hover:bg-neon-blue/20"></div>
                                                                 </div>
                                                             </button>
                                                         )}
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                         
                                         <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-500">
                                             <span className="flex items-center gap-1"><BarChart2 size={14}/> Total de votos: {poll.totalVotes}</span>
                                             <span>ID: {poll.id.substring(0,8)}</span>
                                         </div>
                                     </div>
                                 );
                             })
                         )}
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* New Message Form */}
                        <div className="glass-panel p-6 rounded-xl border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MessageSquare size={20} className="text-neon-blue"/> Nova Mensagem
                            </h3>
                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Tipo de Mensagem</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Sugestão', 'Dúvida', 'Reclamação', 'Outros'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMsgType(type as any)}
                                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${msgType === type ? 'bg-neon-blue text-slate-900 border-neon-blue font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Sua Mensagem</label>
                                    <textarea 
                                        required
                                        value={msgText}
                                        onChange={(e) => setMsgText(e.target.value)}
                                        placeholder="Escreva aqui sua sugestão, dúvida ou recado para a diretoria..."
                                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none resize-none"
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSending}
                                    title="Clique para enviar sua mensagem para a diretoria da associação."
                                    className="w-full py-3 bg-neon-blue hover:bg-sky-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSending ? 'Enviando...' : <><Send size={18}/> Enviar Mensagem</>}
                                </button>
                            </form>
                        </div>

                        {/* History */}
                        <div>
                             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <History size={20} className="text-slate-400"/> Histórico de Envios
                            </h3>
                            {myMessages.length === 0 ? (
                                <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-slate-800 text-slate-500">
                                    Nenhuma mensagem enviada ainda.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myMessages.map(msg => (
                                        <div key={msg.id} className="glass-panel p-4 rounded-xl border border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded-full bg-neon-blue/10">
                                                    {msg.type}
                                                </span>
                                                <span className="text-xs text-slate-500">{new Date(msg.date).toLocaleDateString()} às {new Date(msg.date).toLocaleTimeString().slice(0,5)}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm mb-3">{msg.text}</p>
                                            <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                                                <span 
                                                  title={msg.status === 'read' ? "A diretoria já visualizou sua mensagem." : "Sua mensagem foi entregue e aguarda leitura."}
                                                  className={`w-2 h-2 rounded-full ${msg.status === 'read' ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                ></span>
                                                <span className="text-xs text-slate-400">
                                                    Status: {msg.status === 'read' ? 'Lido pela administração' : 'Enviado / Aguardando leitura'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-center pt-8 pb-4 opacity-50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Todos os direitos reservados para <span className="text-neon-blue">WFOX SOLUÇÕES INTELIGENTES</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
