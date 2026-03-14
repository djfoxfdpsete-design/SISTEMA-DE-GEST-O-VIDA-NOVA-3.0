
import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Lock, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Member, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onMemberLogin: (member: Member) => void;
}

const ADMIN_PROFILES: User[] = [
    { id: '1', username: 'Fox ADM', role: 'FOX_ADM', subtitle: 'Ouvidor / Administrador' },
    { id: '2', username: 'Adilson Presidente', role: 'PRESIDENTE' },
    { id: '3', username: 'Edinaldo Tesoureiro', role: 'TESOUREIRO' },
    { id: '4', username: 'Celma Social', role: 'TESOUREIRO', subtitle: 'Assistente social' },
];

export const Login: React.FC<LoginProps> = ({ onLogin, onMemberLogin }) => {
  const [mode, setMode] = useState<'admin' | 'member'>('admin');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) {
      setError('Selecione um perfil de administrador.');
      return;
    }

    // Definição de senhas conforme solicitado
    let correctPassword = '1234'; // Senha padrão para outros
    
    if (selectedAdmin.username === 'Fox ADM') {
      correctPassword = '162534';
    } else if (selectedAdmin.username === 'Edinaldo Tesoureiro') {
      correctPassword = '162534edinaldo';
    }

    if (password === correctPassword) {
      onLogin(selectedAdmin);
    } else {
      setError('Senha incorreta para este perfil.');
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const members = await StorageService.getMembers();
    const cleanPhone = phone.replace(/\D/g, '');
    
    const member = members.find((m: Member) => {
        const mPhone = m.phone.replace(/\D/g, '');
        return mPhone.includes(cleanPhone) && cleanPhone.length > 4;
    });

    if (member) {
        onMemberLogin(member);
    } else {
        setError('Associado não encontrado. Verifique seu telefone.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-8 z-10 relative">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-neon-blue/20">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Associação Vida Nova</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Sistema de Gestão Financeira WFOX</p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
            <button 
                onClick={() => { setMode('admin'); setError(''); setSelectedAdmin(null); setPassword(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'admin' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-600 hover:text-white'}`}
            >
                Administração
            </button>
            <button 
                onClick={() => { setMode('member'); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'member' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-600 hover:text-white'}`}
            >
                Sou Associado
            </button>
        </div>

        {mode === 'admin' ? (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                {!selectedAdmin ? (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Escolha sua credencial:</p>
                        {ADMIN_PROFILES.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => { setSelectedAdmin(profile); setError(''); }}
                                className="w-full flex items-center justify-between p-5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-neon-blue/50 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue group-hover:text-slate-950 transition-all">
                                        <UserIcon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white text-sm">{profile.username}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">
                                            {profile.subtitle || profile.role.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-slate-700 group-hover:text-neon-blue transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleAdminSubmit} className="space-y-6 animate-in zoom-in-95 duration-300">
                        <button 
                            type="button" 
                            onClick={() => { setSelectedAdmin(null); setPassword(''); setError(''); }}
                            className="text-[10px] font-black text-neon-blue hover:text-white uppercase tracking-widest flex items-center gap-2 mb-4"
                        >
                            ← Alterar Perfil
                        </button>
                        <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credencial Ativa</p>
                                <p className="font-black text-white text-lg">{selectedAdmin.username}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                <input
                                    autoFocus
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-neon-blue focus:outline-none transition-all font-mono"
                                    placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-red-400 text-[11px] font-bold mt-3 bg-red-400/10 p-2 rounded-lg border border-red-400/20 text-center">{error}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-neon-blue to-cyan-500 text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-2xl shadow-cyan-500/20 transition-all active:scale-95"
                        >
                            Autenticar no Sistema
                        </button>
                    </form>
                )}
            </div>
        ) : (
            <form onSubmit={handleMemberSubmit} className="space-y-6 animate-in slide-in-from-left-10 duration-500">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Telefone de Cadastro</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-neon-purple focus:outline-none transition-all font-mono"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    {error && <p className="text-red-400 text-[11px] font-bold mt-3 bg-red-400/10 p-2 rounded-lg border border-red-400/20 text-center">{error}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-neon-purple to-pink-500 text-white font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-2xl shadow-purple-500/20 active:scale-95"
                >
                    Acessar Portal do Associado
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">Acesse para ver seus recibos, histórico de pagamentos e votar em assembleias digitais.</p>
            </form>
        )}
        
        <div className="text-center mt-12 pt-8 border-t border-slate-800/50">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">WFOX SOLUÇÕES INTELIGENTES © 2026</p>
        </div>
      </div>
    </div>
  );
};
