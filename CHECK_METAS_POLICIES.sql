-- Script para verificar políticas RLS da tabela metas
-- Execute este código no SQL Editor do Supabase

-- Verificar se a tabela metas existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'metas';

-- Verificar estrutura da tabela metas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'metas'
ORDER BY ordinal_position;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'metas';

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'metas';

-- Verificar constraints da tabela
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'metas';

-- Testar inserção direta (para verificar se há problemas de RLS)
-- Descomente as linhas abaixo para testar

/*
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-29', 80)
RETURNING *;
*/

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_metas FROM metas;

-- Mostrar últimas metas (se houver)
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY criado_em DESC 
LIMIT 5; 