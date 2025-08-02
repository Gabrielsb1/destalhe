# Troubleshooting - Progresso no Painel Administrativo

## Problema
O painel administrativo não está mostrando o progresso de cada colaborador corretamente.

## Possíveis Causas

### 1. Problema na Data de Atualização
- Protocolos finalizados não têm `atualizado_em` preenchido
- Data está em formato incorreto
- Fuso horário incorreto

### 2. Problema na Distribuição
- Protocolos não têm `responsavel_id` preenchido
- Colaboradores não estão ativos
- IDs não correspondem entre tabelas

### 3. Problema no Código
- Filtros incorretos na consulta
- Problemas na lógica de cálculo
- Dados não sendo carregados corretamente

## Passos para Diagnosticar

### Passo 1: Executar Script de Debug
Execute o script `DEBUG_PROGRESSO_PAINEL.sql` para verificar:
- Estrutura dos dados
- Protocolos finalizados hoje
- Progresso por colaborador
- Problemas com datas

### Passo 2: Executar Script de Teste
Execute o script `TESTE_PROGRESSO_HOJE.sql` para verificar:
- Se há protocolos finalizados hoje
- Protocolos dos últimos 7 dias
- Problemas com responsáveis
- Datas incorretas

### Passo 3: Verificar no Console do Navegador
1. Abra o painel administrativo
2. Abra o console do navegador (F12)
3. Verifique os logs de erro
4. Procure por mensagens de debug

## Soluções Implementadas

### 1. Correção no Código
- Modificada a função `calculateStats` para buscar dados diretamente do banco
- Removida dependência dos dados filtrados do frontend
- Adicionadas consultas específicas para cada período (hoje, semana, mês)

### 2. Melhorias na Consulta
- Busca direta de protocolos finalizados hoje
- Verificação de colaboradores ativos
- Cálculo correto de percentuais

## Como Testar as Correções

### 1. Recarregar o Painel
1. Salve as alterações no código
2. Recarregue a página do painel administrativo
3. Verifique se os dados aparecem corretamente

### 2. Verificar Logs
1. Abra o console do navegador
2. Procure por mensagens de debug
3. Verifique se há erros

### 3. Comparar com Scripts SQL
1. Execute os scripts de debug
2. Compare os resultados com o painel
3. Verifique se os números batem

## Verificações Específicas

### Se o Progresso Está Zero
1. Verifique se há protocolos finalizados hoje
2. Confirme se os protocolos têm `responsavel_id`
3. Verifique se a data `atualizado_em` está correta

### Se Alguns Colaboradores Não Aparecem
1. Verifique se estão ativos na tabela `usuarios`
2. Confirme se têm `tipo_usuario = 'colaborador'`
3. Verifique se têm protocolos atribuídos

### Se os Números Não Batem
1. Compare com os scripts SQL
2. Verifique se há filtros aplicados
3. Confirme se a meta está correta

## Scripts de Verificação

### Script Principal
```sql
-- Execute para verificar o progresso atual
\i DEBUG_PROGRESSO_PAINEL.sql
```

### Script de Teste
```sql
-- Execute para testar se há dados hoje
\i TESTE_PROGRESSO_HOJE.sql
```

### Script de Correção (se necessário)
```sql
-- Execute se a distribuição estiver incorreta
\i CORRIGIR_DISTRIBUICAO_PROTOCOLOS.sql
```

## Logs Importantes

### No Console do Navegador
- `Iniciando calculateStats com protocolos:`
- `Protocolos finalizados hoje (do banco):`
- `Colaborador [nome] ([id]): [count] protocolos finalizados hoje`
- `Estatísticas finais:`

### No Banco de Dados
- Verificar se há protocolos com `atualizado_em` hoje
- Confirmar se `responsavel_id` está preenchido
- Verificar se colaboradores estão ativos

## Contato e Suporte

Se o problema persistir após seguir este guia:

1. **Execute os scripts de debug** e anote os resultados
2. **Verifique os logs do console** e copie os erros
3. **Compare os números** entre o painel e os scripts SQL
4. **Documente o comportamento** observado

### Informações Necessárias
- Resultados dos scripts de debug
- Logs de erro do console
- Screenshot do painel com dados incorretos
- Data e hora do teste 