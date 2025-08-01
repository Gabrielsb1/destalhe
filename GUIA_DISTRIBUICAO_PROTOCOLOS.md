# Guia de Distribuição de Protocolos entre Colaboradores

## Objetivo
Distribuir automaticamente os protocolos da tabela `protocolos` entre os colaboradores ativos, de forma que cada colaborador receba 1000 protocolos sequenciais.

## Como Funciona
- Cada colaborador ativo recebe exatamente 1000 protocolos
- Os protocolos são distribuídos sequencialmente (ex: Maria recebe 1-1000, João recebe 1001-2000, etc.)
- A distribuição é feita atualizando o campo `responsavel_id` na tabela `protocolos`
- Apenas colaboradores com `tipo_usuario = 'colaborador'` e `ativo = true` participam da distribuição

## Pré-requisitos
1. Ter acesso ao banco de dados Supabase
2. Ter a chave de serviço (service role key) configurada
3. Verificar se existem protocolos suficientes na tabela
4. Verificar se existem colaboradores ativos

## Execução

### Opção 1: Script SQL (Recomendado)
Execute o arquivo `DISTRIBUIR_PROTOCOLOS_COLABORADORES.sql` diretamente no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo `DISTRIBUIR_PROTOCOLOS_COLABORADORES.sql`
4. Execute o script

### Opção 2: Script JavaScript
Execute o arquivo `scripts/distribuir_protocolos.js`:

```bash
cd scripts
npm install
node distribuir_protocolos.js
```

## Processo Detalhado

### 1. Verificação Inicial
- Conta quantos colaboradores ativos existem
- Lista todos os colaboradores que participarão da distribuição
- Verifica o total de protocolos disponíveis

### 2. Distribuição
- Para cada colaborador:
  - Calcula a faixa de protocolos (ex: 1-1000, 1001-2000, etc.)
  - Atualiza o campo `responsavel_id` dos protocolos na faixa
  - Registra quantos protocolos foram atribuídos

### 3. Verificação Final
- Mostra a distribuição final por colaborador
- Verifica se há protocolos sem responsável
- Mostra a distribuição por status

## Resultados Esperados

### Antes da Distribuição
- Todos os protocolos têm `responsavel_id = NULL`
- Colaboradores não têm protocolos atribuídos

### Após a Distribuição
- Cada colaborador tem exatamente 1000 protocolos (ou menos se não houver protocolos suficientes)
- Os protocolos são sequenciais por colaborador
- Pode haver protocolos sem responsável se não houver colaboradores suficientes

## Verificações Pós-Distribuição

### 1. Verificar Distribuição por Colaborador
```sql
SELECT 
    u.nome,
    MIN(p.numero_protocolo) as primeiro_protocolo,
    MAX(p.numero_protocolo) as ultimo_protocolo,
    COUNT(p.id) as total_protocolos
FROM usuarios u
LEFT JOIN protocolos p ON u.id = p.responsavel_id
WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY u.nome;
```

### 2. Verificar Protocolos Sem Responsável
```sql
SELECT COUNT(*) as protocolos_sem_responsavel
FROM protocolos 
WHERE responsavel_id IS NULL;
```

### 3. Verificar Distribuição por Status
```sql
SELECT 
    status,
    COUNT(*) as quantidade
FROM protocolos 
GROUP BY status
ORDER BY status;
```

## Troubleshooting

### Erro: "missing FROM-clause entry for table u"
**Causa:** Este erro ocorre quando há consultas `UNION ALL` com `ORDER BY` que referenciam aliases não definidos no primeiro `SELECT`.

**Solução:** O script foi corrigido separando os `SELECT` de cabeçalho dos `SELECT` de dados. Agora cada consulta é executada independentemente.

### Erro: "UNION types text and integer cannot be matched"
**Causa:** Tentativa de unir valores de tipos diferentes em uma consulta `UNION`.

**Solução:** Usar cast explícito (`::TEXT`) para converter valores numéricos para texto.

### Erro: "column status does not exist"
**Causa:** `ORDER BY` aplicado a uma consulta `UNION` onde a coluna não está disponível no contexto.

**Solução:** Separar as consultas `UNION` em consultas individuais.

## Logs e Monitoramento

### Durante a Execução
O script SQL usa `RAISE NOTICE` para mostrar:
- Total de protocolos e colaboradores
- Avisos se não há protocolos suficientes
- Para cada colaborador: nome, ID, faixa de protocolos
- Quantidade de protocolos atribuídos por colaborador

### Logs do JavaScript
O script JavaScript mostra logs detalhados:
- `🚀` - Início de operações
- `✅` - Sucessos
- `❌` - Erros
- `📊` - Informações estatísticas
- `🎉` - Conclusão bem-sucedida

## Reversão (Se Necessário)

Para reverter a distribuição e deixar todos os protocolos sem responsável:

```sql
UPDATE protocolos 
SET responsavel_id = NULL;
```

## Notas Importantes

1. **Backup:** Sempre faça backup antes de executar scripts de distribuição
2. **Horário:** Execute em horários de baixo tráfego
3. **Teste:** Teste primeiro em um ambiente de desenvolvimento
4. **Monitoramento:** Monitore o desempenho durante a execução
5. **Verificação:** Sempre verifique os resultados após a execução

## Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme se as permissões estão corretas
3. Verifique se a conexão com o banco está estável
4. Consulte a seção de troubleshooting acima 