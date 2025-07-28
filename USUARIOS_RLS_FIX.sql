-- Políticas RLS para tabela usuarios
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Política temporária para permitir todas as operações (teste rápido)
CREATE POLICY "Permitir todas as operações temporariamente" ON usuarios FOR ALL USING (true);

-- 3. Políticas específicas (use estas depois de confirmar que funciona)
-- Política para SELECT (leitura)
CREATE POLICY "Permitir leitura de usuários" ON usuarios FOR SELECT USING (true);

-- Política para INSERT (criação)
CREATE POLICY "Permitir criação de usuários" ON usuarios FOR INSERT WITH CHECK (true);

-- Política para UPDATE (atualização)
CREATE POLICY "Permitir atualização de usuários" ON usuarios FOR UPDATE USING (true);

-- Política para DELETE (exclusão)
CREATE POLICY "Permitir exclusão de usuários" ON usuarios FOR DELETE USING (true); 