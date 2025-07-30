-- Script para limpar metas duplicadas e manter apenas as corretas
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar metas duplicadas
SELECT 
    data_meta,
    COUNT(*) as quantidade,
    array_agg(id) as ids,
    array_agg(meta_qtd) as metas,
    array_agg(criado_em) as datas_criacao
FROM metas 
GROUP BY data_meta 
HAVING COUNT(*) > 1
ORDER BY data_meta;

-- 2. Manter apenas a meta mais recente para cada data
-- Para 2025-07-29: manter a meta de 80 protocolos (mais recente)
-- Para 2025-07-28: manter a meta de 84 protocolos (mais recente)

-- 3. Deletar metas duplicadas (manter apenas a mais recente de cada data)
DELETE FROM metas 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY data_meta ORDER BY criado_em DESC) as rn
        FROM metas
    ) t
    WHERE t.rn > 1
);

-- 4. Verificar resultado
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY data_meta DESC;

-- 5. Confirmar que não há mais duplicatas
SELECT 
    data_meta,
    COUNT(*) as quantidade
FROM metas 
GROUP BY data_meta 
HAVING COUNT(*) > 1
ORDER BY data_meta; 