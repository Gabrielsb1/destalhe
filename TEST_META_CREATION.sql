-- Script para testar diretamente a criação de uma meta
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar metas existentes antes do teste
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY data_meta DESC;

-- 2. Testar inserção direta com data específica
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-29', 67)
RETURNING *;

-- 3. Verificar se a inserção funcionou corretamente
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
WHERE data_meta = '2025-07-29'
ORDER BY criado_em DESC;

-- 4. Testar upsert (que é o que a aplicação usa)
INSERT INTO metas (data_meta, meta_qtd) 
VALUES ('2025-07-30', 75)
ON CONFLICT (data_meta) 
DO UPDATE SET 
    meta_qtd = EXCLUDED.meta_qtd,
    atualizado_em = NOW()
RETURNING *;

-- 5. Verificar resultado final
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
ORDER BY data_meta DESC;

-- 6. Verificar se há constraints que possam estar causando problemas
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'metas'; 