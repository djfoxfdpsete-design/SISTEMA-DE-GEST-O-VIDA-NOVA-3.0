
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { Member, Reservation } from '../types';

interface ReservationsProps {
    reservations: Reservation[];
    members: Member[];
    onSave: (res: Reservation) => void;
    onDelete: (id: string) => void;
}

export const Reservations: React.FC<ReservationsProps> = ({ reservations, members, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Reservation>>({
        date: new Date().toISOString().split('T')[0],
        area: 'Salao',
        status: 'confirmed'
    });

    const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Desconhecido';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.memberId) return;
        
        const newRes: Reservation = {
            id: Date.now().toString(),
            memberId: formData.memberId,
            date: formData.date || '',
            area: formData.area as 'Salao' | 'Churrasqueira',
            status: 'confirmed'
        };
        onSave(newRes);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Calendar className="text-neon-blue"/> Reservas de Espaço</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-slate-900 font-bold rounded-lg hover:bg-sky-400 transition-colors">
                    <Plus size={18} /> Nova Reserva
                </button>
             </div>

             <div className="glass-panel rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Espaço</th>
                                <th className="px-6 py-4">Associado</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {reservations.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(res => (
                                <tr key={res.id} className="hover:bg-slate-800/30">
                                    <td className="px-6 py-4 text-white font-mono">{new Date(res.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-300">{res.area === 'Salao' ? 'Salão de Festas' : 'Churrasqueira'}</td>
                                    <td className="px-6 py-4 text-white font-medium">{getMemberName(res.memberId)}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full w-fit">
                                            <CheckCircle size={12}/> Confirmado
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onDelete(res.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            {reservations.length === 0 && (
                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhuma reserva futura.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

             {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                     <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700">
                         <h3 className="text-xl font-bold text-white mb-4">Nova Reserva</h3>
                         <form onSubmit={handleSubmit} className="space-y-4">
                             <div>
                                 <label className="block text-sm text-slate-400 mb-1">Associado</label>
                                 <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" 
                                    onChange={e => setFormData({...formData, memberId: e.target.value})}>
                                     <option value="">Selecione...</option>
                                     {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm text-slate-400 mb-1">Data</label>
                                 <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                             </div>
                             <div>
                                 <label className="block text-sm text-slate-400 mb-1">Área Comum</label>
                                 <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value as any})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                                     <option value="Salao">Salão de Festas</option>
                                     <option value="Churrasqueira">Churrasqueira</option>
                                 </select>
                             </div>
                             <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 bg-neon-blue text-slate-900 font-bold py-2 rounded-lg">Reservar</button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};
