
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Infographics } from './components/Infographics';
import { Members } from './components/Members';
import { Payments } from './components/Payments';
import { CashFlow } from './components/CashFlow';
import { Calculator } from './components/Calculator';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { Polls } from './components/Polls';
import { SystemTools } from './components/SystemTools';
import { Assets } from './components/Assets';
import { Ombudsman } from './components/Ombudsman';
import { Negotiations } from './components/Negotiations';
import { Reservations } from './components/Reservations';
import { Budgeting } from './components/Budgeting';
import { MemberPortal } from './components/MemberPortal';
import { StorageService } from './services/storageService';
import { Member, Payment, PaymentMethod, Transaction, Poll, Asset, MemberMessage, User, Negotiation, Reservation, Budget } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const [authMode, setAuthMode] = useState<'guest' | 'admin' | 'member'>('guest');
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [messages, setMessages] = useState<MemberMessage[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const [m, p, t, po, a, msg, neg, res, b] = await Promise.all([
        StorageService.getMembers(),
        StorageService.getPayments(),
        StorageService.getTransactions(),
        StorageService.getPolls(),
        StorageService.getAssets(),
        StorageService.getMessages(),
        StorageService.getNegotiations(),
        StorageService.getReservations(),
        StorageService.getBudgets()
      ]);

      setMembers(m);
      setPayments(p);
      setTransactions(t);
      setPolls(po);
      setAssets(a);
      setMessages(msg);
      setNegotiations(neg);
      setReservations(res);
      setBudgets(b);
    } catch (err) {
      console.warn("Erro ao buscar dados remotos, usando cache local.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData]);

  const commit = async (action: () => Promise<void>, logDetails?: { action: any, entity: any, details: string }) => {
    setSaveStatus('saving');
    try {
        await action();
        if (logDetails) {
          await StorageService.logAction(logDetails.action, logDetails.entity, logDetails.details, currentAdmin?.username || currentMember?.name || 'System');
        }
        await refreshData();
        setSaveStatus('saved');
    } catch (e) {
        setSaveStatus('saved');
        await refreshData();
    }
  };

  const handleMemberSave = (member: Member) => commit(() => StorageService.saveMember(member), { action: 'UPDATE', entity: 'MEMBER', details: `Associado: ${member.name}` });
  const handleMemberDelete = (id: string) => commit(() => StorageService.deleteMember(id), { action: 'DELETE', entity: 'MEMBER', details: `Removido ID: ${id}` });
  const handleMemberImport = (importedMembers: Member[]) => commit(() => StorageService.importData(importedMembers), { action: 'CREATE', entity: 'MEMBER', details: `Importação: ${importedMembers.length} membros` });
  
  const handlePaymentToggle = (memberId: string, month: number, year: number, method: PaymentMethod) => {
    const payment: Payment = {
      id: `pay-${memberId}-${month}-${year}-${Date.now()}`,
      memberId,
      month,
      year,
      amount: 40.00,
      date: new Date().toISOString(),
      method,
      recordedBy: currentAdmin?.username || 'admin'
    };
    commit(() => StorageService.savePayment(payment), { action: 'CREATE', entity: 'PAYMENT', details: `Pagamento ${month+1}/${year}` });
  };
  
  const handlePaymentRemove = (memberId: string, month: number, year: number) => commit(() => StorageService.removePayment(memberId, month, year), { action: 'DELETE', entity: 'PAYMENT', details: `Estorno ${month+1}/${year}` });
  
  const handleTransactionSave = (transaction: Transaction) => commit(() => StorageService.saveTransaction(transaction), { action: 'UPDATE', entity: 'TRANSACTION', details: `Caixa: ${transaction.title}` });
  const handleTransactionDelete = (id: string) => commit(() => StorageService.deleteTransaction(id), { action: 'DELETE', entity: 'TRANSACTION', details: `Exclusão caixa ID: ${id}` });
  
  const handlePollSave = (poll: Poll) => commit(() => StorageService.savePoll(poll));
  const handleAssetSave = (asset: Asset) => commit(() => StorageService.saveAsset(asset), { action: 'UPDATE', entity: 'ASSET', details: `Patrimônio: ${asset.name}` });
  const handleAssetDelete = (id: string) => commit(() => StorageService.deleteAsset(id), { action: 'DELETE', entity: 'ASSET', details: `Removido Ativo ID: ${id}` });
  const handleMessageSave = (msg: MemberMessage) => commit(() => StorageService.saveMessage(msg), { action: 'CREATE', entity: 'MESSAGE', details: `Ouvidoria: Mensagem enviada` });
  const handleMessageResolve = (msgId: string, reply: string) => {
      const msg = messages.find(m => m.id === msgId);
      if (msg) commit(() => StorageService.saveMessage({ ...msg, status: 'resolved', reply }), { action: 'UPDATE', entity: 'MESSAGE', details: `Ouvidoria: Resposta enviada` });
  };
  const handleNegotiationSave = (negotiation: Negotiation) => commit(() => StorageService.saveNegotiation(negotiation), { action: 'UPDATE', entity: 'NEGOTIATION', details: `Acordo: ${negotiation.id}` });
  const handleNegotiationDelete = (id: string) => commit(() => StorageService.deleteNegotiation(id), { action: 'DELETE', entity: 'NEGOTIATION', details: `Acordo removido ID: ${id}` });

  const handleReservationSave = (res: Reservation) => commit(() => StorageService.saveReservation(res), { action: 'CREATE', entity: 'RESERVATION', details: `Reserva em ${res.date}` });
  const handleReservationDelete = (id: string) => commit(() => StorageService.deleteReservation(id), { action: 'DELETE', entity: 'RESERVATION', details: `Reserva cancelada ID: ${id}` });
  const handleBudgetSave = (budget: Budget) => commit(() => StorageService.saveBudget(budget));

  const handleVote = (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !currentMember || poll.votedMembers.includes(currentMember.id)) return;

    const updatedPoll = {
      ...poll,
      totalVotes: poll.totalVotes + 1,
      votedMembers: [...poll.votedMembers, currentMember.id],
      options: poll.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)
    };
    commit(() => StorageService.savePoll(updatedPoll));
  };

  const handleLogout = () => {
      setAuthMode('guest');
      setCurrentMember(null);
      setCurrentAdmin(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-neon-blue animate-spin" size={48} />
        <p className="text-white font-black uppercase tracking-widest text-[10px]">Sincronizando Vida Nova...</p>
      </div>
    );
  }

  if (authMode === 'guest') {
    return <Login onLogin={(u) => { setCurrentAdmin(u); setAuthMode('admin'); }} onMemberLogin={(m) => { setCurrentMember(m); setAuthMode('member'); }} />;
  }

  if (authMode === 'member' && currentMember) {
      return <MemberPortal member={currentMember} payments={payments} messages={messages} polls={polls} onSendMessage={handleMessageSave} onVote={handleVote} onLogout={handleLogout} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard members={members} payments={payments} transactions={transactions} negotiations={negotiations} />;
      case 'infographics': return <Infographics members={members} payments={payments} transactions={transactions} />;
      case 'members': return <Members members={members} onSave={handleMemberSave} onImport={handleMemberImport} onDelete={handleMemberDelete} />;
      case 'payments': return <Payments members={members} payments={payments} user={currentAdmin} onTogglePayment={handlePaymentToggle} onRemovePayment={handlePaymentRemove} />;
      case 'negotiations': return <Negotiations negotiations={negotiations} members={members} onSave={handleNegotiationSave} onDelete={handleNegotiationDelete} user={currentAdmin} />;
      case 'reservations': return <Reservations reservations={reservations} members={members} onSave={handleReservationSave} onDelete={handleReservationDelete} />;
      case 'cashflow': return <CashFlow transactions={transactions} onSave={handleTransactionSave} onDelete={handleTransactionDelete} user={currentAdmin} />;
      case 'assets': return <Assets assets={assets} onSave={handleAssetSave} onDelete={handleAssetDelete} user={currentAdmin} />;
      case 'budgets': return <Budgeting budgets={budgets} transactions={transactions} onSave={handleBudgetSave} />;
      case 'polls': return <Polls polls={polls} onSave={handlePollSave} />;
      case 'reports': return <Reports members={members} payments={payments} transactions={transactions} />;
      case 'ombudsman': return <Ombudsman messages={messages} onResolve={handleMessageResolve} />;
      case 'calculator': return <Calculator />;
      case 'system': return <SystemTools onRestore={refreshData} user={currentAdmin} />;
      default: return <Dashboard members={members} payments={payments} transactions={transactions} negotiations={negotiations} />;
    }
  };

  return (
    <HashRouter>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} overdueMembers={[]} saveStatus={saveStatus} user={currentAdmin} isOnline={isOnline}>
        {renderContent()}
      </Layout>
    </HashRouter>
  );
}

export default App;
