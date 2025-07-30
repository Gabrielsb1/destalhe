-- Script para corrigir políticas RLS da tabela metas
-- Considerando que o sistema usa autenticação customizada
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar políticas atuais
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'metas';

-- 2. Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON metas;
DROP POLICY IF EXISTS "Permitir inserção apenas para admins" ON metas;
DROP POLICY IF EXISTS "Permitir atualização apenas para admins" ON metas;

-- 3. Criar políticas mais permissivas para o sistema customizado
-- Política para leitura (SELECT)
CREATE POLICY "Permitir leitura de metas" ON metas
    FOR SELECT
    USING (true);

-- Política para inserção (INSERT)
CREATE POLICY "Permitir inserção de metas" ON metas
    FOR INSERT
    WITH CHECK (true);

-- Política para atualização (UPDATE)
CREATE POLICY "Permitir atualização de metas" ON metas
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Política para exclusão (DELETE)
CREATE POLICY "Permitir exclusão de metas" ON metas
    FOR DELETE
    USING (true);

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'metas';

-- 5. Se RLS estiver desabilitado, habilitar
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'metas';

-- 7. Testar inserção
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-29', 80)
RETURNING *;

-- 8. Verificar se a inserção funcionou
SELECT * FROM metas WHERE data_meta = '2025-07-29';

-- 9. Mostrar todas as metas
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY data_meta DESC; 