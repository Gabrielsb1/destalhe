-- Remover a constraint atual que não inclui 'coordenacao'
ALTER TABLE protocolos DROP CONSTRAINT protocolos_status_check;

-- Recriar a constraint incluindo 'coordenacao'
ALTER TABLE protocolos ADD CONSTRAINT protocolos_status_check 
CHECK (
  status = ANY (
    ARRAY[
      'pendente'::text,
      'em_andamento'::text,
      'concluido'::text,
      'dados_excluidos'::text,
      'cancelado'::text,
      'coordenacao'::text
    ]
  )
);

-- Verificar se a constraint foi aplicada corretamente
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

-- Testar se agora aceita o status 'coordenacao'
-- (Este é apenas um teste, não será executado automaticamente)
-- UPDATE protocolos 
-- SET status = 'coordenacao', observacoes = 'Teste de coordenação'
-- WHERE id = 'ID_DO_PROTOCOLO_TESTE'; 