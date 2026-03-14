
export enum PaymentMethod {
  PIX = 'Pix',
  CASH = 'Dinheiro',
  CARD = 'Cartão'
}

export enum MemberStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo'
}

export interface MemberDocument {
  id: string;
  name: string;
  type: string;
  base64: string; // Caution: LocalStorage size limit
  uploadedAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  month: number; // 0-11
  year: number;
  amount: number;
  date: string; // ISO String
  method: PaymentMethod;
  recordedBy: string; // Audit
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
  status: MemberStatus;
  documents?: MemberDocument[];
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  method: PaymentMethod; // Novo campo obrigatório
  description?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  active: boolean;
  totalVotes: number;
  votedMembers: string[]; // IDs of members who voted
}

export interface User {
  id: string;
  username: string;
  role: 'FOX_ADM' | 'PRESIDENTE' | 'TESOUREIRO';
  subtitle?: string;
  avatar?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  purchaseDate: string;
  condition: 'Novo' | 'Bom' | 'Ruim' | 'Manutenção';
  location: string;
  ownership: 'Associação Habitacional Vida Nova' | 'Associação Renascer' | 'Bem Particular';
  ownerName?: string;
  acquisitionMode: 'Compra Direta' | 'Doação' | 'Pago por Terceiro';
  acquiredBy?: string; // Nome de quem doou ou pagou
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'RESTORE';
  entity: 'MEMBER' | 'PAYMENT' | 'TRANSACTION' | 'ASSET' | 'SYSTEM' | 'MESSAGE' | 'NEGOTIATION' | 'RESERVATION';
  details: string;
  timestamp: string;
  user: string;
}

export interface MemberMessage {
  id: string;
  memberId: string;
  memberName: string;
  type: 'Sugestão' | 'Dúvida' | 'Reclamação' | 'Outros';
  text: string;
  reply?: string;
  date: string;
  status: 'pending' | 'read' | 'resolved';
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate?: string; // Data real de quando foi marcado como pago
}

export interface Negotiation {
  id: string;
  memberId: string; // Revertido para memberId
  totalDebt: number;
  installmentsCount: number;
  negotiator: 'Edinaldo' | 'Celma';
  createdAt: string;
  installments: Installment[];
}

// Added missing Reservation interface to satisfy components/Reservations.tsx
export interface Reservation {
  id: string;
  memberId: string;
  date: string;
  area: 'Salao' | 'Churrasqueira';
  status: 'confirmed' | 'pending' | 'cancelled';
}

/**
 * Added Budget interface to fix import error in components/Budgeting.tsx
 */
export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}
