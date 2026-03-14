
import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Trash2, Tag, Repeat, Smartphone, Banknote, CreditCard, X } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, User } from '../types';

interface CashFlowProps {
  transactions: Transaction[];
  onSave: (t: Transaction) => void;
  onDelete: (id: string) => void;
  user: User | null;
}

export const CashFlow: React.FC<CashFlowProps> = ({ transactions, onSave, onDelete, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const canManage = ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'].includes(user?.role || '');

  const [formData, setFormData] = useState<Partial<Transaction>>({
    title: '',
    amount: 0,
    type: 'expense',
    category: 'Manutenção',
    method: PaymentMethod.PIX,
    date: new Date().toISOString().split('T')[0]
  });

  const [recurringItems, setRecurringItems] = useState([
      { title: 'Conta de Luz', amount: 0, category: 'Utilidades', method: PaymentMethod.PIX, checked: true },
      { title: 'Conta de Água', amount: 0, category: 'Utilidades', method: PaymentMethod.PIX, checked: true },
      { title: 'Internet', amount: 99.90, category: 'Serviços', method: PaymentMethod.PIX, checked: true },
      { title: 'Jardinagem', amount: 150.00, category: 'Manutenção', method: PaymentMethod.CASH, checked: false }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      title: formData.title || 'Sem título',
      amount: Number(formData.amount),
      type: formData.type as TransactionType,
      category: formData.category || 'Outros',
      method: (formData.method as PaymentMethod) || PaymentMethod.PIX,
      date: formData.date || new Date().toISOString(),
      description: formData.description
    };
    onSave(newTransaction);
    setIsModalOpen(false);
    setFormData({ title: '', amount: 0, type: 'expense', category: 'Manutenção', method: PaymentMethod.PIX, date: new Date().toISOString().split('T')[0] });
  };

  const handleRecurringSubmit = () => {
    const today = new Date().toISOString();
    recurringItems.forEach(item => {
        if (item.checked && item.amount > 0) {
            const t: Transaction = {
                id: `rec-${Date.now()}-${Math.random()}`,
                title: item.title,
                amount: item.amount,
                type: 'expense',
                category: item.category,
                method: item.method,
                date: today,
                description: 'Despesa Recorrente Automática'
            };
            onSave(t);
        }
    });
    setIsRecurringModalOpen(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType]);

  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.PIX: 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-black uppercase"><Smartphone size={12}/> Pix</span>;
      case PaymentMethod.CASH: 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase"><Banknote size={12}/> Dinheiro</span>;
      case PaymentMethod.CARD: 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase"><CreditCard size={12}/> Cartão</span>;
      default: return null;
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Receitas Extras</p>
              <h3 className="text-3xl font-black text-white">R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><ArrowUpCircle size={28} /></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Despesas</p>
              <h3 className="text-3xl font-black text-white">R$ {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><ArrowDownCircle size={28} /></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Líquido</p>
              <h3 className={`text-3xl font-black ${summary.balance >= 0 ? 'text-neon-blue' : 'text-red-400'}`}>
                R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-neon-blue/10 rounded-2xl text-neon-blue"><Wallet size={28} /></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800">
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full lg:w-auto">
           <button onClick={() => setFilterType('all')} className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Tudo</button>
           <button onClick={() => setFilterType('income')} className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Receitas</button>
           <button onClick={() => setFilterType('expense')} className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'expense' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>Despesas</button>
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
            <button onClick={() => setIsRecurringModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-black rounded-xl hover:bg-slate-700 transition-all text-[10px] uppercase tracking-widest">
                <Repeat size={16} /> Contas Fixas
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue text-slate-950 font-black rounded-xl hover:brightness-110 transition-all shadow-xl text-[10px] uppercase tracking-widest"
            >
                <Plus size={16} /> Novo Registro
            </button>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-separate border-spacing-0">
             <thead className="bg-slate-950/80 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-10">
               <tr>
                 <th className="px-6 py-6">Motivo</th>
                 <th className="px-6 py-6">Categoria</th>
                 <th className="px-6 py-6">Método</th>
                 <th className="px-6 py-6">Data</th>
                 <th className="px-6 py-6 text-right">Valor</th>
                 <th className="px-6 py-6 text-center">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
               {filteredTransactions.map(t => (
                 <tr key={t.id} className="hover:bg-slate-800/20 transition-all group">
                   <td className="px-6 py-6 font-bold text-white text-sm uppercase tracking-tight">{t.title}</td>
                   <td className="px-6 py-6">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase border border-slate-700">
                       <Tag size={12} className="text-neon-blue" /> {t.category}
                     </span>
                   </td>
                   <td className="px-6 py-6">
                     {getMethodBadge(t.method)}
                   </td>
                   <td className="px-6 py-6 text-slate-500 text-xs font-mono">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                   <td className={`px-6 py-6 text-right font-black text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                     {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </td>
                   <td className="px-6 py-6 text-center">
                     {canManage && (
                        <button 
                          onDoubleClick={(e) => handleDelete(e, t.id)} 
                          className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Dê 2 cliques rápidos para excluir este lançamento"
                        >
                          <Trash2 size={20} />
                        </button>
                     )}
                   </td>
                 </tr>
               ))}
               {filteredTransactions.length === 0 && (
                 <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 uppercase font-black text-xs tracking-widest opacity-30">Nenhum lançamento encontrado</td></tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

      <div className="mt-4 flex items-center gap-2 p-3 bg-slate-900/30 rounded-xl border border-slate-800/50 w-fit">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dica: Dê 2 cliques na lixeira para excluir registros incorretos.</p>
      </div>

      {/* Modal de Novo Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-700 animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Novo Lançamento</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Tipo de Lançamento</label>
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${formData.type === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}>Despesa</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${formData.type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Receita</button>
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Título / Motivo</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm font-bold uppercase focus:border-neon-blue outline-none" placeholder="EX: COMPRA DE MATERIAIS" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Valor (R$)</label>
                    <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-lg outline-none focus:border-neon-blue" placeholder="0,00" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Método</label>
                    <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as any})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:border-neon-blue">
                      <option value={PaymentMethod.PIX}>Pix</option>
                      <option value={PaymentMethod.CASH}>Dinheiro</option>
                      <option value={PaymentMethod.CARD}>Cartão</option>
                    </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-neon-blue text-slate-950 font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Contas Fixas */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsRecurringModalOpen(false)}>
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-700 animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Lançar Contas Fixas</h3>
               <button onClick={() => setIsRecurringModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Selecione e informe os valores das despesas recorrentes:</p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {recurringItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={item.checked} onChange={e => {
                                const newItems = [...recurringItems];
                                newItems[idx].checked = e.target.checked;
                                setRecurringItems(newItems);
                            }} className="w-5 h-5 accent-neon-blue" />
                            <span className="text-xs font-black text-white uppercase">{item.title}</span>
                        </div>
                        <input type="number" step="0.01" value={item.amount} onChange={e => {
                            const newItems = [...recurringItems];
                            newItems[idx].amount = Number(e.target.value);
                            setRecurringItems(newItems);
                        }} className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white font-mono text-xs text-right outline-none focus:border-neon-blue" />
                    </div>
                ))}
            </div>
            <div className="flex gap-4 mt-8 pt-4 border-t border-slate-800">
                <button onClick={() => setIsRecurringModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button onClick={handleRecurringSubmit} className="flex-1 py-4 bg-slate-300 text-slate-950 font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Processar Lançamentos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
