
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, ShieldCheck, Smartphone, Wifi, Database, Check, List, Search, Trash2, AlertTriangle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { AuditLog, User } from '../types';

interface SystemToolsProps {
    onRestore: () => void;
    user: User | null;
}

export const SystemTools: React.FC<SystemToolsProps> = ({ onRestore, user }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isResetting, setIsResetting] = useState(false);

    const isFoxAdm = user?.role === 'FOX_ADM';

    const handleBackup = async () => {
        const json = await StorageService.createBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_vidanova_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMasterReset = async () => {
        if (!isFoxAdm) {
            alert("Acesso Negado: Somente o Fox ADM pode resetar o sistema.");
            return;
        }

        const confirm1 = confirm("⚠️ ATENÇÃO: Você está prestes a apagar TODOS os dados do sistema (Associados, Pagamentos, Acordos e Caixa).\n\nEsta ação é IRREVERSÍVEL. Deseja continuar?");
        if (!confirm1) return;

        const confirm2 = confirm("CONFIRMAÇÃO FINAL: Deseja realmente zerar o sistema para novos cadastros?");
        if (!confirm2) return;

        setIsResetting(true);
        try {
            await StorageService.logAction('DELETE', 'SYSTEM', 'RESET TOTAL DO SISTEMA EXECUTADO', user?.username || 'FOX_ADM');
            await StorageService.wipeAllData();
            alert("Sistema zerado com sucesso! A página será reiniciada.");
            window.location.reload();
        } catch (e) {
            alert("Erro ao zerar sistema.");
            setIsResetting(false);
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const content = evt.target?.result as string;
            if (confirm("ATENÇÃO: Restaurar um backup substituirá TODOS os dados atuais. Deseja continuar?")) {
                const success = await StorageService.restoreBackup(content);
                if (success) {
                    alert("Backup restaurado com sucesso! A página será recarregada.");
                    onRestore();
                    window.location.reload();
                } else {
                    alert("Erro ao restaurar backup. Arquivo inválido.");
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Database className="text-slate-400"/> Sistema e Segurança</h2>
                {isFoxAdm && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-neon-blue/10 rounded-full border border-neon-blue/20">
                        <ShieldCheck size={14} className="text-neon-blue" />
                        <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Modo Administrador Fox Ativo</span>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Backup Section */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Backup & Dados</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest leading-relaxed">
                        Exporte seus dados regularmente para garantir segurança extra.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleBackup} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest border border-slate-700 shadow-xl">
                            <Download size={18}/> Baixar JSON
                        </button>
                        <button onClick={handleRestoreClick} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest border border-slate-700">
                            <Upload size={18}/> Restaurar
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    </div>
                </div>

                {/* PWA Section */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Versão App</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest leading-relaxed">
                        Instale o Vida Nova na sua tela inicial.
                    </p>
                    <ul className="space-y-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Modo Offline</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Ícone na Tela Inicial</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Interface Imersiva</li>
                    </ul>
                </div>

                {/* Danger Zone Section */}
                <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Zona de Perigo</h3>
                    </div>
                    <p className="text-xs text-red-400 mb-6 font-bold uppercase tracking-widest leading-relaxed">
                        Cuidado: Ações irreversíveis que afetam todo o sistema.
                    </p>
                    {isFoxAdm ? (
                        <button 
                            disabled={isResetting}
                            onClick={handleMasterReset}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20"
                        >
                            <Trash2 size={18}/> {isResetting ? 'Reiniciando...' : 'Zerar Todo o Sistema'}
                        </button>
                    ) : (
                        <div className="p-4 bg-red-950/20 rounded-xl border border-red-500/20 text-center">
                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">Acesso restrito apenas ao FOX ADM para zerar o banco de dados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
