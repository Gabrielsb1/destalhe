-- Script para distribuir protocolos entre colaboradores
-- Cada colaborador recebe 1000 protocolos sequenciais

-- 1. Primeiro, vamos verificar quantos colaboradores existem
SELECT 
    'Colaboradores ativos:' as info,
    COUNT(*)::TEXT as quantidade
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true;

-- 2. Listar colaboradores ativos
SELECT 'Lista de colaboradores:' as info;

SELECT 
    'Colaborador:',
    id::TEXT,
    nome,
    email
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true
ORDER BY nome;

-- 3. Verificar total de protocolos
SELECT 
    'Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

-- 4. Distribuir protocolos entre colaboradores
-- Vamos criar uma tabela temporária com a distribuição
DO $$
DECLARE
    colaborador RECORD;
    protocolo_inicio INTEGER;
    protocolo_fim INTEGER;
    colaborador_index INTEGER := 0;
    protocolos_por_colaborador INTEGER := 1000;
    total_protocolos INTEGER;
    colaboradores_count INTEGER;
BEGIN
    -- Contar total de protocolos
    SELECT COUNT(*) INTO total_protocolos FROM protocolos;
    
    -- Contar colaboradores ativos
    SELECT COUNT(*) INTO colaboradores_count 
    FROM usuarios 
    WHERE tipo_usuario = 'colaborador' AND ativo = true;
    
    RAISE NOTICE 'Total de protocolos: %, Colaboradores: %', total_protocolos, colaboradores_count;
    
    -- Verificar se há protocolos suficientes
    IF total_protocolos < (colaboradores_count * protocolos_por_colaborador) THEN
        RAISE NOTICE 'ATENÇÃO: Não há protocolos suficientes para todos os colaboradores!';
        RAISE NOTICE 'Protocolos necessários: %, Protocolos disponíveis: %', 
            colaboradores_count * protocolos_por_colaborador, total_protocolos;
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
        
        RAISE NOTICE 'Colaborador: % (ID: %) - Protocolos: % a %', 
            colaborador.nome, colaborador.id, protocolo_inicio, protocolo_fim;
        
        -- Atualizar protocolos para este colaborador
        UPDATE protocolos 
        SET responsavel_id = colaborador.id
        WHERE numero_protocolo BETWEEN protocolo_inicio AND protocolo_fim;
        
        -- Verificar quantos protocolos foram atribuídos
        GET DIAGNOSTICS colaborador_index = ROW_COUNT;
        RAISE NOTICE 'Protocolos atribuídos para %: %', colaborador.nome, colaborador_index;
        
        colaborador_index := colaborador_index + 1;
    END LOOP;
    
    RAISE NOTICE 'Distribuição concluída!';
END $$;

-- 5. Verificar a distribuição final
SELECT 'Distribuição final:' as info;

SELECT 
    'Colaborador:',
    u.nome,
    MIN(p.numero_protocolo)::TEXT,
    MAX(p.numero_protocolo)::TEXT,
    COUNT(p.id)::TEXT
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- 6. Verificar protocolos sem responsável
SELECT 
    'Protocolos sem responsável:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 7. Verificar distribuição por status
SELECT 'Distribuição por status:' as info;

SELECT 
    'Status:',
    status,
    COUNT(*)::TEXT
FROM protocolos 
GROUP BY status
ORDER BY status; 