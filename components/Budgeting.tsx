
import React, { useState, useMemo } from 'react';
import { PieChart, Plus, Save, AlertTriangle } from 'lucide-react';
import { Budget, Transaction } from '../types';

interface BudgetingProps {
    budgets: Budget[];
    transactions: Transaction[];
    onSave: (budget: Budget) => void;
}

export const Budgeting: React.FC<BudgetingProps> = ({ budgets, transactions, onSave }) => {
    // Group transactions by category (Expense only)
    const categoryExpenses = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const expenses = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totals: Record<string, number> = {};
        expenses.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
        });
        return totals;
    }, [transactions]);

    // Categories available in the system
    const defaultCategories = ['Manutenção', 'Serviços', 'Utilidades', 'Outros', 'Eventos'];

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const handleStartEdit = (budget: Budget) => {
        setEditingId(budget.id);
        setEditValue(budget.limit);
    };

    const handleSaveEdit = (budget: Budget) => {
        onSave({ ...budget, limit: editValue });
        setEditingId(null);
    };

    const handleCreateBudget = (category: string) => {
        const existing = budgets.find(b => b.category === category);
        if (existing) return;

        const newBudget: Budget = {
            id: Date.now().toString(),
            category,
            limit: 1000, // Default start
            period: 'monthly'
        };
        onSave(newBudget);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><PieChart className="text-neon-blue"/> Orçamento Mensal</h2>
                    <p className="text-slate-400 text-sm">Controle de gastos previsto vs realizado.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {budgets.map(budget => {
                    const spent = categoryExpenses[budget.category] || 0;
                    const percent = Math.min(100, (spent / budget.limit) * 100);
                    const isOver = spent > budget.limit;
                    const isNear = percent > 80;

                    return (
                        <div key={budget.id} className="glass-panel p-5 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-white text-lg">{budget.category}</h3>
                                {isOver && (
                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">
                                        <AlertTriangle size={12}/> Estourado
                                    </span>
                                )}
                            </div>

                            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-3">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                                        isOver ? 'bg-red-500' : isNear ? 'bg-orange-400' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-400">Gasto Atual</p>
                                    <p className={`font-mono font-bold ${isOver ? 'text-red-400' : 'text-white'}`}>
                                        R$ {spent.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Limite Definido</p>
                                    {editingId === budget.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                autoFocus
                                                value={editValue} 
                                                onChange={e => setEditValue(Number(e.target.value))}
                                                className="w-24 bg-slate-900 border border-slate-600 rounded px-1 text-right text-white font-mono"
                                            />
                                            <button onClick={() => handleSaveEdit(budget)} className="text-green-400 hover:text-green-300"><Save size={16}/></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleStartEdit(budget)} className="font-mono font-bold text-neon-blue border-b border-dashed border-neon-blue/50 hover:border-neon-blue">
                                            R$ {budget.limit.toFixed(2)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-panel p-6 rounded-xl border border-dashed border-slate-700">
                <h3 className="text-white font-bold mb-4">Adicionar Categoria ao Orçamento</h3>
                <div className="flex flex-wrap gap-2">
                    {defaultCategories.map(cat => {
                        const exists = budgets.some(b => b.category === cat);
                        if (exists) return null;
                        return (
                            <button 
                                key={cat} 
                                onClick={() => handleCreateBudget(cat)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors flex items-center gap-2"
                            >
                                <Plus size={14}/> {cat}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
