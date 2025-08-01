const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zhwmzlqeiwaawzsrcbsd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço para operações administrativas

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no arquivo .env');
  console.log('Para usar este script, adicione a chave de serviço do Supabase no arquivo .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetarProtocolos() {
  console.log('🚀 Iniciando reset dos protocolos...');
  
  try {
    // 1. Verificar quantos protocolos existem atualmente
    console.log('📊 Verificando protocolos existentes...');
    const { data: protocolosExistentes, error: errorContagem } = await supabase
      .from('protocolos')
      .select('id', { count: 'exact' });
    
    if (errorContagem) {
      console.error('❌ Erro ao contar protocolos existentes:', errorContagem);
      return;
    }
    
    console.log(`📊 Protocolos existentes: ${protocolosExistentes?.length || 0}`);
    
    // 2. Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const resposta = await new Promise((resolve) => {
      rl.question(`⚠️  ATENÇÃO: Isso irá deletar TODOS os ${protocolosExistentes?.length || 0} protocolos existentes e criar 23096 novos. Digite 'CONFIRMO' para continuar: `, resolve);
    });
    
    rl.close();
    
    if (resposta !== 'CONFIRMO') {
      console.log('❌ Operação cancelada pelo usuário');
      return;
    }
    
    // 3. Deletar todos os protocolos existentes
    console.log('🗑️  Deletando protocolos existentes...');
    const { error: errorDelete } = await supabase
      .from('protocolos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos
    
    if (errorDelete) {
      console.error('❌ Erro ao deletar protocolos:', errorDelete);
      return;
    }
    
    console.log('✅ Protocolos existentes deletados');
    
    // 4. Criar novos protocolos em lotes
    console.log('🔄 Criando 23096 novos protocolos...');
    const totalProtocolos = 23096;
    const tamanhoLote = 100; // Lotes menores para evitar timeouts
    const lotes = Math.ceil(totalProtocolos / tamanhoLote);
    
    for (let lote = 0; lote < lotes; lote++) {
      const inicio = lote * tamanhoLote + 1;
      const fim = Math.min((lote + 1) * tamanhoLote, totalProtocolos);
      
      console.log(`📦 Processando lote ${lote + 1}/${lotes}: protocolos ${inicio} a ${fim}`);
      
      const protocolosLote = [];
      for (let i = inicio; i <= fim; i++) {
        protocolosLote.push({
          numero_protocolo: i.toString(),
          status: 'pendente',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
          observacoes: `Protocolo criado automaticamente - Lote ${lote + 1}`
        });
      }
      
      const { error: errorInsert } = await supabase
        .from('protocolos')
        .insert(protocolosLote);
      
      if (errorInsert) {
        console.error(`❌ Erro ao inserir lote ${lote + 1}:`, errorInsert);
        return;
      }
      
      console.log(`✅ Lote ${lote + 1} inserido com sucesso`);
    }
    
    // 5. Verificar resultado
    console.log('🔍 Verificando resultado...');
    const { data: protocolosFinais, error: errorFinal } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo, status', { count: 'exact' });
    
    if (errorFinal) {
      console.error('❌ Erro ao verificar resultado:', errorFinal);
      return;
    }
    
    console.log('📊 Resultado final:');
    console.log(`   Total de protocolos: ${protocolosFinais?.length || 0}`);
    console.log(`   Primeiro protocolo: ${protocolosFinais?.[0]?.numero_protocolo || 'N/A'}`);
    console.log(`   Último protocolo: ${protocolosFinais?.[protocolosFinais.length - 1]?.numero_protocolo || 'N/A'}`);
    
    // Verificar se o protocolo 23096 foi criado
    const { data: protocolo23096 } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo, status')
      .eq('numero_protocolo', '23096')
      .single();
    
    if (protocolo23096) {
      console.log(`✅ Protocolo 23096 criado com sucesso (ID: ${protocolo23096.id})`);
    } else {
      console.log('❌ Protocolo 23096 não encontrado');
    }
    
    console.log('🎉 Reset dos protocolos concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
  }
}

// Executar o script
resetarProtocolos().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 