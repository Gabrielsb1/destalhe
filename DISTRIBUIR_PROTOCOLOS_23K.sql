-- Script para distribuir 23.096 protocolos entre colaboradores
-- Cada colaborador recebe 1000 protocolos sequenciais
-- Total de protocolos: 23.096
-- Colaboradores necessários: 24 (23 com 1000 + 1 com 96)

-- 1. Verificar situação atual
SELECT '=== VERIFICAÇÃO INICIAL ===' as info;

-- Contar colaboradores ativos
SELECT 
    'Colaboradores ativos:' as info,
    COUNT(*)::TEXT as quantidade
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true;

-- Listar colaboradores ativos
SELECT 'Lista de colaboradores:' as info;

SELECT 
    ROW_NUMBER() OVER (ORDER BY nome) as posicao,
    id::TEXT,
    nome,
    email
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true
ORDER BY nome;

-- Verificar total de protocolos
SELECT 
    'Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

-- Verificar protocolos sem responsável
SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 2. Distribuir protocolos entre colaboradores
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
    
    RAISE NOTICE '=== INICIANDO DISTRIBUIÇÃO ===';
    RAISE NOTICE 'Total de protocolos: %, Colaboradores: %', total_protocolos, colaboradores_count;
    RAISE NOTICE 'Protocolos por colaborador: %', protocolos_por_colaborador;
    
    -- Verificar se há colaboradores suficientes
    IF colaboradores_count = 0 THEN
        RAISE NOTICE 'ERRO: Nenhum colaborador ativo encontrado!';
        RETURN;
    END IF;
    
    -- Verificar se há protocolos suficientes
    IF total_protocolos < protocolos_por_colaborador THEN
        RAISE NOTICE 'ATENÇÃO: Poucos protocolos disponíveis!';
        RAISE NOTICE 'Protocolos disponíveis: %, Mínimo necessário: %', total_protocolos, protocolos_por_colaborador;
    END IF;
    
    -- Limpar responsáveis existentes
    RAISE NOTICE 'Limpando responsáveis existentes...';
    UPDATE protocolos SET responsavel_id = NULL;
    GET DIAGNOSTICS protocolos_atribuidos = ROW_COUNT;
    RAISE NOTICE 'Responsáveis limpos: % protocolos', protocolos_atribuidos;
    
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
    
    RAISE NOTICE '=== DISTRIBUIÇÃO CONCLUÍDA ===';
END $$;

-- 3. Verificar a distribuição final
SELECT '=== DISTRIBUIÇÃO FINAL ===' as info;

SELECT 
    'Colaborador:',
    u.nome,
    MIN(p.numero_protocolo)::TEXT as primeiro_protocolo,
    MAX(p.numero_protocolo)::TEXT as ultimo_protocolo,
    COUNT(p.id)::TEXT as total_protocolos
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY MIN(p.numero_protocolo);

-- 4. Verificar protocolos sem responsável
SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 5. Verificar distribuição por status
SELECT 'Distribuição por status:' as info;

SELECT 
    'Status:',
    status,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
GROUP BY status
ORDER BY status;

-- 6. Resumo final
SELECT '=== RESUMO FINAL ===' as info;

SELECT 
    'Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

SELECT 
    'Protocolos distribuídos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NOT NULL;

SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

SELECT 
    'Colaboradores com protocolos:' as info,
    COUNT(DISTINCT responsavel_id)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NOT NULL; 