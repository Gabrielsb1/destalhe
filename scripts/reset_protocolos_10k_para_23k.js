const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zhwmzlqeiwaawzsrcbsd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no arquivo .env');
  console.log('Para usar este script, adicione a chave de serviço do Supabase no arquivo .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetarProtocolos10kPara23k() {
  console.log('🚀 Iniciando reset: 10k protocolos → 23.096 protocolos...');
  
  try {
    // 1. Verificar situação atual
    console.log('📊 Verificando protocolos existentes...');
    const { data: protocolosExistentes, error: errorContagem } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo', { count: 'exact' });
    
    if (errorContagem) {
      console.error('❌ Erro ao contar protocolos existentes:', errorContagem);
      return;
    }
    
    const totalExistentes = protocolosExistentes?.length || 0;
    console.log(`📊 Protocolos existentes: ${totalExistentes}`);
    
    if (totalExistentes > 0) {
      const primeiro = protocolosExistentes[0]?.numero_protocolo;
      const ultimo = protocolosExistentes[protocolosExistentes.length - 1]?.numero_protocolo;
      console.log(`📊 Primeiro protocolo: ${primeiro}`);
      console.log(`📊 Último protocolo: ${ultimo}`);
    }
    
    // 2. Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const resposta = await new Promise((resolve) => {
      rl.question(`⚠️  ATENÇÃO: Isso irá deletar ${totalExistentes} protocolos existentes e criar 23.096 novos. Digite 'CONFIRMO' para continuar: `, resolve);
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
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (errorDelete) {
      console.error('❌ Erro ao deletar protocolos:', errorDelete);
      return;
    }
    
    console.log('✅ Protocolos existentes deletados');
    
    // 4. Verificar se a limpeza funcionou
    const { data: aposLimpeza, error: errorAposLimpeza } = await supabase
      .from('protocolos')
      .select('id', { count: 'exact' });
    
    if (errorAposLimpeza) {
      console.error('❌ Erro ao verificar limpeza:', errorAposLimpeza);
      return;
    }
    
    console.log(`✅ Limpeza confirmada: ${aposLimpeza?.length || 0} protocolos restantes`);
    
    // 5. Criar 23.096 novos protocolos em lotes otimizados
    console.log('🔄 Criando 23.096 novos protocolos...');
    const totalProtocolos = 23096;
    const tamanhoLote = 2000; // Lotes maiores para melhor performance
    const lotes = Math.ceil(totalProtocolos / tamanhoLote);
    
    console.log(`📦 Processando ${lotes} lotes de ${tamanhoLote} protocolos cada...`);
    
    for (let lote = 0; lote < lotes; lote++) {
      const inicio = lote * tamanhoLote + 1;
      const fim = Math.min((lote + 1) * tamanhoLote, totalProtocolos);
      
      console.log(`📦 Lote ${lote + 1}/${lotes}: protocolos ${inicio} a ${fim}`);
      
      const protocolosLote = [];
      for (let i = inicio; i <= fim; i++) {
        protocolosLote.push({
          numero_protocolo: i.toString(),
          status: 'pendente',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
          observacoes: `Protocolo criado automaticamente - Lote ${lote + 1}/${lotes}`
        });
      }
      
      const { error: errorInsert } = await supabase
        .from('protocolos')
        .insert(protocolosLote);
      
      if (errorInsert) {
        console.error(`❌ Erro ao inserir lote ${lote + 1}:`, errorInsert);
        return;
      }
      
      console.log(`✅ Lote ${lote + 1}/${lotes} inserido com sucesso`);
    }
    
    // 6. Verificar resultado final
    console.log('🔍 Verificando resultado final...');
    const { data: protocolosFinais, error: errorFinal } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo, status', { count: 'exact' });
    
    if (errorFinal) {
      console.error('❌ Erro ao verificar resultado:', errorFinal);
      return;
    }
    
    console.log('📊 RESULTADO FINAL:');
    console.log(`   Total de protocolos: ${protocolosFinais?.length || 0}`);
    console.log(`   Primeiro protocolo: ${protocolosFinais?.[0]?.numero_protocolo || 'N/A'}`);
    console.log(`   Último protocolo: ${protocolosFinais?.[protocolosFinais.length - 1]?.numero_protocolo || 'N/A'}`);
    
    // 7. Verificar protocolos específicos
    const { data: protocolo1 } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo, status')
      .eq('numero_protocolo', '1')
      .single();
    
    const { data: protocolo23096 } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo, status')
      .eq('numero_protocolo', '23096')
      .single();
    
    if (protocolo1) {
      console.log(`✅ Protocolo 1 criado com sucesso (ID: ${protocolo1.id})`);
    } else {
      console.log('❌ Protocolo 1 não encontrado');
    }
    
    if (protocolo23096) {
      console.log(`✅ Protocolo 23096 criado com sucesso (ID: ${protocolo23096.id})`);
    } else {
      console.log('❌ Protocolo 23096 não encontrado');
    }
    
    // 8. Verificar se há duplicatas
    const { data: duplicatas, error: errorDuplicatas } = await supabase
      .from('protocolos')
      .select('numero_protocolo')
      .order('numero_protocolo');
    
    if (errorDuplicatas) {
      console.error('❌ Erro ao verificar duplicatas:', errorDuplicatas);
    } else {
      const numeros = duplicatas?.map(p => p.numero_protocolo) || [];
      const numerosUnicos = [...new Set(numeros)];
      
      if (numeros.length === numerosUnicos.length) {
        console.log('✅ Nenhuma duplicata encontrada');
      } else {
        console.log(`❌ Encontradas ${numeros.length - numerosUnicos.length} duplicatas!`);
      }
    }
    
    console.log('🎉 Reset dos protocolos concluído com sucesso!');
    console.log(`📈 Migração: ${totalExistentes} → 23.096 protocolos`);
    
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
  }
}

// Executar o script
resetarProtocolos10kPara23k().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 