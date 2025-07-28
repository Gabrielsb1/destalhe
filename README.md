# Sistema de Verificação de Protocolos

Sistema web para controle de verificação de protocolos realizado aos sábados por colaboradores.

## Funcionalidades

### Para Colaboradores
- Login seguro
- Visualizar protocolos pendentes
- Marcar protocolos como "cancelado" ou "dados excluídos"
- Adicionar observações
- Acompanhar progresso da meta diária (48 protocolos)

### Para Administradores
- Gerenciar usuários
- Importar protocolos via CSV
- Painel de controle com estatísticas
- Relatórios de produtividade
- Controle de metas por sábado

## Tecnologias

- **Frontend**: React 18
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **UI**: Lucide React Icons
- **Notificações**: React Hot Toast

## Configuração do Banco de Dados

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anon key

### 2. Executar scripts SQL
Execute os scripts em `database/schema.sql` no SQL Editor do Supabase.

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` com:
```
REACT_APP_SUPABASE_URL=sua_url_aqui
REACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Instalação

```bash
npm install
npm start
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── services/           # Serviços (Supabase)
├── utils/              # Utilitários
└── styles/             # Estilos CSS
```

## Regras de Negócio

1. Qualquer colaborador pode pegar qualquer protocolo pendente
2. Ao abrir um protocolo, ele muda para "em_andamento"
3. Apenas quem iniciou pode finalizar o protocolo
4. Protocolos finalizados não podem ser alterados
5. Meta diária: 48 protocolos por sábado
