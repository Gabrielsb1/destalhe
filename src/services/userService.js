import { supabase } from './supabase';

export const userService = {
  // Listar todos os usuários (apenas admin)
  async getAll() {
    try {
      // Usar RPC para contornar problemas de RLS
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        console.error('Erro ao buscar usuários via RPC:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Obter usuário por ID
  async getById(id) {
    try {
      const { data, error } = await supabase.rpc('get_user_by_id', { user_id: id });
      
      if (error) {
        console.error('Erro ao buscar usuário via RPC:', error);
        throw error;
      }
      
      return data[0] || null; // Retorna o primeiro usuário ou null
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  // Criar novo usuário usando RPC para contornar RLS
  async create(userData) {
    console.log('Iniciando criação de usuário com dados:', {
      ...userData,
      senha: '[PROTECTED]' // Não logamos a senha real
    });
    
    try {
      // Em produção, gere um hash seguro da senha aqui
      // Por enquanto, estamos usando a senha em texto puro (APENAS PARA TESTES)
      const senhaHash = userData.senha; // Substitua por um hash seguro em produção
      
      console.log('Chamando função RPC create_user...');
      const { data, error } = await supabase.rpc('create_user', {
        p_nome: userData.nome,
        p_email: userData.email,
        p_senha_hash: senhaHash,
        p_tipo_usuario: userData.tipo_usuario || 'colaborador',
        p_ativo: userData.ativo !== false // Padrão para true se não especificado
      });

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro na chamada RPC:', error);
        throw new Error(error.message || 'Erro ao chamar o servidor');
      }

      if (!data || !data.success) {
        console.error('Falha na criação do usuário:', data?.message || 'Sem mensagem de erro');
        throw new Error(data?.message || 'Falha ao criar usuário');
      }
      
      console.log('Usuário criado com sucesso:', data.data);
      return data.data;
    } catch (err) {
      console.error('Erro durante a criação do usuário:', err);
      throw new Error(err.message || 'Erro inesperado ao criar usuário');
    }
  },

  // Atualizar usuário usando RPC
  async update(userId, userData) {
    try {
      console.log('Iniciando atualização de usuário:', { userId, userData });
      
      // Garantir que temos os campos obrigatórios
      if (!userId) throw new Error('ID do usuário é obrigatório');
      if (!userData) throw new Error('Dados do usuário são obrigatórios');
      
      // Preparar apenas os campos que foram fornecidos
      const params = { p_id: userId };
      
      // Adicionar apenas os campos que foram fornecidos e não estão vazios
      if (userData.nome !== undefined) params.p_nome = userData.nome;
      if (userData.email !== undefined) params.p_email = userData.email;
      if (userData.tipo_usuario !== undefined) params.p_tipo_usuario = userData.tipo_usuario;
      if (userData.ativo !== undefined) params.p_ativo = userData.ativo;
      if (userData.senha !== undefined && userData.senha !== '') params.p_senha = userData.senha;
      
      console.log('Parâmetros para atualização:', params);
      
      console.log('Chamando RPC update_user com parâmetros:', params);
      
      // Chamar a função RPC
      const { data, error } = await supabase
        .rpc('update_user', params);

      if (error) {
        console.error('Erro ao atualizar usuário via RPC:', error);
        throw new Error(error.message || 'Erro ao atualizar usuário');
      }

      console.log('Resposta do RPC update_user:', data);
      
      // Verificar se a resposta tem o formato esperado
      if (data && data.success === false) {
        throw new Error(data.message || 'Falha ao atualizar usuário');
      }
      
      if (!data || !data.data) {
        throw new Error('Resposta inválida do servidor ao atualizar usuário');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Desativar usuário usando RPC
  async deactivate(userId) {
    try {
      const { data, error } = await supabase.rpc('deactivate_user', {
        user_id: userId
      });

      if (error) {
        console.error('Erro ao desativar usuário via RPC:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Falha ao desativar usuário');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  },
  
  // Excluir usuário permanentemente
  async delete(userId) {
    try {
      console.log('Iniciando exclusão do usuário:', userId);
      
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }
      
      const { data, error } = await supabase.rpc('delete_user', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Erro ao excluir usuário via RPC:', error);
        throw error;
      }
      
      console.log('Resposta da exclusão:', data);
      
      if (data && data.success === false) {
        throw new Error(data.message || 'Falha ao excluir usuário');
      }
      
      if (!data) {
        throw new Error('Resposta inválida do servidor ao excluir usuário');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }
};
