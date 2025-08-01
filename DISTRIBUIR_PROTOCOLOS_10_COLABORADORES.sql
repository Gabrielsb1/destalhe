-- Script para distribuir protocolos entre 10 colaboradores
-- Cada colaborador recebe 1000 protocolos sequenciais
-- Total de protocolos: 23.096
-- Colaboradores disponíveis: 10
-- Protocolos distribuídos: 10.000 (10 x 1.000)
-- Protocolos sem responsável: 13.096

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
    protocolos_distribuidos INTEGER := 0;
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
    RAISE NOTICE 'Protocolos que serão distribuídos: %', colaboradores_count * protocolos_por_colaborador;
    RAISE NOTICE 'Protocolos que ficarão sem responsável: %', total_protocolos - (colaboradores_count * protocolos_por_colaborador);
    
    -- Verificar se há colaboradores
    IF colaboradores_count = 0 THEN
        RAISE NOTICE 'ERRO: Nenhum colaborador ativo encontrado!';
        RETURN;
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
        protocolo_fim := (colaborador_index + 1) * protocolos_por_colaborador;
        
        RAISE NOTICE 'Colaborador: % (ID: %) - Protocolos: % a %', 
            colaborador.nome, colaborador.id, protocolo_inicio, protocolo_fim;
        
        -- Atualizar protocolos para este colaborador
        UPDATE protocolos 
        SET responsavel_id = colaborador.id
        WHERE numero_protocolo BETWEEN protocolo_inicio AND protocolo_fim;
        
        -- Verificar quantos protocolos foram atribuídos
        GET DIAGNOSTICS protocolos_atribuidos = ROW_COUNT;
        protocolos_distribuidos := protocolos_distribuidos + protocolos_atribuidos;
        RAISE NOTICE 'Protocolos atribuídos para %: %', colaborador.nome, protocolos_atribuidos;
        
        colaborador_index := colaborador_index + 1;
    END LOOP;
    
    RAISE NOTICE '=== DISTRIBUIÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Total de protocolos distribuídos: %', protocolos_distribuidos;
    RAISE NOTICE 'Protocolos sem responsável: %', total_protocolos - protocolos_distribuidos;
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

-- 5. Verificar faixa de protocolos sem responsável
SELECT 'Faixa de protocolos sem responsável:' as info;

SELECT 
    'Primeiro protocolo sem responsável:' as info,
    MIN(numero_protocolo)::TEXT as numero
FROM protocolos 
WHERE responsavel_id IS NULL;

SELECT 
    'Último protocolo sem responsável:' as info,
    MAX(numero_protocolo)::TEXT as numero
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 6. Verificar distribuição por status
SELECT 'Distribuição por status:' as info;

SELECT 
    'Status:',
    status,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
GROUP BY status
ORDER BY status;

-- 7. Resumo final
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

-- 8. Mostrar exemplo de distribuição
SELECT '=== EXEMPLO DE DISTRIBUIÇÃO ===' as info;

SELECT 
    'Colaborador 1:' as info,
    'Protocolos 1 a 1.000' as faixa,
    '1.000 protocolos' as quantidade;

SELECT 
    'Colaborador 2:' as info,
    'Protocolos 1.001 a 2.000' as faixa,
    '1.000 protocolos' as quantidade;

SELECT 
    'Colaborador 3:' as info,
    'Protocolos 2.001 a 3.000' as faixa,
    '1.000 protocolos' as quantidade;

SELECT 
    '...' as info,
    '...' as faixa,
    '...' as quantidade;

SELECT 
    'Colaborador 10:' as info,
    'Protocolos 9.001 a 10.000' as faixa,
    '1.000 protocolos' as quantidade;

SELECT 
    'Sem responsável:' as info,
    'Protocolos 10.001 a 23.096' as faixa,
    '13.096 protocolos' as quantidade; 