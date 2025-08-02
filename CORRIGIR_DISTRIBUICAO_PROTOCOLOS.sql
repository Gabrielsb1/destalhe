-- Script para corrigir a distribuição dos protocolos
-- Este script redistribui os protocolos de forma sequencial entre os colaboradores

-- 1. Verificar situação atual antes da correção
SELECT '=== SITUAÇÃO ANTES DA CORREÇÃO ===' as info;

SELECT 
    'Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

SELECT 
    'Colaboradores ativos:' as info,
    COUNT(*)::TEXT as quantidade
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true;

-- 2. Limpar responsáveis existentes
SELECT '=== LIMPANDO RESPONSÁVEIS EXISTENTES ===' as info;

UPDATE protocolos SET responsavel_id = NULL;

-- 3. Redistribuir protocolos
SELECT '=== REDISTRIBUINDO PROTOCOLOS ===' as info;

DO $$
DECLARE
    colaborador RECORD;
    protocolo_inicio INTEGER;
    protocolo_fim INTEGER;
    colaborador_index INTEGER := 0;
    protocolos_por_colaborador INTEGER := 1000;
    total_protocolos INTEGER;
    colaboradores_count INTEGER;
    protocolos_atribuidos INTEGER;
BEGIN
    -- Contar total de protocolos
    SELECT COUNT(*) INTO total_protocolos FROM protocolos;
    
    -- Contar colaboradores ativos
    SELECT COUNT(*) INTO colaboradores_count 
    FROM usuarios 
    WHERE tipo_usuario = 'colaborador' AND ativo = true;
    
    RAISE NOTICE '=== INICIANDO REDISTRIBUIÇÃO ===';
    RAISE NOTICE 'Total de protocolos: %, Colaboradores: %', total_protocolos, colaboradores_count;
    RAISE NOTICE 'Protocolos por colaborador: %', protocolos_por_colaborador;
    
    -- Verificar se há colaboradores suficientes
    IF colaboradores_count = 0 THEN
        RAISE NOTICE 'ERRO: Nenhum colaborador ativo encontrado!';
        RETURN;
    END IF;
    
    -- Para cada colaborador, distribuir protocolos
    FOR colaborador IN 
        SELECT id, nome 
        FROM usuarios 
        WHERE tipo_usuario = 'colaborador' AND ativo = true
        ORDER BY nome
    LOOP
        -- Calcular faixa de protocolos para este colaborador
        protocolo_inicio := (colaborador_index * protocolos_por_colaborador) + 1;
        protocolo_fim := LEAST((colaborador_index + 1) * protocolos_por_colaborador, total_protocolos);
        
        -- Verificar se ainda há protocolos para distribuir
        IF protocolo_inicio > total_protocolos THEN
            RAISE NOTICE 'Colaborador: % (ID: %) - SEM PROTOCOLOS (não há mais protocolos disponíveis)', 
                colaborador.nome, colaborador.id;
            EXIT;
        END IF;
        
        RAISE NOTICE 'Colaborador: % (ID: %) - Protocolos: % a %', 
            colaborador.nome, colaborador.id, protocolo_inicio, protocolo_fim;
        
        -- Atualizar protocolos para este colaborador
        UPDATE protocolos 
        SET responsavel_id = colaborador.id
        WHERE numero_protocolo BETWEEN protocolo_inicio AND protocolo_fim;
        
        -- Verificar quantos protocolos foram atribuídos
        GET DIAGNOSTICS protocolos_atribuidos = ROW_COUNT;
        RAISE NOTICE 'Protocolos atribuídos para %: %', colaborador.nome, protocolos_atribuidos;
        
        colaborador_index := colaborador_index + 1;
    END LOOP;
    
    RAISE NOTICE '=== REDISTRIBUIÇÃO CONCLUÍDA ===';
END $$;

-- 4. Verificar distribuição final
SELECT '=== DISTRIBUIÇÃO FINAL ===' as info;

SELECT 
    u.nome as colaborador,
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

-- 5. Verificar protocolos sem responsável
SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 6. Verificar faixas de protocolos por colaborador
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
    COUNT(p.id) as total_atribuido,
    CASE 
        WHEN MIN(p.numero_protocolo) = (c.posicao * 1000) + 1 
        AND MAX(p.numero_protocolo) = LEAST((c.posicao + 1) * 1000, (SELECT COUNT(*) FROM protocolos))
        THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status_distribuicao
FROM colaboradores_ordenados c
LEFT JOIN protocolos p ON c.id = p.responsavel_id
GROUP BY c.id, c.nome, c.posicao
ORDER BY c.posicao; 