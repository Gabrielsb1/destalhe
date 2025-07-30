-- Script para verificar a função do trigger
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar a função atualizar_data_modificacao
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'atualizar_data_modificacao';

-- 2. Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'atualizar_data_modificacao';

-- 3. Verificar o trigger em detalhes
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'tr_metas_atualizar_data';

-- 4. Verificar se há outros triggers na tabela
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'metas';

-- 5. Verificar a estrutura atual da tabela metas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'metas'
ORDER BY ordinal_position; 