-- Schema do Sistema de Gestão Vida Nova 3.0

-- 1. Members
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    "joinedAt" TEXT,
    status TEXT NOT NULL,
    documents JSONB DEFAULT '[]'::jsonb
);

-- 2. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    "memberId" TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    method TEXT NOT NULL,
    "recordedBy" TEXT
);

-- 3. Transactions 
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    method TEXT NOT NULL,
    description TEXT
);

-- 4. Negotiations
CREATE TABLE IF NOT EXISTS public.negotiations (
    id TEXT PRIMARY KEY,
    "memberId" TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    "totalDebt" NUMERIC NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    negotiator TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    installments JSONB NOT NULL
);

-- 5. Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    "purchaseDate" TEXT,
    condition TEXT NOT NULL,
    location TEXT NOT NULL,
    ownership TEXT NOT NULL,
    "ownerName" TEXT,
    "acquisitionMode" TEXT NOT NULL,
    "acquiredBy" TEXT
);

-- 6. Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    "memberId" TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    area TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 7. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    "limit" NUMERIC NOT NULL,
    period TEXT NOT NULL
);

-- 8. Polls
CREATE TABLE IF NOT EXISTS public.polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "votedMembers" JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 9. Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    reply TEXT,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL,
    "user" TEXT NOT NULL
);

-- Configuração do Storage (Documentos)
-- Você também precisará criar um bucket chamado "association_data" no painel do Supabase -> Storage
-- E configurá-lo como "Public".

-- Políticas de RLS (Row Level Security) - Por segurança básica permitimos tudo (não recomendado para produção em larga escala sem Auth do usuário final)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL" ON public.members FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.negotiations FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.assets FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.reservations FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.budgets FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.polls FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow ALL" ON public.audit_logs FOR ALL USING (true);

-- 11. Attendances
CREATE TABLE IF NOT EXISTS public.attendances (
    id TEXT PRIMARY KEY,
    "memberId" TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    "recordedBy" TEXT
);

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ALL" ON public.attendances FOR ALL USING (true);
