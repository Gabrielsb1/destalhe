import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zhwmzlqeiwaawzsrcbsd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod216bHFlaXdhYXd6c3JjYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjU1NDQsImV4cCI6MjA2OTA0MTU0NH0.xO7GhtD4N2-8kR_hsBF30KD1AOon8FSFCcAVlSyF0fo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearMetas() {
  try {
    console.log('🔍 Verificando metas existentes...');
    
    // Primeiro, vamos ver quantas metas existem
    const { data: metas, error: countError } = await supabase
      .from('metas')
      .select('*');
    
    if (countError) {
      console.error('❌ Erro ao buscar metas:', countError);
      return;
    }
    
    console.log(`📊 Encontradas ${metas.length} metas na tabela`);
    
    if (metas.length === 0) {
      console.log('✅ Tabela de metas já está vazia!');
      return;
    }
    
    // Mostrar algumas metas como exemplo
    console.log('\n📋 Exemplos de metas encontradas:');
    metas.slice(0, 5).forEach((meta, index) => {
      console.log(`${index + 1}. Data: ${meta.data_meta} - Meta: ${meta.meta_qtd} protocolos`);
    });
    
    if (metas.length > 5) {
      console.log(`... e mais ${metas.length - 5} metas`);
    }
    
    // Confirmar com o usuário
    console.log('\n⚠️  ATENÇÃO: Esta ação irá EXCLUIR TODAS as metas da tabela!');
    console.log('Isso significa que o sistema voltará a usar apenas a meta padrão de 48 protocolos.');
    
    // Simular confirmação (em um script real, você poderia usar readline)
    console.log('\n🗑️  Iniciando limpeza da tabela de metas...');
    
    // Deletar todas as metas
    const { error: deleteError } = await supabase
      .from('metas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos os registros
    
    if (deleteError) {
      console.error('❌ Erro ao deletar metas:', deleteError);
      return;
    }
    
    console.log('✅ Todas as metas foram excluídas com sucesso!');
    console.log('🔄 O sistema agora usará a meta padrão de 48 protocolos por dia.');
    
    // Verificar se a tabela está vazia
    const { data: metasApos, error: verifyError } = await supabase
      .from('metas')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Erro ao verificar tabela após limpeza:', verifyError);
      return;
    }
    
    console.log(`✅ Confirmação: ${metasApos.length} metas restantes na tabela`);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
clearMetas()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }); 