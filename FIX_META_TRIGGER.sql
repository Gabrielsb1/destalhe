-- Script para corrigir o problema do trigger
-- Execute este código no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar o que a função atualizar_data_modificacao faz
SELECT 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'atualizar_data_modificacao';

-- 2. Desabilitar temporariamente o trigger para testes
ALTER TABLE metas DISABLE TRIGGER tr_metas_atualizar_data;

-- 3. Verificar se o trigger foi desabilitado
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'tr_metas_atualizar_data';

-- 4. Testar uma atualização sem o trigger
UPDATE metas 
SET 
    meta_qtd = 85,
    atualizado_em = NOW()
WHERE data_meta = '2025-07-29'
RETURNING *;

-- 5. Verificar se a atualização funcionou corretamente
SELECT 
    id,
    data_meta,
    meta_qtd,
    criado_em,
    atualizado_em
FROM metas 
WHERE data_meta = '2025-07-29';

-- 6. Se funcionou, vamos criar uma versão corrigida da função
-- (Execute apenas se necessário)

/*
-- Criar nova função que não altera a data_meta
CREATE OR REPLACE FUNCTION atualizar_data_modificacao_metas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo
DROP TRIGGER IF EXISTS tr_metas_atualizar_data ON metas;

-- Criar novo trigger
CREATE TRIGGER tr_metas_atualizar_data
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_modificacao_metas();
*/

-- 7. Ou simplesmente remover o trigger se não for necessário
-- DROP TRIGGER IF EXISTS tr_metas_atualizar_data ON metas; 