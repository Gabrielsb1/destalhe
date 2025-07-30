-- Verificar estrutura da tabela protocolos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocolos' 
    AND column_name LIKE '%responsavel%'
ORDER BY column_name;

-- Verificar todos os campos da tabela protocolos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocolos' 
ORDER BY column_name;

-- Contar protocolos finalizados hoje por status (substitua 'SEU_USER_ID' pelo ID real)
SELECT 
    status,
    COUNT(*) as quantidade
FROM protocolos 
WHERE responsavel_id = 'SEU_USER_ID'  -- Substitua pelo seu ID real
    AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
GROUP BY status
ORDER BY status;

-- Total de protocolos finalizados hoje
SELECT 
    COUNT(*) as total_finalizados_hoje
FROM protocolos 
WHERE responsavel_id = 'SEU_USER_ID'  -- Substitua pelo seu ID real
    AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day';

-- Verificar protocolos do usuário hoje (detalhado)
-- SELECT 
--     id,
--     numero_protocolo,
--     status,
--     responsavel_id,
--     atualizado_em,
--     observacoes
-- FROM protocolos 
-- WHERE responsavel_id = 'SEU_USER_ID'  -- Substitua pelo seu ID real
--     AND status IN ('cancelado', 'dados_excluidos', 'coordenacao')
--     AND atualizado_em >= CURRENT_DATE
--     AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
-- ORDER BY atualizado_em DESC; 