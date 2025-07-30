-- Script para corrigir políticas RLS da tabela metas
-- Execute este código no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para testes
ALTER TABLE metas DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'metas';

-- 3. Testar inserção sem RLS
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-29', 80)
RETURNING *;

-- 4. Verificar se a inserção funcionou
SELECT * FROM metas WHERE data_meta = '2025-07-29';

-- 5. Se funcionou, vamos criar políticas RLS adequadas
-- Primeiro, remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso total às metas" ON metas;
DROP POLICY IF EXISTS "Metas policy" ON metas;

-- 6. Criar política para permitir acesso total (temporário)
CREATE POLICY "Permitir acesso total às metas" ON metas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. Habilitar RLS novamente
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'metas';

-- 9. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'metas';

-- 10. Testar inserção com RLS habilitado
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-30', 90)
RETURNING *;

-- 11. Verificar todas as metas
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY data_meta DESC; 