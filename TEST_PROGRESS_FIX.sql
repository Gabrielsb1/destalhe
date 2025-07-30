-- Verificar se os protocolos têm responsavel_id preenchido
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
ORDER BY atualizado_em DESC
LIMIT 10;

-- Contar protocolos por responsável hoje
SELECT 
    responsavel_id,
    status,
    COUNT(*) as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
    AND responsavel_id IS NOT NULL
GROUP BY responsavel_id, status
ORDER BY responsavel_id, status;

-- Total de protocolos finalizados hoje por responsável
SELECT 
    responsavel_id,
    COUNT(*) as total_finalizados_hoje
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
    AND responsavel_id IS NOT NULL
GROUP BY responsavel_id
ORDER BY total_finalizados_hoje DESC; 