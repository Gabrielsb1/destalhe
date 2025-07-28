# Configuração do Vercel

## Variáveis de Ambiente Necessárias

Após o deploy, você precisa configurar as seguintes variáveis de ambiente no dashboard do Vercel:

### 1. Acesse o Dashboard do Vercel
- Vá para https://vercel.com/dashboard
- Selecione seu projeto "destalhe"

### 2. Configure as Variáveis de Ambiente
- Vá para **Settings** → **Environment Variables**
- Adicione as seguintes variáveis:

```
REACT_APP_SUPABASE_URL=https://zhwmzlqeiwaawzsrcbsd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod216bHFlaXdhYXd6c3JjYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjU1NDQsImV4cCI6MjA2OTA0MTU0NH0.xO7GhtD4N2-8kR_hsBF30KD1AOon8FSFCcAVlSyF0fo
```

### 3. Redeploy
- Após configurar as variáveis, faça um novo deploy:
- Vá para **Deployments** → **Redeploy** no último deployment

### 4. Verificação
- Acesse a URL do seu projeto
- Abra o console do navegador (F12)
- Verifique se aparecem os logs:
  - `🌐 Ambiente: production`
  - `🔗 Supabase URL configurada: true`
  - `🔑 Supabase Key configurada: true`

## Problemas Comuns

### Se os protocolos não aparecerem:
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique o console do navegador para erros
3. Faça um redeploy após configurar as variáveis

### Se houver erro de autenticação:
1. Verifique se o Supabase está funcionando
2. Verifique se as credenciais estão corretas
3. Teste o login com as credenciais de teste 