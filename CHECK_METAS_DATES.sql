-- Script para verificar as datas das metas
-- Execute este código no SQL Editor do Supabase

-- Verificar todas as metas com detalhes
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em,
    -- Mostrar a data em diferentes formatos para debug
    data_meta::text as data_meta_text,
    to_char(data_meta, 'DD/MM/YYYY') as data_formatada,
    to_char(data_meta, 'Day, DD "de" Month "de" YYYY') as data_completa
FROM metas 
ORDER BY data_meta DESC;

-- Verificar se há metas duplicadas para a mesma data
SELECT 
    data_meta,
    COUNT(*) as quantidade,
    array_agg(id) as ids,
    array_agg(meta_qtd) as metas
FROM metas 
GROUP BY data_meta 
HAVING COUNT(*) > 1
ORDER BY data_meta;

-- Verificar a data atual do servidor
SELECT 
    NOW() as data_atual_servidor,
    CURRENT_DATE as data_atual,
    NOW() AT TIME ZONE 'America/Sao_Paulo' as data_brasil;

-- Verificar se há metas para datas específicas
SELECT 
    id,
    data_meta,
    meta_qtd
FROM metas 
WHERE data_meta IN ('2025-07-29', '2025-07-28', '2025-07-27')
ORDER BY data_meta; 