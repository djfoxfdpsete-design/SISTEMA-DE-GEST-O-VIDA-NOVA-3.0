
import { supabase } from '../lib/supabase';
import { Member, Payment, Transaction, Poll, Asset, MemberMessage, AuditLog, Negotiation, MemberDocument, Reservation, Budget } from '../types';

const STORAGE_KEYS = {
  members: 'vn_members',
  payments: 'vn_payments',
  transactions: 'vn_transactions',
  assets: 'vn_assets',
  polls: 'vn_polls',
  messages: 'vn_messages',
  audit_logs: 'vn_audit_logs',
  negotiations: 'vn_negotiations',
  reservations: 'vn_reservations',
  budgets: 'vn_budgets',
  last_backup: 'vn_last_backup'
};

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveLocal = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  getLastBackupDate: (): string | null => localStorage.getItem(STORAGE_KEYS.last_backup),
  setLastBackupDate: (date: string) => localStorage.setItem(STORAGE_KEYS.last_backup, date),

  // Documentos via Supabase Storage
  uploadDocument: async (memberId: string, file: File): Promise<MemberDocument | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}/${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('association_data')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('association_data')
        .getPublicUrl(filePath);

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        base64: publicUrl,
        uploadedAt: new Date().toISOString()
      };
    } catch (e) {
      console.warn("Modo Offline: Upload via Supabase indisponível.");
      return null;
    }
  },

  // Membros
  getMembers: async (): Promise<Member[]> => {
    try {
      const { data, error } = await supabase.from('members').select('*').order('name');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.members, data);
      return data || [];
    } catch (e) {
      return getLocal<Member>(STORAGE_KEYS.members);
    }
  },
  saveMember: async (member: Member) => {
    const local = getLocal<Member>(STORAGE_KEYS.members);
    const updated = [...local.filter(m => m.id !== member.id), member];
    saveLocal(STORAGE_KEYS.members, updated);
    try { await supabase.from('members').upsert(member); } catch (e) {}
  },
  deleteMember: async (id: string) => {
    const local = getLocal<Member>(STORAGE_KEYS.members);
    saveLocal(STORAGE_KEYS.members, local.filter(m => m.id !== id));
    try { await supabase.from('members').delete().eq('id', id); } catch (e) {}
  },
  deleteMembers: async (ids: string[]) => {
    const local = getLocal<Member>(STORAGE_KEYS.members);
    saveLocal(STORAGE_KEYS.members, local.filter(m => !ids.includes(m.id)));
    
    try {
      // Excluir em lotes de 100 para evitar limites de URL/Payload
      const chunkSize = 100;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        await supabase.from('members').delete().in('id', chunk);
      }
    } catch (e) {
      console.error("Erro na exclusão em massa:", e);
    }
  },
  importData: async (members: Member[]) => {
    const local = getLocal<Member>(STORAGE_KEYS.members);
    const combined = [...local, ...members];
    saveLocal(STORAGE_KEYS.members, combined);
    try { await supabase.from('members').upsert(members); } catch (e) {}
  },

  // Pagamentos
  getPayments: async (): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase.from('payments').select('*');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.payments, data);
      return data || [];
    } catch (e) {
      return getLocal<Payment>(STORAGE_KEYS.payments);
    }
  },
  savePayment: async (payment: Payment) => {
    const local = getLocal<Payment>(STORAGE_KEYS.payments);
    saveLocal(STORAGE_KEYS.payments, [...local, payment]);
    try { await supabase.from('payments').insert(payment); } catch (e) {}
  },
  removePayment: async (memberId: string, month: number, year: number) => {
    const local = getLocal<Payment>(STORAGE_KEYS.payments);
    const updated = local.filter(p => !(p.memberId === memberId && p.month === month && p.year === year));
    saveLocal(STORAGE_KEYS.payments, updated);
    try { await supabase.from('payments').delete().match({ memberId, month, year }); } catch (e) {}
  },

  // Caixa (Transações)
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.transactions, data);
      return data || [];
    } catch (e) {
      return getLocal<Transaction>(STORAGE_KEYS.transactions);
    }
  },
  saveTransaction: async (transaction: Transaction) => {
    const local = getLocal<Transaction>(STORAGE_KEYS.transactions);
    const updated = [...local.filter(t => t.id !== transaction.id), transaction];
    saveLocal(STORAGE_KEYS.transactions, updated);
    try { await supabase.from('transactions').upsert(transaction); } catch (e) {}
  },
  deleteTransaction: async (id: string) => {
    const local = getLocal<Transaction>(STORAGE_KEYS.transactions);
    saveLocal(STORAGE_KEYS.transactions, local.filter(t => t.id !== id));
    try { await supabase.from('transactions').delete().eq('id', id); } catch (e) {}
  },

  // Orçamentos
  getBudgets: async (): Promise<Budget[]> => {
    try {
      const { data, error } = await supabase.from('budgets').select('*');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.budgets, data);
      return data || [];
    } catch (e) {
      return getLocal<Budget>(STORAGE_KEYS.budgets);
    }
  },
  saveBudget: async (budget: Budget) => {
    const local = getLocal<Budget>(STORAGE_KEYS.budgets);
    const updated = [...local.filter(b => b.id !== budget.id), budget];
    saveLocal(STORAGE_KEYS.budgets, updated);
    try { await supabase.from('budgets').upsert(budget); } catch (e) {}
  },

  // Reservas
  getReservations: async (): Promise<Reservation[]> => {
    try {
      const { data, error } = await supabase.from('reservations').select('*').order('date');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.reservations, data);
      return data || [];
    } catch (e) {
      return getLocal<Reservation>(STORAGE_KEYS.reservations);
    }
  },
  saveReservation: async (res: Reservation) => {
    const local = getLocal<Reservation>(STORAGE_KEYS.reservations);
    const updated = [...local.filter(r => r.id !== res.id), res];
    saveLocal(STORAGE_KEYS.reservations, updated);
    try { await supabase.from('reservations').upsert(res); } catch (e) {}
  },
  deleteReservation: async (id: string) => {
    const local = getLocal<Reservation>(STORAGE_KEYS.reservations);
    saveLocal(STORAGE_KEYS.reservations, local.filter(r => r.id !== id));
    try { await supabase.from('reservations').delete().eq('id', id); } catch (e) {}
  },

  // Patrimônio (Assets)
  getAssets: async (): Promise<Asset[]> => {
    try {
      const { data, error } = await supabase.from('assets').select('*').order('name');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.assets, data);
      return data || [];
    } catch (e) {
      return getLocal<Asset>(STORAGE_KEYS.assets);
    }
  },
  saveAsset: async (asset: Asset) => {
    const local = getLocal<Asset>(STORAGE_KEYS.assets);
    const updated = [...local.filter(a => a.id !== asset.id), asset];
    saveLocal(STORAGE_KEYS.assets, updated);
    try { await supabase.from('assets').upsert(asset); } catch (e) {}
  },
  deleteAsset: async (id: string) => {
    const local = getLocal<Asset>(STORAGE_KEYS.assets);
    saveLocal(STORAGE_KEYS.assets, local.filter(a => a.id !== id));
    try { await supabase.from('assets').delete().eq('id', id); } catch (e) {}
  },

  // Negociações (Negotiations)
  getNegotiations: async (): Promise<Negotiation[]> => {
    try {
      const { data, error } = await supabase.from('negotiations').select('*');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.negotiations, data);
      return data || [];
    } catch (e) {
      return getLocal<Negotiation>(STORAGE_KEYS.negotiations);
    }
  },
  saveNegotiation: async (neg: Negotiation) => {
    const local = getLocal<Negotiation>(STORAGE_KEYS.negotiations);
    const updated = [...local.filter(n => n.id !== neg.id), neg];
    saveLocal(STORAGE_KEYS.negotiations, updated);
    try { await supabase.from('negotiations').upsert(neg); } catch (e) {}
  },
  deleteNegotiation: async (id: string) => {
    const local = getLocal<Negotiation>(STORAGE_KEYS.negotiations);
    saveLocal(STORAGE_KEYS.negotiations, local.filter(n => n.id !== id));
    try { await supabase.from('negotiations').delete().eq('id', id); } catch (e) {}
  },

  // Enquetes (Polls)
  getPolls: async (): Promise<Poll[]> => {
    try {
      const { data, error } = await supabase.from('polls').select('*');
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.polls, data);
      return data || [];
    } catch (e) {
      return getLocal<Poll>(STORAGE_KEYS.polls);
    }
  },
  savePoll: async (poll: Poll) => {
    const local = getLocal<Poll>(STORAGE_KEYS.polls);
    const updated = [...local.filter(p => p.id !== poll.id), poll];
    saveLocal(STORAGE_KEYS.polls, updated);
    try { await supabase.from('polls').upsert(poll); } catch (e) {}
  },

  // Mensagens/Ouvidoria (Messages)
  getMessages: async (): Promise<MemberMessage[]> => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('date', { ascending: false });
      if (error) throw error;
      if (data) saveLocal(STORAGE_KEYS.messages, data);
      return data || [];
    } catch (e) {
      return getLocal<MemberMessage>(STORAGE_KEYS.messages);
    }
  },
  saveMessage: async (msg: MemberMessage) => {
    const local = getLocal<MemberMessage>(STORAGE_KEYS.messages);
    const updated = [...local.filter(m => m.id !== msg.id), msg];
    saveLocal(STORAGE_KEYS.messages, updated);
    try { await supabase.from('messages').upsert(msg); } catch (e) {}
  },

  // Auditoria (Audit Logs)
  logAction: async (action: AuditLog['action'], entity: AuditLog['entity'], details: string, user: string) => {
    const newLog = { 
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action, 
      entity, 
      details, 
      timestamp: new Date().toISOString(), 
      user 
    };
    const local = getLocal<AuditLog>(STORAGE_KEYS.audit_logs);
    saveLocal(STORAGE_KEYS.audit_logs, [newLog, ...local].slice(0, 500));
    try { await supabase.from('audit_logs').insert(newLog); } catch (e) {}
  },

  // Gestão Global de Dados
  wipeAllData: async (): Promise<void> => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    try {
      await Promise.allSettled([
        supabase.from('payments').delete().neq('id', '0'),
        supabase.from('negotiations').delete().neq('id', '0'),
        supabase.from('transactions').delete().neq('id', '0'),
        supabase.from('messages').delete().neq('id', '0'),
        supabase.from('members').delete().neq('id', '0'),
        supabase.from('assets').delete().neq('id', '0'),
        supabase.from('polls').delete().neq('id', '0'),
        supabase.from('audit_logs').delete().neq('id', '0'),
        supabase.from('reservations').delete().neq('id', '0'),
        supabase.from('budgets').delete().neq('id', '0'),
      ]);
    } catch (e) {}
  },

  createBackup: async () => {
    const data = {
      members: getLocal(STORAGE_KEYS.members),
      payments: getLocal(STORAGE_KEYS.payments),
      transactions: getLocal(STORAGE_KEYS.transactions),
      assets: getLocal(STORAGE_KEYS.assets),
      polls: getLocal(STORAGE_KEYS.polls),
      messages: getLocal(STORAGE_KEYS.messages),
      negotiations: getLocal(STORAGE_KEYS.negotiations),
      reservations: getLocal(STORAGE_KEYS.reservations),
      budgets: getLocal(STORAGE_KEYS.budgets),
      audit_logs: getLocal(STORAGE_KEYS.audit_logs),
      timestamp: new Date().toISOString(),
      version: "3.1"
    };
    StorageService.setLastBackupDate(data.timestamp);
    return JSON.stringify(data, null, 2);
  },

  restoreBackup: async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object') return false;
      
      localStorage.clear();
      if (data.members) saveLocal(STORAGE_KEYS.members, data.members);
      if (data.payments) saveLocal(STORAGE_KEYS.payments, data.payments);
      if (data.transactions) saveLocal(STORAGE_KEYS.transactions, data.transactions);
      if (data.negotiations) saveLocal(STORAGE_KEYS.negotiations, data.negotiations);
      if (data.assets) saveLocal(STORAGE_KEYS.assets, data.assets);
      if (data.polls) saveLocal(STORAGE_KEYS.polls, data.polls);
      if (data.messages) saveLocal(STORAGE_KEYS.messages, data.messages);
      if (data.reservations) saveLocal(STORAGE_KEYS.reservations, data.reservations);
      if (data.budgets) saveLocal(STORAGE_KEYS.budgets, data.budgets);
      if (data.audit_logs) saveLocal(STORAGE_KEYS.audit_logs, data.audit_logs);
      
      const syncPromises = [];
      if (data.members) syncPromises.push(supabase.from('members').upsert(data.members));
      if (data.payments) syncPromises.push(supabase.from('payments').upsert(data.payments));
      if (data.transactions) syncPromises.push(supabase.from('transactions').upsert(data.transactions));
      if (data.negotiations) syncPromises.push(supabase.from('negotiations').upsert(data.negotiations));
      if (data.assets) syncPromises.push(supabase.from('assets').upsert(data.assets));
      if (data.budgets) syncPromises.push(supabase.from('budgets').upsert(data.budgets));
      
      await Promise.allSettled(syncPromises);
      return true;
    } catch (e) {
      return false;
    }
  }
};
