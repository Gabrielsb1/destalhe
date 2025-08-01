# Guia de Distribuição de 23.096 Protocolos entre Colaboradores

## Objetivo
Distribuir automaticamente os **23.096 protocolos** da tabela `protocolos` entre os colaboradores ativos, de forma que cada colaborador receba **1.000 protocolos sequenciais**.

## Cálculo da Distribuição
- **Total de protocolos:** 23.096
- **Protocolos por colaborador:** 1.000
- **Colaboradores necessários:** 24 (23 com 1.000 + 1 com 96)
- **Distribuição:** Sequencial por número de protocolo

## Como Funciona
- Cada colaborador ativo recebe exatamente 1.000 protocolos (exceto o último que recebe 96)
- Os protocolos são distribuídos sequencialmente:
  - **Colaborador 1:** Protocolos 1 a 1.000
  - **Colaborador 2:** Protocolos 1.001 a 2.000
  - **Colaborador 3:** Protocolos 2.001 a 3.000
  - ...
  - **Colaborador 23:** Protocolos 22.001 a 23.000
  - **Colaborador 24:** Protocolos 23.001 a 23.096 (96 protocolos)

## Pré-requisitos
1. ✅ Ter acesso ao banco de dados Supabase
2. ✅ Ter a chave de serviço (service role key) configurada
3. ✅ Verificar se existem pelo menos 24 colaboradores ativos
4. ✅ Confirmar que existem 23.096 protocolos na tabela

## Opções de Execução

### Opção 1: Script SQL (Recomendado)
Execute o arquivo `DISTRIBUIR_PROTOCOLOS_23K.sql` diretamente no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo `DISTRIBUIR_PROTOCOLOS_23K.sql`
4. Execute o script

### Opção 2: Script JavaScript
Execute o arquivo `scripts/distribuir_protocolos_23k.js`:

```bash
cd scripts
npm install
node distribuir_protocolos_23k.js
```

## Processo Detalhado

### 1. Verificação Inicial
- ✅ Conta quantos colaboradores ativos existem
- ✅ Lista todos os colaboradores que participarão da distribuição
- ✅ Verifica o total de protocolos disponíveis (deve ser 23.096)
- ✅ Verifica protocolos sem responsável

### 2. Análise da Distribuição
- ✅ Calcula quantos colaboradores são necessários (24)
- ✅ Verifica se há colaboradores suficientes
- ✅ Mostra a distribuição planejada para cada colaborador

### 3. Distribuição
- ✅ Limpa responsáveis existentes
- ✅ Para cada colaborador:
  - Calcula a faixa de protocolos (ex: 1-1000, 1001-2000, etc.)
  - Atualiza o campo `responsavel_id` dos protocolos na faixa
  - Registra quantos protocolos foram atribuídos

### 4. Verificação Final
- ✅ Mostra a distribuição final por colaborador
- ✅ Verifica se há protocolos sem responsável
- ✅ Mostra a distribuição por status
- ✅ Apresenta resumo final

## Resultados Esperados

### Antes da Distribuição
- Todos os protocolos têm `responsavel_id = NULL`
- Colaboradores não têm protocolos atribuídos

### Após a Distribuição
- **23 colaboradores** têm exatamente **1.000 protocolos** cada
- **1 colaborador** tem **96 protocolos**
- Os protocolos são sequenciais por colaborador
- **0 protocolos** ficam sem responsável

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
ORDER BY MIN(p.numero_protocolo);
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

## Exemplo de Distribuição Esperada

```
Colaborador 1 (Maria):   protocolos 1      a 1.000    (1.000 protocolos)
Colaborador 2 (João):    protocolos 1.001  a 2.000    (1.000 protocolos)
Colaborador 3 (Ana):     protocolos 2.001  a 3.000    (1.000 protocolos)
...
Colaborador 23 (Pedro):  protocolos 22.001 a 23.000   (1.000 protocolos)
Colaborador 24 (Carla):  protocolos 23.001 a 23.096   (96 protocolos)
```

## Troubleshooting

### Erro: "Colaboradores insuficientes"
**Causa:** Menos de 24 colaboradores ativos.

**Solução:** 
1. Adicione mais colaboradores na tabela `usuarios`
2. Ou reduza o número de protocolos por colaborador

### Erro: "Protocolos insuficientes"
**Causa:** Menos de 23.096 protocolos na tabela.

**Solução:** 
1. Verifique se todos os protocolos foram importados
2. Ou ajuste a distribuição para o número real de protocolos

### Erro: "SUPABASE_SERVICE_ROLE_KEY não configurada"
**Causa:** Chave de serviço não configurada no arquivo `.env`.

**Solução:** 
1. Adicione a chave no arquivo `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui
   ```

## Logs e Monitoramento

### Durante a Execução
O script mostra logs detalhados:
- `🚀` - Início de operações
- `📊` - Informações estatísticas
- `📦` - Distribuição de protocolos
- `✅` - Sucessos
- `❌` - Erros
- `⚠️` - Avisos importantes
- `🎉` - Conclusão bem-sucedida

### Logs do SQL
O script SQL usa `RAISE NOTICE` para mostrar:
- Total de protocolos e colaboradores
- Avisos se não há recursos suficientes
- Para cada colaborador: nome, ID, faixa de protocolos
- Quantidade de protocolos atribuídos por colaborador

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
6. **Colaboradores:** Certifique-se de ter pelo menos 24 colaboradores ativos

## Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme se as permissões estão corretas
3. Verifique se a conexão com o banco está estável
4. Consulte a seção de troubleshooting acima
5. Verifique se há pelo menos 24 colaboradores ativos 