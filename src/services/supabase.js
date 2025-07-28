import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase via variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zhwmzlqeiwaawzsrcbsd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod216bHFlaXdhYXd6c3JjYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjU1NDQsImV4cCI6MjA2OTA0MTU0NH0.xO7GhtD4N2-8kR_hsBF30KD1AOon8FSFCcAVlSyF0fo';

// Log para debug em produção
console.log('🌐 Ambiente:', process.env.NODE_ENV);
console.log('🔗 Supabase URL configurada:', !!supabaseUrl);
console.log('🔑 Supabase Key configurada:', !!supabaseAnonKey);

console.log('🔍 Debug - Variáveis de ambiente:');
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl);
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');

// Verificar se as variáveis estão configuradas
if (!supabaseUrl) {
  console.error('❌ REACT_APP_SUPABASE_URL não configurada');
  throw new Error('REACT_APP_SUPABASE_URL não configurada');
}

if (!supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY não configurada');
  throw new Error('REACT_APP_SUPABASE_ANON_KEY não configurada');
}

if (supabaseUrl.includes('sua_url') || supabaseUrl.includes('seu-projeto')) {
  console.error('❌ REACT_APP_SUPABASE_URL contém valor de exemplo');
  throw new Error('REACT_APP_SUPABASE_URL contém valor de exemplo');
}

if (supabaseAnonKey.includes('sua_chave') || supabaseAnonKey.includes('sua-chave-anon')) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY contém valor de exemplo');
  throw new Error('REACT_APP_SUPABASE_ANON_KEY contém valor de exemplo');
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Serviços de autenticação
export const authService = {
  // Login
  async signIn(email, password) {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase não configurado. Verifique as variáveis de ambiente.' } };
    }
    
    console.log('Tentando fazer login com email:', email);
    
    try {
      // Usar uma função RPC personalizada para buscar o usuário sem afetar o RLS
      const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', {
        user_email: email
      });
      
      console.log('Resposta da consulta ao usuário:', { userData, userError });

      if (userError || !userData || userData.length === 0) {
        console.error('Erro ao buscar usuário:', userError);
        return { data: null, error: { message: 'Credenciais inválidas.' } };
      }
      
      // A função RPC retorna um array, então pegamos o primeiro item
      const user = userData[0];

      // Verificação básica de senha (em produção, use bcrypt)
      if (!user.senha_hash) {
        return { data: null, error: { message: 'Senha inválida.' } };
      }

      // Se chegou até aqui, o login foi bem-sucedido
      const userObj = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.nome,
          user_type: user.tipo_usuario
        },
        tipo_usuario: user.tipo_usuario
      };

      // Salvar usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userObj));

      return { 
        data: { 
          user: userObj
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro durante o login:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro ao processar o login. Por favor, tente novamente.' 
        } 
      };
    }
  },

  // Logout
  async signOut() {
    // Como não estamos usando o auth do Supabase, apenas limpamos o localStorage
    localStorage.removeItem('user');
    return { error: null };
  },

  // Obter usuário atual
  async getCurrentUser() {
    console.log('Buscando usuário no localStorage...')
    const userStr = localStorage.getItem('user')
    
    if (!userStr) {
      console.log('Nenhum usuário encontrado no localStorage')
      return { data: null, error: { message: 'Nenhum usuário logado' } }
    }
    
    try {
      console.log('Usuário encontrado no localStorage, fazendo parse...')
      const user = JSON.parse(userStr)
      console.log('Usuário parseado com sucesso:', { 
        id: user.id, 
        email: user.email,
        tipo_usuario: user.tipo_usuario
      })
      return { data: user, error: null }
    } catch (error) {
      console.error('Erro ao analisar usuário do localStorage:', error)
      return { data: null, error: { message: 'Erro ao recuperar dados do usuário' } }
    }
  },

  // Verificar se é admin
  async isAdmin() {
    const { data: user } = await this.getCurrentUser()
    return user?.tipo_usuario === 'admin' || user?.user_metadata?.user_type === 'admin';
  }
}

// Importar o serviço de usuário unificado
export { userService } from './userService';

