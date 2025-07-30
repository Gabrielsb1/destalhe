-- Verificar estrutura da tabela protocolos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocolos' 
    AND column_name IN ('usuario_responsavel', 'responsavel_id')
ORDER BY column_name;

-- Verificar protocolos do usuário hoje (substitua 'SEU_USER_ID' pelo ID real)
-- SELECT 
--     id,
--     numero_protocolo,
--     status,
--     usuario_responsavel,
--     responsavel_id,
--     atualizado_em,
--     observacoes
-- FROM protocolos 
-- WHERE usuario_responsavel = 'SEU_USER_ID'
--     AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
--     AND atualizado_em >= CURRENT_DATE
--     AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
-- ORDER BY atualizado_em DESC;

-- Contar protocolos finalizados hoje por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM protocolos 
WHERE usuario_responsavel = 'SEU_USER_ID'  -- Substitua pelo ID real
    AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
GROUP BY status
ORDER BY status;

-- Total de protocolos finalizados hoje
SELECT 
    COUNT(*) as total_finalizados_hoje
FROM protocolos 
WHERE usuario_responsavel = 'SEU_USER_ID'  -- Substitua pelo ID real
    AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'; 