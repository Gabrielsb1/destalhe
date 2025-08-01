-- Script de teste para verificar a distribuição de protocolos (versão corrigida)
-- Este script testa apenas a lógica de distribuição sem fazer alterações permanentes

-- 1. Verificar colaboradores ativos
SELECT 
    'TESTE - Colaboradores ativos:' as info,
    COUNT(*)::TEXT as quantidade
FROM usuarios 
WHERE tipo_usuario = 'colaborador' AND ativo = true;

-- 2. Listar colaboradores que participarão da distribuição
SELECT 'TESTE - Lista de colaboradores:' as info;

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
    'TESTE - Total de protocolos:' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos;

-- 4. Simular distribuição (sem alterar dados)
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
    
    RAISE NOTICE 'TESTE - Total de protocolos: %, Colaboradores: %', total_protocolos, colaboradores_count;
    
    -- Verificar se há protocolos suficientes
    IF total_protocolos < (colaboradores_count * protocolos_por_colaborador) THEN
        RAISE NOTICE 'TESTE - ATENÇÃO: Não há protocolos suficientes para todos os colaboradores!';
        RAISE NOTICE 'TESTE - Protocolos necessários: %, Protocolos disponíveis: %', 
            colaboradores_count * protocolos_por_colaborador, total_protocolos;
    END IF;
    
    -- Simular distribuição (apenas mostrar o que seria feito)
    FOR colaborador IN 
        SELECT id, nome 
        FROM usuarios 
        WHERE tipo_usuario = 'colaborador' AND ativo = true
        ORDER BY nome
    LOOP
        -- Calcular faixa de protocolos para este colaborador
        protocolo_inicio := (colaborador_index * protocolos_por_colaborador) + 1;
        protocolo_fim := LEAST((colaborador_index + 1) * protocolos_por_colaborador, total_protocolos);
        
        RAISE NOTICE 'TESTE - Colaborador: % (ID: %) - Protocolos: % a %', 
            colaborador.nome, colaborador.id, protocolo_inicio, protocolo_fim;
        
        colaborador_index := colaborador_index + 1;
    END LOOP;
    
    RAISE NOTICE 'TESTE - Simulação concluída!';
END $$;

-- 5. Verificar distribuição atual (antes da distribuição)
SELECT 'TESTE - Distribuição atual (antes):' as info;

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

-- 6. Verificar protocolos sem responsável (atual)
SELECT 
    'TESTE - Protocolos sem responsável (atual):' as info,
    COUNT(*)::TEXT as quantidade
FROM protocolos 
WHERE responsavel_id IS NULL;

-- 7. Verificar distribuição por status (atual)
SELECT 'TESTE - Distribuição por status (atual):' as info;

SELECT 
    'Status:',
    status,
    COUNT(*)::TEXT
FROM protocolos 
GROUP BY status
ORDER BY status; 