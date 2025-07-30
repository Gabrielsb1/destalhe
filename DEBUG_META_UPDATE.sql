-- Script para debug da atualização de metas
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar a meta atual do dia 29/07/2025
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
WHERE data_meta = '2025-07-29';

-- 2. Simular uma atualização para ver se há problemas
-- (Execute apenas se quiser testar)
/*
UPDATE metas 
SET 
    meta_qtd = 85,
    atualizado_em = NOW()
WHERE data_meta = '2025-07-29'
RETURNING *;
*/

-- 3. Verificar se há constraints que possam estar causando problemas
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'metas';

-- 4. Verificar se há triggers na tabela
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'metas';

-- 5. Verificar o histórico de mudanças (se houver)
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em,
    EXTRACT(EPOCH FROM (atualizado_em - criado_em)) as segundos_desde_criacao
FROM metas 
ORDER BY atualizado_em DESC; 