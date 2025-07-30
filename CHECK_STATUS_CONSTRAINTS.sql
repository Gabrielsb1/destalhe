-- Verificar constraints da tabela protocolos
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'protocolos' 
    AND tc.constraint_type = 'CHECK'
    AND kcu.column_name = 'status';

-- Verificar se existe uma constraint de enum para o campo status
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocolos' 
    AND column_name = 'status';

-- Verificar valores únicos atuais no campo status
SELECT DISTINCT status, COUNT(*) as quantidade
FROM protocolos 
GROUP BY status 
ORDER BY status;

-- Testar inserção de um protocolo com status 'coordenacao'
-- (Este é apenas um teste, não será executado automaticamente)
-- INSERT INTO protocolos (numero_protocolo, status, criado_em) 
-- VALUES (999999, 'coordenacao', NOW()); 