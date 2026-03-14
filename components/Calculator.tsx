
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator as CalcIcon, Users 
} from 'lucide-react';
import { MONTHLY_FEE } from '../constants';

type CalculatorMode = 'scientific' | 'association';

export const Calculator: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('scientific');

  // --- 1. STATE: SCIENTIFIC CALCULATOR ---
  const [display, setDisplay] = useState('');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('');
    } else if (val === 'DEL') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safety: Basic evaluation replacing math functions
        let expression = display
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10')
          .replace(/ln/g, 'Math.log')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/π/g, 'Math.PI')
          .replace(/\^/g, '**');
        
        // eslint-disable-next-line no-eval
        const result = eval(expression); 
        setCalcHistory(prev => [`${display} = ${result}`, ...prev].slice(0, 5));
        setDisplay(String(result));
      } catch (e) {
        setDisplay('Erro');
        setTimeout(() => setDisplay(''), 1000);
      }
    } else {
      setDisplay(prev => prev + val);
    }
  };

  const sciButtons = [
    ['C', 'DEL', '(', ')', '/'],
    ['sin', '7', '8', '9', '*'],
    ['cos', '4', '5', '6', '-'],
    ['tan', '1', '2', '3', '+'],
    ['sqrt', '0', '.', '^', '='],
    ['log', 'ln', 'π']
  ];

  // --- 2. STATE: ASSOCIATION SIMULATOR ---
  const [memberCount, setMemberCount] = useState(() => {
    const saved = localStorage.getItem('calc_memberCount');
    return saved ? Number(saved) : 100;
  });
  const [fee, setFee] = useState(() => {
    const saved = localStorage.getItem('calc_fee');
    return saved ? Number(saved) : MONTHLY_FEE;
  });
  const [paymentRate, setPaymentRate] = useState(() => {
    const saved = localStorage.getItem('calc_paymentRate');
    return saved ? Number(saved) : 85;
  });

  useEffect(() => {
    if (mode === 'association') {
      localStorage.setItem('calc_memberCount', memberCount.toString());
      localStorage.setItem('calc_fee', fee.toString());
      localStorage.setItem('calc_paymentRate', paymentRate.toString());
    }
  }, [memberCount, fee, paymentRate, mode]);

  const associationProjection = useMemo(() => {
    const theoreticalMonthly = memberCount * fee;
    const realMonthly = theoreticalMonthly * (paymentRate / 100);
    const yearly = realMonthly * 12;
    const loss = theoreticalMonthly - realMonthly;
    return { theoreticalMonthly, realMonthly, yearly, loss };
  }, [memberCount, fee, paymentRate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Navigation Tabs - Swapped Order */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button 
          onClick={() => setMode('scientific')} 
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'scientific' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
        >
          <CalcIcon size={18}/> <span>Calculadora Científica</span>
        </button>
        <button 
          onClick={() => setMode('association')} 
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'association' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
        >
          <Users size={18}/> <span>Simulador Associação</span>
        </button>
      </div>

      {/* --- MODE 1: SCIENTIFIC CALCULATOR --- */}
      {mode === 'scientific' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-300 max-w-lg mx-auto">
             <div className="bg-slate-900 p-4 rounded-xl mb-4 border border-slate-800 text-right">
                 <div className="text-slate-500 text-xs h-4">{calcHistory[0]}</div>
                 <div className="text-3xl font-mono text-white tracking-widest overflow-x-auto whitespace-nowrap h-12 flex items-center justify-end">
                     {display || '0'}
                 </div>
             </div>
             
             <div className="grid grid-cols-5 gap-2">
                 {sciButtons.map((row, rIdx) => (
                    <React.Fragment key={rIdx}>
                        {row.map((btn) => (
                            <button
                                key={btn}
                                onClick={() => handleCalcBtn(btn)}
                                className={`
                                    p-4 rounded-lg font-bold text-lg transition-all active:scale-95
                                    ${btn === '=' ? 'bg-neon-blue text-slate-900 col-span-1' : 
                                      ['C', 'DEL'].includes(btn) ? 'bg-red-500/20 text-red-400' :
                                      ['+', '-', '*', '/', '^'].includes(btn) ? 'bg-slate-700 text-neon-blue' :
                                      'bg-slate-800 text-white hover:bg-slate-700'}
                                `}
                            >
                                {btn}
                            </button>
                        ))}
                    </React.Fragment>
                 ))}
             </div>
        </div>
      )}

      {/* --- MODE 2: ASSOCIATION SIMULATOR --- */}
      {mode === 'association' && (
        <div className="glass-panel p-8 rounded-2xl border-t border-neon-blue shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-neon-blue/10 rounded-xl text-neon-blue">
                <Users size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Simulador da Associação</h2>
                <p className="text-slate-400">Projete o crescimento da arrecadação mensal</p>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Associados</label>
                <input type="number" value={memberCount} onChange={(e) => setMemberCount(Number(e.target.value))} className="w-full pl-4 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-neon-blue focus:outline-none" />
                <input type="range" min="10" max="1000" value={memberCount} onChange={(e) => setMemberCount(Number(e.target.value))} className="w-full mt-2 accent-neon-blue" />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mensalidade (R$)</label>
                <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="w-full pl-4 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-neon-blue focus:outline-none" />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Adimplência (%)</label>
                <input type="number" min="0" max="100" value={paymentRate} onChange={(e) => setPaymentRate(Number(e.target.value))} className="w-full pl-4 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-neon-blue focus:outline-none" />
                </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm mb-1">Arrecadação Mensal (Real)</p>
                    <p className="text-3xl font-bold text-neon-green">R$ {associationProjection.realMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm mb-1">Potencial Total</p>
                    <p className="text-3xl font-bold text-white">R$ {associationProjection.theoreticalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center sm:col-span-2">
                    <p className="text-slate-400 text-sm mb-1">Projeção Anual</p>
                    <p className="text-4xl font-bold text-neon-purple bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-pink-500">
                    R$ {associationProjection.yearly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                {associationProjection.loss > 0 && (
                <div className="sm:col-span-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
                    <span className="text-red-400 text-sm font-medium">Perda estimada por inadimplência:</span>
                    <span className="text-red-400 font-bold">R$ {associationProjection.loss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</span>
                </div>
                )}
            </div>
            </div>
        </div>
      )}
    </div>
  );
};
