-- Script para debugar o problema do progresso no painel administrativo
-- Este script verifica como os dados estão sendo contabilizados

-- 1. Verificar estrutura dos dados
SELECT '=== ESTRUTURA DOS DADOS ===' as info;

-- Verificar campos da tabela protocolos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocolos' 
    AND column_name IN ('responsavel_id', 'atualizado_em', 'status', 'numero_protocolo')
ORDER BY column_name;

-- 2. Verificar protocolos finalizados hoje
SELECT '=== PROTOCOLOS FINALIZADOS HOJE ===' as info;

-- Protocolos finalizados hoje (usando atualizado_em)
SELECT 
    'Protocolos finalizados hoje (atualizado_em):' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day';

-- Detalhes dos protocolos finalizados hoje
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

-- 3. Verificar progresso por colaborador hoje
SELECT '=== PROGRESSO POR COLABORADOR HOJE ===' as info;

SELECT 
    u.nome as colaborador,
    u.id as colaborador_id,
    COUNT(p.id) as protocolos_finalizados_hoje,
    COUNT(CASE WHEN p.status = 'cancelado' THEN 1 END) as cancelados,
    COUNT(CASE WHEN p.status = 'dados_excluidos' THEN 1 END) as dados_excluidos,
    COUNT(CASE WHEN p.status = 'coordenacao' THEN 1 END) as coordenacao
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
    AND p.status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND p.atualizado_em >= CURRENT_DATE
    AND p.atualizado_em < CURRENT_DATE + INTERVAL '1 day'
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY protocolos_finalizados_hoje DESC;

-- 4. Verificar total de protocolos por colaborador
SELECT '=== TOTAL DE PROTOCOLOS POR COLABORADOR ===' as info;

SELECT 
    u.nome as colaborador,
    u.id as colaborador_id,
    COUNT(p.id) as total_protocolos,
    COUNT(CASE WHEN p.status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN p.status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN p.status IN ('cancelado', 'dados_excluidos', 'coordenacao') THEN 1 END) as finalizados
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY total_protocolos DESC;

-- 5. Verificar se há protocolos com responsável_id mas sem usuário correspondente
SELECT '=== PROTOCOLOS COM RESPONSÁVEL INVÁLIDO ===' as info;

SELECT 
    'Protocolos com responsável inválido:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos p
LEFT JOIN usuarios u ON p.responsavel_id = u.id
WHERE p.responsavel_id IS NOT NULL AND u.id IS NULL;

-- 6. Verificar protocolos sem responsável
SELECT '=== PROTOCOLOS SEM RESPONSÁVEL ===' as info;

SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 7. Verificar distribuição por status
SELECT '=== DISTRIBUIÇÃO POR STATUS ===' as info;

SELECT 
    status,
    COUNT(*) as quantidade
FROM protocolos 
GROUP BY status
ORDER BY status;

-- 8. Verificar se há problemas com datas
SELECT '=== VERIFICAÇÃO DE DATAS ===' as info;

-- Protocolos com atualizado_em nulo
SELECT 
    'Protocolos com atualizado_em nulo:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE atualizado_em IS NULL;

-- Protocolos com atualizado_em muito antigo
SELECT 
    'Protocolos com atualizado_em muito antigo:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE atualizado_em < CURRENT_DATE - INTERVAL '30 days';

-- 9. Simular o cálculo do painel administrativo
SELECT '=== SIMULAÇÃO DO CÁLCULO DO PAINEL ===' as info;

-- Buscar colaboradores ativos
WITH colaboradores AS (
    SELECT id, nome
    FROM usuarios 
    WHERE tipo_usuario = 'colaborador' AND ativo = true
),
protocolos_hoje AS (
    SELECT 
        responsavel_id,
        status
    FROM protocolos 
    WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
        AND atualizado_em >= CURRENT_DATE
        AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
)
SELECT 
    c.nome as colaborador,
    c.id as colaborador_id,
    COALESCE(COUNT(p.responsavel_id), 0) as protocolos_finalizados_hoje,
    48 as meta_diaria,
    CASE 
        WHEN COALESCE(COUNT(p.responsavel_id), 0) >= 48 THEN true 
        ELSE false 
    END as meta_atingida,
    ROUND((COALESCE(COUNT(p.responsavel_id), 0)::DECIMAL / 48) * 100) as percentual
FROM colaboradores c
LEFT JOIN protocolos_hoje p ON c.id = p.responsavel_id
GROUP BY c.id, c.nome
ORDER BY protocolos_finalizados_hoje DESC; 