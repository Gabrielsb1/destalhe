-- Script para testar se há protocolos finalizados hoje
-- Este script verifica se o problema está na data ou na contagem

-- 1. Verificar se há protocolos finalizados hoje
SELECT '=== TESTE DE PROTOCOLOS FINALIZADOS HOJE ===' as info;

-- Protocolos finalizados hoje (usando CURRENT_DATE)
SELECT 
    'Protocolos finalizados hoje (CURRENT_DATE):' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day';

-- 2. Verificar protocolos finalizados nos últimos 7 dias
SELECT '=== PROTOCOLOS FINALIZADOS NOS ÚLTIMOS 7 DIAS ===' as info;

SELECT 
    DATE(atualizado_em) as data,
    status,
    COUNT(*) as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em >= CURRENT_DATE - INTERVAL '7 days'
    AND atualizado_em < CURRENT_DATE + INTERVAL '1 day'
GROUP BY DATE(atualizado_em), status
ORDER BY data DESC, status;

-- 3. Verificar se há protocolos com responsável_id preenchido
SELECT '=== PROTOCOLOS COM RESPONSÁVEL ===' as info;

SELECT 
    'Protocolos com responsável_id preenchido:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NOT NULL;

-- 4. Verificar protocolos finalizados hoje com responsável
SELECT '=== PROTOCOLOS FINALIZADOS HOJE COM RESPONSÁVEL ===' as info;

SELECT 
    u.nome as colaborador,
    p.status,
    p.numero_protocolo,
    p.atualizado_em
FROM protocolos p
JOIN usuarios u ON p.responsavel_id = u.id
WHERE p.status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND p.atualizado_em >= CURRENT_DATE
    AND p.atualizado_em < CURRENT_DATE + INTERVAL '1 day'
    AND u.tipo_usuario = 'colaborador'
    AND u.ativo = true
ORDER BY p.atualizado_em DESC;

-- 5. Verificar se há protocolos com data de atualização nula
SELECT '=== PROTOCOLOS COM ATUALIZADO_EM NULO ===' as info;

SELECT 
    'Protocolos com atualizado_em nulo:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE atualizado_em IS NULL;

-- 6. Verificar protocolos finalizados sem responsável
SELECT '=== PROTOCOLOS FINALIZADOS SEM RESPONSÁVEL ===' as info;

SELECT 
    'Protocolos finalizados sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND responsavel_id IS NULL;

-- 7. Verificar se há protocolos com data de atualização futura
SELECT '=== PROTOCOLOS COM DATA FUTURA ===' as info;

SELECT 
    'Protocolos com atualizado_em no futuro:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE atualizado_em > CURRENT_DATE + INTERVAL '1 day';

-- 8. Verificar protocolos finalizados hoje por colaborador (detalhado)
SELECT '=== PROGRESSO DETALHADO POR COLABORADOR ===' as info;

SELECT 
    u.nome as colaborador,
    u.id as colaborador_id,
    COUNT(p.id) as protocolos_finalizados_hoje,
    COUNT(CASE WHEN p.status = 'cancelado' THEN 1 END) as cancelados,
    COUNT(CASE WHEN p.status = 'dados_excluidos' THEN 1 END) as dados_excluidos,
    COUNT(CASE WHEN p.status = 'coordenacao' THEN 1 END) as coordenacao,
    MIN(p.atualizado_em) as primeiro_protocolo_hoje,
    MAX(p.atualizado_em) as ultimo_protocolo_hoje
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
    AND p.status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND p.atualizado_em >= CURRENT_DATE
    AND p.atualizado_em < CURRENT_DATE + INTERVAL '1 day'
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY protocolos_finalizados_hoje DESC;

-- 9. Verificar se há protocolos com status finalizado mas sem data de atualização
SELECT '=== PROTOCOLOS FINALIZADOS SEM DATA ===' as info;

SELECT 
    'Protocolos finalizados sem data de atualização:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND atualizado_em IS NULL;

-- 10. Verificar protocolos criados hoje mas não finalizados
SELECT '=== PROTOCOLOS CRIADOS HOJE ===' as info;

SELECT 
    'Protocolos criados hoje:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE criado_em >= CURRENT_DATE
    AND criado_em < CURRENT_DATE + INTERVAL '1 day'; 