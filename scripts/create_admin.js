// Script para criar um novo usuário administrador
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase via variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    console.log('Iniciando criação de usuário administrador...');
    
    const userData = {
      nome: 'Novo Administrador',
      email: 'novo.admin@sistema.com',
      senha_hash: 'admin123', // Em produção, use uma senha forte
      tipo_usuario: 'admin',
      ativo: true
    };
    
    // Chamar a função RPC diretamente
    const { data, error } = await supabase.rpc('create_user', {
      p_nome: userData.nome,
      p_email: userData.email,
      p_senha_hash: userData.senha_hash,
      p_tipo_usuario: userData.tipo_usuario,
      p_ativo: userData.ativo
    });
    
    if (error) {
      throw new Error(`Erro na chamada RPC: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error(`Falha na criação do usuário: ${data?.message || 'Sem mensagem de erro'}`);
    }
    
    console.log('Usuário administrador criado com sucesso:', data.data);
    console.log('Você pode fazer login com:');
    console.log('Email:', userData.email);
    console.log('Senha:', userData.senha_hash);
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error.message);
  } finally {
    process.exit(0);
  }
}

// Executar a função
createAdminUser();