-- Script para testar diretamente a atualização de meta
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar a meta atual antes da atualização
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
WHERE data_meta = '2025-07-29';

-- 2. Fazer uma atualização direta (apenas meta_qtd, sem alterar data_meta)
UPDATE metas 
SET 
    meta_qtd = 90,
    atualizado_em = NOW()
WHERE data_meta = '2025-07-29'
RETURNING *;

-- 3. Verificar se a atualização funcionou corretamente
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
WHERE data_meta = '2025-07-29';

-- 4. Testar uma atualização que inclui data_meta (para ver se o problema está aqui)
UPDATE metas 
SET 
    data_meta = '2025-07-29',  -- Mesma data
    meta_qtd = 95,
    atualizado_em = NOW()
WHERE data_meta = '2025-07-29'
RETURNING *;

-- 5. Verificar resultado final
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
WHERE data_meta = '2025-07-29';

-- 6. Verificar se há alguma constraint que possa estar causando problemas
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'metas' 
AND constraint_type = 'UNIQUE'; 