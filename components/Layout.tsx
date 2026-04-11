
import React from 'react';
import { Home, Users, CreditCard, Calculator, LogOut, Menu, X, FileText, Bell, AlertTriangle, Wallet, Calendar, Vote, Settings, Check, Loader2, Box, PieChart, MessageSquare, Wifi, WifiOff, Handshake, BarChart3, Target, ClipboardCheck } from 'lucide-react';
import { Member, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  overdueMembers: { member: Member; months: number }[];
  saveStatus: 'saved' | 'saving';
  user: User | null;
  isOnline: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, overdueMembers, saveStatus, user, isOnline }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Definição dos itens do menu e permissões (roles)
  const menuItems = [
    { id: 'infographics', label: 'Infográficos', icon: BarChart3, roles: ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'], tooltip: 'Análise visual profunda de dados, tendências e comparativos.' },
    { id: 'members', label: 'Associados & Docs', icon: Users, roles: ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'], tooltip: 'Gestão de cadastro de membros e documentos.' },
    { id: 'attendance', label: 'Controle de Presença', icon: ClipboardCheck, roles: ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'], tooltip: 'Controle de presenças e faltas em reuniões.' },
    { id: 'payments', label: 'Mensalidades', icon: CreditCard, roles: ['FOX_ADM', 'TESOUREIRO', 'PRESIDENTE'], tooltip: 'Controle de pagamentos mensais e geração de recibos.' },
    { id: 'negotiations', label: 'Negociação Parceladas', icon: Handshake, roles: ['FOX_ADM', 'TESOUREIRO', 'PRESIDENTE'], color: 'text-pink-500', tooltip: 'Criação e acompanhamento de acordos de dívidas.' },
    { id: 'system', label: 'Sistema / Backup', icon: Settings, roles: ['FOX_ADM', 'PRESIDENTE', 'TESOUREIRO'], tooltip: 'Configurações do sistema, logs de auditoria e backup de dados.' },
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-blue to-neon-purple mr-3"></div>
          <h1 className="text-xl font-bold text-white">Vida Nova</h1>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isNegotiation = item.id === 'negotiations';
            const isInfographics = item.id === 'infographics';
            
            return (
              <button
                key={item.id}
                title={item.tooltip}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id 
                    ? (isNegotiation ? 'bg-pink-500/20 text-pink-500 border-l-2 border-pink-500' : 
                       isInfographics ? 'bg-amber-500/20 text-amber-500 border-l-2 border-amber-500' :
                       'bg-neon-blue/20 text-neon-blue border-l-2 border-neon-blue') 
                    : (isNegotiation ? 'text-pink-400/70 hover:text-pink-400 hover:bg-pink-500/10' : 
                       isInfographics ? 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10' :
                       'text-slate-400 hover:text-white hover:bg-slate-800')
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-950">
          <button 
            onClick={onLogout} 
            title="Encerrar sessão e voltar para a tela de login."
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-30">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 mr-4"><Menu size={24} /></button>
            <h2 className={`text-lg font-bold ${
                activeTab === 'negotiations' ? 'text-pink-500' : 
                activeTab === 'infographics' ? 'text-amber-500' :
                'text-white'
            }`}>
                {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div 
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${isOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'}`}
            >
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>}
              {isOnline ? 'Online' : 'Offline'}
            </div>

            <div 
              className="hidden md:flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700"
            >
              {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin text-neon-blue"/> : <Check size={12} className="text-emerald-500"/>}
              {saveStatus === 'saving' ? 'Sincronizando' : 'Nuvem Atualizada'}
            </div>

            <div className="h-10 flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.username}</p>
                <p className="text-[10px] text-neon-blue uppercase mt-1 tracking-wider">
                  {user?.subtitle || user?.role}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${user?.role === 'FOX_ADM' ? 'bg-neon-blue/10 border-neon-blue text-neon-blue' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {user?.username.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
          <footer className="mt-12 py-8 text-center opacity-40">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WFOX SOLUÇÕES INTELIGENTES © 2026</p>
          </footer>
        </div>
      </main>
    </div>
  );
};
