import { supabase } from './supabase';

export const metaService = {
  // Obter meta para uma data específica
  async getMeta(data) {
    try {
      // Garantir que a data está no fuso horário local
      const dataLocal = new Date(data.getTime() - (data.getTimezoneOffset() * 60000));
      const dataStr = dataLocal.toISOString().split('T')[0];
      
      console.log('Buscando meta para data:', dataStr, 'Data original:', data);
      
      const { data: meta, error } = await supabase
        .from('metas')
        .select('*')
        .eq('data_meta', dataStr)
        .maybeSingle();

      if (error) throw error;
      
      // Se não encontrar meta, retorna o valor padrão
      if (!meta) {
        return { 
          data: { 
            data_meta: dataStr,
            meta_qtd: 48, // Valor padrão
            id: null
          }, 
          error: null 
        };
      }
      
      return { data: meta, error: null };
    } catch (error) {
      console.error('Erro ao buscar meta:', error);
      return { 
        data: null, 
        error: error.message || 'Erro ao buscar meta' 
      };
    }
  },

  // Definir meta para uma data específica (criar ou atualizar)
  async setMeta(data, meta_qtd) {
    try {
      console.log('🔍 setMeta - Iniciando definição de meta...');
      console.log('📅 Data recebida:', data);
      console.log('🎯 Quantidade recebida:', meta_qtd);
      
      // Se a data já é uma string (YYYY-MM-DD), usar diretamente
      let dataStr;
      if (typeof data === 'string') {
        dataStr = data;
        console.log('📅 Data já é string:', dataStr);
      } else {
        // Garantir que a data está no fuso horário local
        const dataLocal = new Date(data.getTime() - (data.getTimezoneOffset() * 60000));
        dataStr = dataLocal.toISOString().split('T')[0];
        console.log('📅 Data convertida para string:', dataStr);
      }
      
      console.log('📅 Data final para salvar:', dataStr);
      console.log('🎯 Quantidade final:', meta_qtd);
      
      // Validar dados
      if (!dataStr || !meta_qtd || meta_qtd < 1) {
        const errorMsg = 'Dados inválidos para meta';
        console.error('❌ setMeta -', errorMsg);
        return { data: null, error: errorMsg };
      }
      
      const metaData = {
        data_meta: dataStr,
        meta_qtd: meta_qtd
      };
      
      console.log('📤 Dados para enviar:', metaData);
      
      const { data: meta, error } = await supabase
        .from('metas')
        .upsert([metaData])
        .select()
        .single();

      console.log('📥 Resposta do Supabase:', { meta, error });

      if (error) {
        console.error('❌ setMeta - Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ setMeta - Meta salva com sucesso:', meta);
      return { data: meta, error: null };
    } catch (error) {
      console.error('❌ setMeta - Erro ao definir meta:', error);
      return { 
        data: null, 
        error: error.message || 'Erro ao definir meta' 
      };
    }
  },

  // Atualizar meta existente (quando já tem ID)
  async updateMeta(metaId, data, meta_qtd) {
    try {
      console.log('🔍 updateMeta - Atualizando meta existente...');
      console.log('🆔 ID da meta:', metaId);
      console.log('🎯 Quantidade recebida:', meta_qtd);
      
      // Validar dados
      if (!metaId || !meta_qtd || meta_qtd < 1) {
        const errorMsg = 'Dados inválidos para atualização de meta';
        console.error('❌ updateMeta -', errorMsg);
        return { data: null, error: errorMsg };
      }
      
      // Quando atualizando uma meta existente, não alterar a data_meta
      // Apenas atualizar a quantidade e deixar o trigger atualizar o atualizado_em
      const metaData = {
        meta_qtd: meta_qtd
      };
      
      console.log('📤 Dados para atualizar:', metaData);
      
      const { data: meta, error } = await supabase
        .from('metas')
        .update(metaData)
        .eq('id', metaId)
        .select()
        .single();

      if (error) {
        console.error('❌ updateMeta - Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ updateMeta - Meta atualizada com sucesso:', meta);
      return { data: meta, error: null };
    } catch (error) {
      console.error('❌ updateMeta - Erro ao atualizar meta:', error);
      return { 
        data: null, 
        error: error.message || 'Erro ao atualizar meta' 
      };
    }
  },

  // Listar todas as metas (para o admin)
  async getAllMetas() {
    try {
      console.log('🔍 getAllMetas - Iniciando busca de todas as metas...');
      
      const { data: metas, error } = await supabase
        .from('metas')
        .select('*')
        .order('data_meta', { ascending: false });

      console.log('📊 getAllMetas - Resposta do Supabase:', { metas, error });

      if (error) {
        console.error('❌ getAllMetas - Erro do Supabase:', error);
        throw error;
      }
      
      console.log(`✅ getAllMetas - ${metas?.length || 0} metas encontradas`);
      return { data: metas || [], error: null };
    } catch (error) {
      console.error('❌ getAllMetas - Erro ao listar metas:', error);
      return { 
        data: [], 
        error: error.message || 'Erro ao listar metas' 
      };
    }
  },

  // Deletar meta
  async deleteMeta(id) {
    try {
      const { error } = await supabase
        .from('metas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      return { 
        error: error.message || 'Erro ao deletar meta' 
      };
    }
  },

  // Obter meta atual (hoje)
  async getCurrentMeta() {
    return this.getMeta(new Date());
  },

  // Obter meta para uma semana específica
  async getWeekMeta(startDate) {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // 7 dias
      
      // Garantir que as datas estão no fuso horário local
      const startDateLocal = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));
      const endDateLocal = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));
      
      const { data: metas, error } = await supabase
        .from('metas')
        .select('*')
        .gte('data_meta', startDateLocal.toISOString().split('T')[0])
        .lte('data_meta', endDateLocal.toISOString().split('T')[0])
        .order('data_meta', { ascending: true });

      if (error) throw error;
      
      return { data: metas || [], error: null };
    } catch (error) {
      console.error('Erro ao buscar metas da semana:', error);
      return { 
        data: [], 
        error: error.message || 'Erro ao buscar metas da semana' 
      };
    }
  }
}; 