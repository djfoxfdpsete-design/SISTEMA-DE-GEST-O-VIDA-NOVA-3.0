
import React, { useState, useMemo } from 'react';
import { MessageSquare, Clock, CheckCircle, Search, Filter, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { MemberMessage } from '../types';

interface OmbudsmanProps {
    messages: MemberMessage[];
    onResolve: (id: string, reply: string) => void;
}

export const Ombudsman: React.FC<OmbudsmanProps> = ({ messages, onResolve }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('pending');
    const [replyText, setReplyText] = useState('');
    const [selectedMsg, setSelectedMsg] = useState<MemberMessage | null>(null);

    const filteredMessages = useMemo(() => {
        return messages
            .filter(m => (filterStatus === 'all' || m.status === filterStatus))
            .filter(m => m.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || m.text.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [messages, searchTerm, filterStatus]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMsg || !replyText.trim()) return;
        onResolve(selectedMsg.id, replyText);
        setReplyText('');
        setSelectedMsg(null);
    };

    const getTypeColor = (type: MemberMessage['type']) => {
        switch(type) {
            case 'Reclamação': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Sugestão': return 'text-neon-blue bg-neon-blue/10 border-neon-blue/20';
            case 'Dúvida': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><MessageCircle className="text-neon-blue"/> Ouvidoria Vida Nova</h2>
                    <p className="text-slate-400 text-sm">Painel exclusivo do Fox ADM para gestão de mensagens e feedbacks.</p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button onClick={() => setFilterStatus('pending')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>Pendentes</button>
                    <button onClick={() => setFilterStatus('resolved')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'resolved' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>Resolvidas</button>
                    <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Todas</button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* List */}
                 <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                     <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                        <input 
                            type="text" 
                            placeholder="Buscar mensagens..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-neon-blue outline-none"
                        />
                     </div>
                     
                     {filteredMessages.map(msg => (
                         <button 
                            key={msg.id}
                            onClick={() => setSelectedMsg(msg)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMsg?.id === msg.id ? 'bg-slate-800 border-neon-blue shadow-lg' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`}
                         >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getTypeColor(msg.type)}`}>{msg.type}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{new Date(msg.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-white font-bold text-sm truncate">{msg.memberName}</p>
                            <p className="text-slate-400 text-xs line-clamp-1 mt-1">{msg.text}</p>
                            {msg.status === 'resolved' && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                                    <CheckCircle size={10}/> Respondida
                                </div>
                            )}
                         </button>
                     ))}

                     {filteredMessages.length === 0 && (
                         <div className="text-center py-12 text-slate-600">Nenhuma mensagem nesta categoria.</div>
                     )}
                 </div>

                 {/* Viewer/Reply */}
                 <div className="lg:col-span-2">
                     {selectedMsg ? (
                         <div className="glass-panel p-8 rounded-2xl border border-slate-700 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Enviado por</p>
                                    <h3 className="text-xl font-bold text-white mt-1">{selectedMsg.memberName}</h3>
                                    <p className="text-xs text-neon-blue mt-1">ID Associado: {selectedMsg.memberId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">{new Date(selectedMsg.date).toLocaleString()}</p>
                                    <span className={`inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full border ${getTypeColor(selectedMsg.type)}`}>{selectedMsg.type}</span>
                                </div>
                             </div>

                             <div className="flex-1 space-y-6">
                                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-2"><MessageSquare size={12}/> Mensagem do Associado</p>
                                    <p className="text-slate-200 leading-relaxed italic">"{selectedMsg.text}"</p>
                                </div>

                                {selectedMsg.status === 'resolved' ? (
                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 animate-in fade-in">
                                        <p className="text-xs text-emerald-500 font-bold uppercase mb-2 flex items-center gap-2"><CheckCircle size={12}/> Sua Resposta (Resolvido)</p>
                                        <p className="text-slate-300 leading-relaxed">{selectedMsg.reply}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply} className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Responder ao Associado</label>
                                            <textarea 
                                                required
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Digite sua resposta ou solução..."
                                                className="w-full h-40 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-neon-blue focus:outline-none resize-none"
                                            ></textarea>
                                        </div>
                                        <button 
                                            type="submit"
                                            className="w-full py-4 bg-neon-blue hover:bg-sky-400 text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2"
                                        >
                                            <Send size={18}/> Enviar Resposta e Marcar como Resolvido
                                        </button>
                                    </form>
                                )}
                             </div>
                         </div>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-600 glass-panel rounded-2xl border border-dashed border-slate-800">
                             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32}/>
                             </div>
                             <p className="font-bold">Selecione uma mensagem para visualizar</p>
                             <p className="text-xs mt-1">Clique nos itens à esquerda para ver os detalhes e responder.</p>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};
