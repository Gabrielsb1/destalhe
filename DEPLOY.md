# 🚀 Guia de Deploy - Sistema de Verificação de Protocolos

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [Supabase](https://supabase.com) (gratuita)
- Projeto no GitHub

## 🔧 Configuração do Supabase

1. **Acesse o Supabase Dashboard**
2. **Copie as credenciais do seu projeto:**
   - URL: `https://seu-projeto-id.supabase.co`
   - Anon Key: `sua-chave-anon-aqui`

## 🚀 Deploy no Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. **Faça push do código para o GitHub**
   ```bash
   git add .
   git commit -m "Preparando para deploy"
   git push origin main
   ```

2. **Acesse [vercel.com](https://vercel.com)**
3. **Clique em "New Project"**
4. **Importe seu repositório do GitHub**
5. **Configure as variáveis de ambiente:**
   - `REACT_APP_SUPABASE_URL`: `https://seu-projeto-id.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY`: `sua-chave-anon-aqui`
6. **Clique em "Deploy"**

### Opção 2: Deploy via CLI

1. **Instale o Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Faça login:**
   ```bash
   vercel login
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   vercel env add REACT_APP_SUPABASE_URL
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## 🔒 Configurações de Segurança

### Supabase
1. **Configure RLS (Row Level Security)**
2. **Defina políticas de acesso**
3. **Configure autenticação**

### Vercel
1. **Configure domínio personalizado** (opcional)
2. **Configure SSL automático**
3. **Configure cache**

## 📊 Monitoramento

### Vercel Analytics
- Acesse o dashboard do Vercel
- Monitore performance e erros
- Configure alertas

### Supabase
- Monitore uso do banco de dados
- Configure backups automáticos
- Monitore queries lentas

## 🔧 Manutenção

### Atualizações
1. **Faça alterações no código**
2. **Push para GitHub**
3. **Vercel faz deploy automático**

### Backup
- Supabase faz backup automático
- Configure backup manual se necessário

## 💰 Custos

### Vercel (Gratuito)
- 100GB de banda/mês
- Deploy ilimitado
- Domínio personalizado

### Supabase (Gratuito)
- 500MB de banco de dados
- 2GB de banda/mês
- 50.000 requests/mês

## 🚨 Limites para 15 Usuários

### Vercel
- ✅ Suporte ilimitado
- ✅ Performance excelente

### Supabase
- ⚠️ 50.000 requests/mês (gratuito)
- ⚠️ 500MB de banco (gratuito)
- 💡 Considere plano Pro ($25/mês) para mais usuários

## 📞 Suporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Documentação**: [vercel.com/docs](https://vercel.com/docs) 