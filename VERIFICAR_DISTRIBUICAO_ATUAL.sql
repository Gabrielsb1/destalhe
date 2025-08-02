-- Script para verificar a distribuição atual dos protocolos
-- Este script mostra como os protocolos estão distribuídos entre os colaboradores

-- 1. Verificar total de protocolos e colaboradores
SELECT '=== VERIFICAÇÃO GERAL ===' as info;

SELECT 
    'Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

SELECT 
    'Colaboradores ativos:' as info,
    COUNT(*)::TEXT as quantidade
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true;

-- 2. Verificar distribuição atual dos protocolos
SELECT '=== DISTRIBUIÇÃO ATUAL ===' as info;

SELECT 
    u.nome as colaborador,
    u.id as colaborador_id,
    MIN(p.numero_protocolo) as primeiro_protocolo,
    MAX(p.numero_protocolo) as ultimo_protocolo,
    COUNT(p.id) as total_protocolos,
    COUNT(CASE WHEN p.status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN p.status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN p.status IN ('cancelado', 'dados_excluidos', 'coordenacao') THEN 1 END) as finalizados
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY MIN(p.numero_protocolo);

-- 3. Verificar protocolos sem responsável
SELECT '=== PROTOCOLOS SEM RESPONSÁVEL ===' as info;

SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 4. Verificar protocolos finalizados hoje por colaborador
SELECT '=== PROTOCOLOS FINALIZADOS HOJE ===' as info;

SELECT 
    u.nome as colaborador,
    p.status,
    COUNT(*) as quantidade
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' 
    AND u.ativo = true
    AND p.status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND p.atualizado_em >= CURRENT_DATE
    AND p.atualizado_em < CURRENT_DATE + INTERVAL '1 day'
GROUP BY u.id, u.nome, p.status
ORDER BY u.nome, p.status;

-- 5. Total de protocolos finalizados hoje por colaborador
SELECT '=== TOTAL FINALIZADOS HOJE POR COLABORADOR ===' as info;

SELECT 
    u.nome as colaborador,
    COUNT(*) as total_finalizados_hoje
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' 
    AND u.ativo = true
    AND p.status IN ('cancelado', 'dados_excluidos', 'coordenacao')
    AND p.atualizado_em >= CURRENT_DATE
    AND p.atualizado_em < CURRENT_DATE + INTERVAL '1 day'
GROUP BY u.id, u.nome
ORDER BY total_finalizados_hoje DESC;

-- 6. Verificar se há protocolos com responsável_id mas sem usuário correspondente
SELECT '=== PROTOCOLOS COM RESPONSÁVEL INVÁLIDO ===' as info;

SELECT 
    'Protocolos com responsável inválido:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos p
LEFT JOIN usuarios u ON p.responsavel_id = u.id
WHERE p.responsavel_id IS NOT NULL AND u.id IS NULL;

-- 7. Verificar faixas de protocolos por colaborador
SELECT '=== FAIXAS DE PROTOCOLOS ===' as info;

WITH colaboradores_ordenados AS (
    SELECT 
        id,
        nome,
        ROW_NUMBER() OVER (ORDER BY nome) - 1 as posicao
    FROM usuarios 
    WHERE tipo_usuario = 'colaborador' AND ativo = true
    ORDER BY nome
)
SELECT 
    c.nome as colaborador,
    (c.posicao * 1000) + 1 as protocolo_inicio_esperado,
    (c.posicao + 1) * 1000 as protocolo_fim_esperado,
    MIN(p.numero_protocolo) as primeiro_protocolo_real,
    MAX(p.numero_protocolo) as ultimo_protocolo_real,
    COUNT(p.id) as total_atribuido
FROM colaboradores_ordenados c
LEFT JOIN protocolos p ON c.id = p.responsavel_id
GROUP BY c.id, c.nome, c.posicao
ORDER BY c.posicao; 