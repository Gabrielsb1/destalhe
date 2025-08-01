# Guia de Distribuição de Protocolos entre 10 Colaboradores

## Objetivo
Distribuir automaticamente os **23.096 protocolos** da tabela `protocolos` entre **10 colaboradores ativos**, de forma que cada colaborador receba **1.000 protocolos sequenciais**.

## Cálculo da Distribuição
- **Total de protocolos:** 23.096
- **Colaboradores disponíveis:** 10
- **Protocolos por colaborador:** 1.000
- **Protocolos distribuídos:** 10.000 (10 × 1.000)
- **Protocolos sem responsável:** 13.096 (23.096 - 10.000)
- **Distribuição:** Sequencial por número de protocolo

## Como Funciona
- Cada colaborador ativo recebe exatamente 1.000 protocolos
- Os protocolos são distribuídos sequencialmente:
  - **Colaborador 1:** Protocolos 1 a 1.000
  - **Colaborador 2:** Protocolos 1.001 a 2.000
  - **Colaborador 3:** Protocolos 2.001 a 3.000
  - ...
  - **Colaborador 10:** Protocolos 9.001 a 10.000
  - **Sem responsável:** Protocolos 10.001 a 23.096 (13.096 protocolos)

## Pré-requisitos
1. ✅ Ter acesso ao banco de dados Supabase
2. ✅ Ter a chave de serviço (service role key) configurada
3. ✅ Verificar se existem pelo menos 10 colaboradores ativos
4. ✅ Confirmar que existem 23.096 protocolos na tabela

## Opções de Execução

### Opção 1: Script SQL (Recomendado)
Execute o arquivo `DISTRIBUIR_PROTOCOLOS_10_COLABORADORES.sql` diretamente no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo `DISTRIBUIR_PROTOCOLOS_10_COLABORADORES.sql`
4. Execute o script

### Opção 2: Script JavaScript
Execute o arquivo `scripts/distribuir_protocolos_10_colaboradores.js`:

```bash
cd scripts
npm install
node distribuir_protocolos_10_colaboradores.js
```

## Processo Detalhado

### 1. Verificação Inicial
- ✅ Conta quantos colaboradores ativos existem (deve ser 10)
- ✅ Lista todos os colaboradores que participarão da distribuição
- ✅ Verifica o total de protocolos disponíveis (deve ser 23.096)
- ✅ Verifica protocolos sem responsável

### 2. Análise da Distribuição
- ✅ Calcula quantos protocolos serão distribuídos (10.000)
- ✅ Calcula quantos protocolos ficarão sem responsável (13.096)
- ✅ Mostra a distribuição planejada para cada colaborador

### 3. Distribuição
- ✅ Limpa responsáveis existentes
- ✅ Para cada colaborador:
  - Calcula a faixa de protocolos (ex: 1-1000, 1001-2000, etc.)
  - Atualiza o campo `responsavel_id` dos protocolos na faixa
  - Registra quantos protocolos foram atribuídos

### 4. Verificação Final
- ✅ Mostra a distribuição final por colaborador
- ✅ Verifica se há protocolos sem responsável (13.096)
- ✅ Mostra a distribuição por status
- ✅ Apresenta resumo final

## Resultados Esperados

### Antes da Distribuição
- Todos os protocolos têm `responsavel_id = NULL`
- Colaboradores não têm protocolos atribuídos

### Após a Distribuição
- **10 colaboradores** têm exatamente **1.000 protocolos** cada
- **13.096 protocolos** ficam sem responsável
- Os protocolos são sequenciais por colaborador
- Protocolos 10.001 a 23.096 ficam sem responsável

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

### 3. Verificar Faixa de Protocolos Sem Responsável
```sql
SELECT 
    MIN(numero_protocolo) as primeiro_protocolo_sem_responsavel,
    MAX(numero_protocolo) as ultimo_protocolo_sem_responsavel
FROM protocolos 
WHERE responsavel_id IS NULL;
```

## Exemplo de Distribuição Esperada

```
Colaborador 1 (Maria):   protocolos 1      a 1.000    (1.000 protocolos)
Colaborador 2 (João):    protocolos 1.001  a 2.000    (1.000 protocolos)
Colaborador 3 (Ana):     protocolos 2.001  a 3.000    (1.000 protocolos)
Colaborador 4 (Pedro):   protocolos 3.001  a 4.000    (1.000 protocolos)
Colaborador 5 (Carla):   protocolos 4.001  a 5.000    (1.000 protocolos)
Colaborador 6 (Lucas):   protocolos 5.001  a 6.000    (1.000 protocolos)
Colaborador 7 (Julia):   protocolos 6.001  a 7.000    (1.000 protocolos)
Colaborador 8 (Rafael):  protocolos 7.001  a 8.000    (1.000 protocolos)
Colaborador 9 (Fernanda): protocolos 8.001 a 9.000    (1.000 protocolos)
Colaborador 10 (Diego):  protocolos 9.001 a 10.000    (1.000 protocolos)
Sem responsável:         protocolos 10.001 a 23.096   (13.096 protocolos)
```

## Troubleshooting

### Erro: "Colaboradores insuficientes"
**Causa:** Menos de 10 colaboradores ativos.

**Solução:** 
1. Adicione mais colaboradores na tabela `usuarios`
2. Ou ajuste o script para o número real de colaboradores

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
- Protocolos que serão distribuídos vs. sem responsável
- Para cada colaborador: nome, ID, faixa de protocolos
- Quantidade de protocolos atribuídos por colaborador

## Reversão (Se Necessário)

Para reverter a distribuição e deixar todos os protocolos sem responsável:

```sql
UPDATE protocolos 
SET responsavel_id = NULL;
```

## Próximos Passos

### Para Distribuir os Protocolos Restantes
Quando você tiver mais colaboradores disponíveis, pode:

1. **Adicionar mais colaboradores** na tabela `usuarios`
2. **Executar o script novamente** para distribuir os 13.096 protocolos restantes
3. **Ou criar um script específico** para distribuir apenas os protocolos sem responsável

### Script para Distribuir Protocolos Restantes
```sql
-- Distribuir apenas protocolos sem responsável
UPDATE protocolos 
SET responsavel_id = (
    SELECT u.id 
    FROM usuarios u 
    WHERE u.tipo_usuario = 'colaborador' AND u.ativo = true
    ORDER BY u.nome
    LIMIT 1
)
WHERE responsavel_id IS NULL
LIMIT 1000; -- Distribuir 1000 por vez
```

## Notas Importantes

1. **Backup:** Sempre faça backup antes de executar scripts de distribuição
2. **Horário:** Execute em horários de baixo tráfego
3. **Teste:** Teste primeiro em um ambiente de desenvolvimento
4. **Monitoramento:** Monitore o desempenho durante a execução
5. **Verificação:** Sempre verifique os resultados após a execução
6. **Colaboradores:** Certifique-se de ter pelo menos 10 colaboradores ativos
7. **Protocolos restantes:** Os 13.096 protocolos sem responsável podem ser distribuídos posteriormente

## Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme se as permissões estão corretas
3. Verifique se a conexão com o banco está estável
4. Consulte a seção de troubleshooting acima
5. Verifique se há pelo menos 10 colaboradores ativos 