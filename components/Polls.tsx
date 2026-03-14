
import React, { useState } from 'react';
import { Vote, Plus, BarChart2, Check, Trash2 } from 'lucide-react';
import { Poll } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PollsProps {
    polls: Poll[];
    onSave: (poll: Poll) => void;
}

export const Polls: React.FC<PollsProps> = ({ polls, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [optionsStr, setOptionsStr] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = optionsStr.split(',').map(s => s.trim()).filter(s => s).map(s => ({
            id: Math.random().toString(36).substr(2, 9),
            text: s,
            votes: 0
        }));

        if (opts.length < 2) return alert("Adicione pelo menos 2 opções separadas por vírgula.");

        const newPoll: Poll = {
            id: Date.now().toString(),
            question,
            options: opts,
            active: true,
            totalVotes: 0,
            votedMembers: []
        };
        onSave(newPoll);
        setIsModalOpen(false);
        setQuestion('');
        setOptionsStr('');
    };

    const toggleStatus = (poll: Poll) => {
        onSave({ ...poll, active: !poll.active });
    };

    const handleDelete = (poll: Poll) => {
        if(confirm('Tem certeza que deseja excluir esta votação?')) {
            // In a real app we'd have a delete method, here we set to inactive or filter out in parent.
            // Since onSave is upsert, we can't truly delete via onSave without changing logic.
            // For now, let's just close it.
             onSave({ ...poll, active: false }); 
             alert("Votação encerrada/arquivada.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Vote className="text-neon-purple"/> Gestão de Votações</h2>
                    <p className="text-slate-400 text-sm">Crie enquetes para os associados votarem pelo aplicativo.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-white font-bold rounded-lg hover:bg-purple-600 transition-colors">
                    <Plus size={18} /> Nova Votação
                </button>
             </div>

             <div className="grid grid-cols-1 gap-6">
                 {polls.map(poll => {
                     // Prepare data for Recharts
                     const chartData = poll.options.map(opt => ({
                         name: opt.text.length > 15 ? opt.text.substring(0,15) + '...' : opt.text,
                         fullText: opt.text,
                         votos: opt.votes
                     }));

                     return (
                     <div key={poll.id} className="glass-panel p-6 rounded-xl border border-slate-700">
                         <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                             <div>
                                 <h3 className="text-xl font-bold text-white">{poll.question}</h3>
                                 <p className="text-slate-400 text-xs mt-1">ID: {poll.id}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${poll.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                                     {poll.active ? 'Votação Aberta' : 'Encerrada'}
                                 </span>
                                 <button onClick={() => toggleStatus(poll)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700 transition-colors">
                                     {poll.active ? 'Encerrar' : 'Reabrir'}
                                 </button>
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             {/* Stats List */}
                             <div className="lg:col-span-1 space-y-4">
                                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                     <p className="text-slate-400 text-sm">Total de Votos</p>
                                     <p className="text-3xl font-bold text-white">{poll.totalVotes}</p>
                                     <p className="text-xs text-slate-500 mt-1">{poll.votedMembers.length} associados participaram</p>
                                 </div>
                                 <div className="space-y-2">
                                     {poll.options.map((opt, idx) => {
                                         const percent = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
                                         return (
                                             <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-800/30">
                                                 <span className="text-slate-300">{opt.text}</span>
                                                 <div className="text-right">
                                                     <span className="font-bold text-white">{opt.votes}</span>
                                                     <span className="text-slate-500 text-xs ml-1">({percent.toFixed(0)}%)</span>
                                                 </div>
                                             </div>
                                         )
                                     })}
                                 </div>
                             </div>

                             {/* Infographic Chart */}
                             <div className="lg:col-span-2 h-[250px] bg-slate-800/20 rounded-xl p-2 border border-slate-800">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        />
                                        <Bar dataKey="votos" fill="#b026ff" radius={[0, 4, 4, 0]} barSize={20}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#b026ff', '#00d4ff', '#00ff9d', '#ff0055'][index % 4]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                         </div>
                     </div>
                     );
                 })}
                 {polls.length === 0 && (
                     <div className="p-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                         Nenhuma votação criada. Clique em "Nova Votação" para começar.
                     </div>
                 )}
             </div>

             {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                     <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700">
                         <h3 className="text-xl font-bold text-white mb-4">Nova Enquete / Assembleia</h3>
                         <form onSubmit={handleCreate} className="space-y-4">
                             <div>
                                 <label className="block text-sm text-slate-400 mb-1">Pergunta / Pauta</label>
                                 <input required type="text" value={question} onChange={e => setQuestion(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="Ex: Aprovação da pintura do muro?" />
                             </div>
                             <div>
                                 <label className="block text-sm text-slate-400 mb-1">Opções (separadas por vírgula)</label>
                                 <textarea required value={optionsStr} onChange={e => setOptionsStr(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white h-24" placeholder="Sim, Não, Abstenção" />
                             </div>
                             <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 bg-neon-purple text-white font-bold py-2 rounded-lg">Criar Votação</button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};