// Serviços de protocolos
export const protocolService = {
  // Listar protocolos com paginação
  async listarProtocolos(pagina = 1, itensPorPagina = 20) {
    try {
      // Primeiro, buscar todos os protocolos necessários
      const { data, error } = await supabase
        .from('protocolos')
        .select('*', { count: 'exact' });

      if (error) throw error;

      // Ordenar os resultados numericamente no cliente
      const protocolosOrdenados = (data || []).sort((a, b) => {
        // Extrair apenas números dos códigos de protocolo
        const numA = parseInt((a.numero_protocolo || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.numero_protocolo || '').replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      // Aplicar paginação
      const inicio = (pagina - 1) * itensPorPagina;
      const dadosPaginados = protocolosOrdenados.slice(inicio, inicio + itensPorPagina);
      
      return {
        data: dadosPaginados,
        total: protocolosOrdenados.length,
        totalPaginas: Math.ceil(protocolosOrdenados.length / itensPorPagina),
        paginaAtual: pagina
      };
    } catch (error) {
      console.error('Erro ao listar protocolos:', error);
      return {
        data: [],
        total: 0,
        totalPaginas: 0,
        paginaAtual: 1,
        error
      };
    }
  },

  // Buscar protocolo por número
  async buscarPorNumero(numero) {
    try {
      const { data, error } = await supabase
        .from('protocolos')
        .select('*')
        .eq('numero_protocolo', numero.toString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar protocolo:', error);
      throw error;
    }
  },

  // Extrair número do protocolo (já é um número, apenas converter para inteiro)
  extractProtocolNumber(protocolo) {
    if (!protocolo) return 0;
    // Se for um número direto, converter para inteiro
    const num = parseInt(protocolo, 10);
    return isNaN(num) ? 0 : num;
  },

  // Listar protocolos disponíveis para colaborador
    async getAvailable() {
    try {
      console.log('🔍 getAvailable - Iniciando busca de protocolos...');
      
      // Obter o usuário atual do localStorage
      const userStr = localStorage.getItem('user');
      console.log('🔍 getAvailable - userStr do localStorage:', userStr);

      if (!userStr) {
        console.error('❌ getAvailable - Usuário não autenticado');
        return { data: [], error: 'Usuário não autenticado' };
      }

      const user = JSON.parse(userStr);
      console.log('🔍 getAvailable - Usuário parseado:', user);

      if (!user || !user.id) {
        console.error('❌ getAvailable - Usuário inválido no localStorage');
        return { data: [], error: 'Usuário inválido' };
      }

      console.log('✅ getAvailable - Usuário autenticado:', user);
      
            // Primeiro, buscar TODOS os protocolos para debug
      console.log('🔍 getAvailable - Buscando TODOS os protocolos...');
      const { data: todosProtocolos, error: errorTodos } = await supabase
        .from('protocolos')
        .select('*')
        .order('numero_protocolo', { ascending: true });

      console.log('📊 getAvailable - TODOS os protocolos no banco:', todosProtocolos);
      console.log('📊 getAvailable - Total de protocolos no banco:', todosProtocolos?.length || 0);

      if (errorTodos) {
        console.error('❌ getAvailable - Erro ao buscar todos os protocolos:', errorTodos);
        throw errorTodos;
      }
      
      // Buscar protocolos pendentes
      console.log('🔍 getAvailable - Buscando protocolos pendentes...');
      const { data: protocolosPendentes, error: errorPendentes } = await supabase
        .from('protocolos')
        .select('*')
        .eq('status', 'pendente')
        .order('numero_protocolo', { ascending: true });
      
      console.log('📊 getAvailable - Protocolos pendentes:', protocolosPendentes);
      console.log('📊 getAvailable - Total de protocolos pendentes:', protocolosPendentes?.length || 0);
      
      if (errorPendentes) {
        console.error('❌ getAvailable - Erro ao buscar protocolos pendentes:', errorPendentes);
        throw errorPendentes;
      }
      
      // Buscar protocolos em andamento pelo usuário atual
      console.log('🔍 getAvailable - Buscando protocolos em andamento para usuário ID:', user.id);
      const { data: protocolosEmAndamento, error: errorEmAndamento } = await supabase
        .from('protocolos')
        .select('*')
        .eq('status', 'em_andamento')
        .eq('responsavel_id', user.id)
        .order('numero_protocolo', { ascending: true });
      
      console.log('📊 getAvailable - Protocolos em andamento:', protocolosEmAndamento);
      console.log('📊 getAvailable - Total de protocolos em andamento:', protocolosEmAndamento?.length || 0);
      
      if (errorEmAndamento) {
        console.error('❌ getAvailable - Erro ao buscar protocolos em andamento:', errorEmAndamento);
        throw errorEmAndamento;
      }
      
      // Combinar os resultados
      const protocolos = [
        ...(protocolosEmAndamento || []),
        ...(protocolosPendentes || [])
      ];
      
      console.log('Protocolos disponíveis para o usuário:', protocolos);
      console.log('Total de protocolos disponíveis:', protocolos?.length || 0);
      return { 
        data: protocolos || [], 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao buscar protocolos disponíveis:', error);
      return { data: [], error };
    }
  },

  // Listar todos os protocolos (admin) ou do usuário (colaborador)
  async getAll(filters = {}) {
    try {
      console.log('Buscando protocolos com filtros:', filters);
      
      // Primeiro, buscar todos os protocolos com os filtros aplicados
      let query = supabase
        .from('protocolos')
        .select(`
          *,
          responsavel:responsavel_id (id, nome)
        `, { count: 'exact' });
      
      // Aplicar filtros
      if (filters.status && filters.status !== 'todos') {
        console.log('Aplicando filtro de status:', filters.status);
        query = query.eq('status', filters.status);
      } else {
        console.log('Nenhum filtro de status aplicado - buscando todos os protocolos');
      }
      
      if (filters.usuario_id) {
        query = query.eq('usuario_responsavel', filters.usuario_id);
      }
      
      if (filters.data_inicio) {
        try {
          const date = new Date(filters.data_inicio);
          if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
            query = query.gte('criado_em', date.toISOString());
          }
        } catch (e) {
          console.warn('Formato de data_inicio inválido:', filters.data_inicio);
        }
      }
      
      if (filters.data_fim) {
        try {
          const date = new Date(filters.data_fim);
          if (!isNaN(date.getTime())) {
            date.setHours(23, 59, 59, 999);
            query = query.lte('criado_em', date.toISOString());
          }
        } catch (e) {
          console.warn('Formato de data_fim inválido:', filters.data_fim);
        }
      }
      
      // Ordenar por número do protocolo (crescente)
      query = query.order('numero_protocolo', { ascending: true });
      console.log('Ordenação aplicada: numero_protocolo ASC');
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Erro ao buscar protocolos:', error);
        return { data: null, error };
      }
      
      console.log('Protocolos encontrados:', data);
      console.log('Total de protocolos encontrados:', data?.length || 0);
      console.log('Status dos protocolos encontrados:', data?.map(p => ({ id: p.id, numero: p.numero_protocolo, status: p.status })) || []);
      
      // Verificar se há protocolos pendentes especificamente
      if (data && data.length > 0) {
        const pendentes = data.filter(p => p.status === 'pendente');
        console.log('Protocolos pendentes encontrados:', pendentes.length);
        console.log('Números dos protocolos pendentes:', pendentes.map(p => p.numero_protocolo));
      }
      
      return { data, error: null, count };
      
    } catch (error) {
      console.error('Erro inesperado ao buscar protocolos:', error);
      return { data: null, error };
    }
  },

  // Buscar verificações em lotes
  async getVerificationsBatch(protocolIds) {
    // Split into chunks of 50 IDs to avoid URL length issues
    const chunkSize = 50;
    const chunks = [];
    
    for (let i = 0; i < protocolIds.length; i += chunkSize) {
      chunks.push(protocolIds.slice(i, i + chunkSize));
    }

    let allVerifications = [];
    
    // Process each chunk
    for (const chunk of chunks) {
      const { data, error } = await supabase
        .from('verificacoes')
        .select('*')
        .in('protocolo_id', chunk);

      if (error) {
        console.error('Error fetching verifications batch:', error);
        throw error;
      }
      
      allVerifications = [...allVerifications, ...(data || [])];
    }

    return allVerifications;
  },

  // Função auxiliar para ordenar protocolos numericamente
  sortProtocols(protocols) {
    return [...(protocols || [])].sort((a, b) => {
      const numA = this.extractProtocolNumber(a.numero_protocolo);
      const numB = this.extractProtocolNumber(b.numero_protocolo);
      return numA - numB;
    });
  },

  // Iniciar protocolo
  async start(protocolId, userId) {
    console.log('Iniciando protocolo:', { protocolId, userId });
    
    try {
      console.log('1. Verificando status do protocolo...');
      // Primeiro verificar se o protocolo ainda está disponível
      const { data: protocol, error: checkError } = await supabase
        .from('protocolos')
        .select('status, numero_protocolo')
        .eq('id', protocolId)
        .single();

      console.log('2. Resposta da verificação:', { protocol, checkError });
      
      if (checkError) {
        console.error('Erro ao verificar protocolo:', checkError);
        throw checkError;
      }
      
      // Se o protocolo já está em andamento ou finalizado, não permitir
      if (protocol.status !== 'pendente') {
        const msg = `Protocolo já está com status: ${protocol.status}`;
        console.log('3. Status inválido:', msg);
        return { 
          data: null, 
          error: { 
            message: 'Este protocolo já está em andamento ou foi finalizado.' 
          } 
        };
      }

      console.log('4. Atualizando protocolo para em_andamento...');
      // Atualizar o protocolo para em_andamento
      const { data, error } = await supabase
        .from('protocolos')
        .update({ 
          status: 'em_andamento',
          responsavel_id: userId,
          observacoes: `Início da verificação do protocolo ${protocol.numero_protocolo}`,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', protocolId)
        .select()
        .single();
        
      console.log('5. Resposta da atualização:', { data, error });
      
      if (error) {
        console.error('Erro ao atualizar protocolo:', error);
        throw error;
      }
      
      console.log('6. Protocolo atualizado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao iniciar protocolo:', error);
      return { 
        data: null, 
        error: error.message ? error : { message: 'Erro ao iniciar a verificação do protocolo.' } 
      };
    }
  },

  // Finalizar protocolo
  async finish(protocolId, status, observacoes = '') {
    console.log('Iniciando finalização do protocolo:', { protocolId, status, observacoes });
    
    try {
      // Atualizar o status do protocolo
      const { data: updatedProtocol, error: updateError } = await supabase
        .from('protocolos')
        .update({ 
          status: status,
          observacoes: observacoes,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', protocolId)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar protocolo:', updateError);
        throw updateError;
      }

      console.log('Protocolo atualizado com sucesso:', updatedProtocol);
      return { 
        data: updatedProtocol,
        error: null 
      };
      
    } catch (error) {
      console.error('Erro ao finalizar protocolo:', error);
      return { 
        data: null, 
        error: error.message || 'Erro ao finalizar protocolo' 
      };
    }
  },

  // Importar protocolos em lote
  async importBatch(protocolos) {
    const { data, error } = await supabase
      .from('protocolos')
      .insert(protocolos)
      .select()
    return { data, error }
  },

  // Obter estatísticas do dia
  async getDayStats(date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('protocolos')
      .select(`
        usuario_responsavel,
        usuarios(nome),
        status
      `)
      .gte('data_verificacao', startOfDay.toISOString())
      .lte('data_verificacao', endOfDay.toISOString())
      .in('status', ['cancelado', 'dados_excluidos'])

    return { data, error }
  },

  // Obter progresso do usuário no dia
  async getUserDayProgress(userId, date = new Date()) {
    try {
      // Converter para início e fim do dia em UTC
      const startDate = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0, 0, 0, 0
      ));
      const endDate = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23, 59, 59, 999
      ));
      
      // Buscar protocolos finalizados pelo usuário no dia
      const { data: protocolos, error } = await supabase
        .from('protocolos')
        .select('*')
        .eq('responsavel_id', userId)
        .in('status', ['cancelado', 'dados_excluidos'])
        .gte('atualizado_em', startDate.toISOString())
        .lte('atualizado_em', endDate.toISOString());

      if (error) throw error;
      
      return { 
        count: protocolos ? protocolos.length : 0, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao buscar progresso do dia:', error);
      return { 
        count: 0, 
        error: error.message || 'Erro ao buscar progresso do dia' 
      };
    }
  }
}

// Serviços de metas
export const metaService = {
  // Obter meta do dia
  async getDayGoal(date = new Date()) {
    try {
      // Garantir que a data está em UTC e formatar como YYYY-MM-DD
      const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      
      // Buscar meta para o sábado correspondente
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('data_sabado', dateStr)
        .maybeSingle();

      // Se não encontrar a meta, retorna o valor padrão
      if (error) throw error;
      
      if (!data) {
        return { 
          data: { 
            data_sabado: dateStr,
            meta_qtd: 48, // Valor padrão
            created_at: new Date().toISOString()
          }, 
          error: null 
        };
      }
      
      return { 
        data: {
          data_sabado: dateStr,
          meta_qtd: data.meta_qtd || 48
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao buscar meta do dia:', error);
      return { 
        data: { 
          data_sabado: new Date().toISOString().split('T')[0],
          meta_qtd: 48 
        }, 
        error: error.message || 'Erro ao buscar meta do dia' 
      };
    }
  },

  // Definir meta do dia
  async setDayGoal(date, meta_qtd) {
    const dateStr = date.toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('metas')
      .upsert([{
        data_sabado: dateStr,
        meta_qtd
      }])
      .select()

    return { data, error }
  }
}
