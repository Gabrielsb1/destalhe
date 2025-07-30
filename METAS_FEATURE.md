# Funcionalidade de Gerenciamento de Metas

## Visão Geral

A funcionalidade de gerenciamento de metas permite que administradores configurem metas diárias personalizadas para os colaboradores, oferecendo flexibilidade para ajustar as expectativas de produtividade conforme necessário.

## Características Principais

### 1. Meta Padrão
- **Valor padrão**: 48 protocolos por dia
- **Aplicação**: Usado automaticamente quando não há meta específica configurada para uma data

### 2. Metas Personalizadas
- **Configuração por data**: Cada data pode ter sua própria meta
- **Flexibilidade**: Metas podem ser aumentadas ou diminuídas conforme necessário
- **Persistência**: Metas são salvas no banco de dados e aplicadas automaticamente

### 3. Interface do Administrador

#### Acesso
- Aba "Metas" no painel administrativo
- Ícone de alvo (Target) na navegação

#### Funcionalidades
- **Visualizar metas**: Lista todas as metas configuradas
- **Criar nova meta**: Definir meta para uma data específica
- **Editar meta**: Modificar meta existente
- **Excluir meta**: Remover meta específica
- **Destaque do dia**: Meta de hoje é destacada visualmente

#### Interface
- Formulário intuitivo com campos de data e quantidade
- Lista organizada por data (mais recentes primeiro)
- Indicadores visuais para meta do dia atual
- Confirmação antes de excluir metas

### 4. Impacto no Sistema

#### Painel do Administrador
- **Dashboard**: Mostra progresso baseado na meta do dia
- **Estatísticas**: Calcula percentual de conclusão da meta
- **Indicadores**: Status "Meta Atingida" ou "Em Progresso"

#### Painel do Colaborador
- **Progresso**: Exibe progresso atual vs meta do dia
- **Barra de progresso**: Visualização gráfica do progresso
- **Mensagens motivacionais**: Feedback baseado no progresso

## Estrutura do Banco de Dados

### Tabela `metas`
```sql
CREATE TABLE public.metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data_meta date NOT NULL,
  meta_qtd integer NOT NULL DEFAULT 48,
  criado_em timestamp with time zone NULL DEFAULT now(),
  atualizado_em timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT metas_pkey PRIMARY KEY (id),
  CONSTRAINT metas_data_meta_key UNIQUE (data_meta)
);
```

### Campos
- `id`: Identificador único da meta
- `data_meta`: Data para qual a meta se aplica (única)
- `meta_qtd`: Quantidade de protocolos para a meta
- `criado_em`: Data de criação do registro
- `atualizado_em`: Data da última atualização

## Arquivos Implementados

### 1. Serviço de Metas
- **Arquivo**: `src/services/metaService.js`
- **Funções**:
  - `getMeta(data)`: Buscar meta para data específica
  - `setMeta(data, meta_qtd)`: Definir/atualizar meta
  - `getAllMetas()`: Listar todas as metas
  - `deleteMeta(id)`: Excluir meta
  - `getCurrentMeta()`: Meta do dia atual
  - `getWeekMeta(startDate)`: Metas de uma semana

### 2. Componente de Gerenciamento
- **Arquivo**: `src/components/MetaManager.js`
- **Funcionalidades**:
  - Interface completa para CRUD de metas
  - Validação de dados
  - Feedback visual e notificações
  - Responsivo e acessível

### 3. Integração no AdminDashboard
- **Arquivo**: `src/pages/AdminDashboard.js`
- **Modificações**:
  - Importação do MetaManager
  - Atualização da aba "Metas"
  - Cálculo de estatísticas usando metas dinâmicas

### 4. Integração no CollaboratorDashboard
- **Arquivo**: `src/pages/CollaboratorDashboard.js`
- **Modificações**:
  - Uso do novo serviço de metas
  - Exibição de progresso baseado na meta do dia

## Fluxo de Funcionamento

### 1. Configuração de Meta
1. Administrador acessa aba "Metas"
2. Clica em "Nova Meta"
3. Seleciona data e define quantidade
4. Salva a configuração

### 2. Aplicação da Meta
1. Sistema busca meta para a data atual
2. Se não encontrar, usa valor padrão (48)
3. Aplica meta nos cálculos de progresso
4. Atualiza interface com novos valores

### 3. Monitoramento
1. Colaboradores veem progresso vs meta
2. Administradores acompanham estatísticas
3. Sistema calcula percentuais automaticamente

## Benefícios

### Para Administradores
- **Flexibilidade**: Ajustar metas conforme demanda
- **Visibilidade**: Acompanhar progresso real vs esperado
- **Controle**: Gerenciar expectativas de produtividade

### Para Colaboradores
- **Clareza**: Saber exatamente qual é a meta do dia
- **Motivação**: Ver progresso em tempo real
- **Feedback**: Receber reconhecimento ao atingir meta

### Para o Sistema
- **Escalabilidade**: Suporte a diferentes metas por período
- **Manutenibilidade**: Código organizado e reutilizável
- **Confiabilidade**: Validações e tratamento de erros

## Considerações Técnicas

### Performance
- Metas são buscadas apenas quando necessário
- Cache implícito através do estado do React
- Queries otimizadas no Supabase

### Segurança
- Apenas administradores podem gerenciar metas
- Validação de dados no frontend e backend
- Controle de acesso via RLS do Supabase

### Usabilidade
- Interface intuitiva e responsiva
- Feedback visual claro
- Confirmações para ações destrutivas

## Próximos Passos Sugeridos

1. **Histórico de Metas**: Visualizar mudanças ao longo do tempo
2. **Metas por Período**: Configurar metas semanais/mensais
3. **Relatórios**: Exportar dados de progresso vs metas
4. **Notificações**: Alertas quando metas são atingidas
5. **Gamificação**: Sistema de conquistas baseado em metas 