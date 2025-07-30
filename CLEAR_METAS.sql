-- Script para limpar todas as metas da tabela
-- Execute este código no SQL Editor do Supabase

-- Primeiro, vamos ver quantas metas existem
SELECT COUNT(*) as total_metas FROM metas;

-- Mostrar algumas metas como exemplo
SELECT 
    data_meta,
    meta_qtd,
    criado_em
FROM metas 
ORDER BY data_meta DESC 
LIMIT 10;

-- ⚠️ ATENÇÃO: O comando abaixo irá EXCLUIR TODAS as metas!
-- Execute apenas se tiver certeza que quer limpar a tabela

-- Deletar todas as metas
DELETE FROM metas;

-- Verificar se a tabela está vazia
SELECT COUNT(*) as metas_restantes FROM metas;

-- Confirmação: deve retornar 0
SELECT 'Tabela limpa com sucesso!' as status; 