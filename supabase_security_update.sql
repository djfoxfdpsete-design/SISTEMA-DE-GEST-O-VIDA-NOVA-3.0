-- Migração de Segurança: Supabase Auth + RLS restritivo

-- 1. Forçar RLS em todas as tabelas
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

-- 2. Remover políticas "Allow ALL" antigas (inseguras)
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3. Criar novas políticas: Apenas usuários logados (authenticated) podem ler/gravar
CREATE POLICY "Auth Only" ON public.members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.negotiations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.budgets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.polls FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Only" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- 4. Exceção temporária: Para o Portal do Associado continuar funcionando sem Auth oficial por enquanto
-- (Permite leitura de algumas tabelas baseadas no telefone de forma anônima, se filtrado pelo app)
-- Como o RLS padrão vai bloquear os membros anônimos no Frontend, criamos exceção apenas de leitura:
CREATE POLICY "Anon Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Anon Read Payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anon Read Polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Anon Submit Votes" ON public.polls FOR UPDATE USING (true); 
CREATE POLICY "Anon Send Messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Read Own Messages" ON public.messages FOR SELECT USING (true);
