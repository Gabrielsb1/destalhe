-- Verificar protocolos finalizados hoje que não têm responsavel_id
SELECT 
    id,
    numero_protocolo,
    status,
    responsavel_id,
    atualizado_em,
    observacoes
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
    AND responsavel_id IS NULL
ORDER BY atualizado_em DESC;

-- Contar quantos protocolos não têm responsavel_id
SELECT 
    status,
    COUNT(*) as quantidade_sem_responsavel
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
    AND responsavel_id IS NULL
GROUP BY status
ORDER BY status;

-- ATENÇÃO: Execute apenas se você souber qual é o seu user_id
-- Para corrigir os protocolos antigos, substitua 'SEU_USER_ID' pelo seu ID real
-- UPDATE protocolos 
-- SET responsavel_id = 'SEU_USER_ID'  -- Substitua pelo seu ID real
-- WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
--     AND atualizado_em >= CURRENT_DATE
--     AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
--     AND responsavel_id IS NULL;

-- Verificar se a correção funcionou (execute após o UPDATE)
-- SELECT 
--     responsavel_id,
--     status,
--     COUNT(*) as quantidade
-- FROM protocolos 
-- WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
--     AND atualizado_em >= CURRENT_DATE
--     AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
-- GROUP BY responsavel_id, status
-- ORDER BY responsavel_id, status; 