-- 🔧 CORREÇÃO TEMPORÁRIA PARA RLS
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para teste
ALTER TABLE protocolos DISABLE ROW LEVEL SECURITY;

-- 2. Ou, se preferir manter RLS, criar uma política que permita acesso total
-- (Execute apenas um dos comandos acima ou abaixo)

-- ALTERNATIVA: Criar política que permite acesso total
-- CREATE POLICY "Permitir acesso total temporariamente" ON protocolos
-- FOR ALL USING (true);

-- 3. Verificar se funcionou
SELECT COUNT(*) FROM protocolos;

-- 4. Para reverter depois (quando o sistema estiver funcionando):
-- ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Permitir acesso total temporariamente" ON protocolos; 