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

async function distribuirProtocolos10Colaboradores() {
  console.log('🚀 Iniciando distribuição de protocolos entre 10 colaboradores...');
  console.log('📦 Distribuição: 1.000 protocolos por colaborador');
  
  try {
    // 1. Verificar colaboradores ativos
    console.log('\n📊 Verificando colaboradores ativos...');
    const { data: colaboradores, error: errorColaboradores } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('tipo_usuario', 'colaborador')
      .eq('ativo', true)
      .order('nome');
    
    if (errorColaboradores) {
      console.error('❌ Erro ao buscar colaboradores:', errorColaboradores);
      return;
    }
    
    console.log(`📊 Colaboradores encontrados: ${colaboradores.length}`);
    colaboradores.forEach((colab, index) => {
      console.log(`   ${index + 1}. ${colab.nome} (${colab.email})`);
    });
    
    if (colaboradores.length === 0) {
      console.error('❌ Nenhum colaborador ativo encontrado!');
      return;
    }
    
    // 2. Verificar total de protocolos
    console.log('\n📊 Verificando total de protocolos...');
    const { data: protocolos, error: errorProtocolos } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo', { count: 'exact' });
    
    if (errorProtocolos) {
      console.error('❌ Erro ao contar protocolos:', errorProtocolos);
      return;
    }
    
    const totalProtocolos = protocolos?.length || 0;
    console.log(`📊 Total de protocolos: ${totalProtocolos.toLocaleString('pt-BR')}`);
    
    // 3. Calcular distribuição
    const protocolosPorColaborador = 1000;
    const protocolosDistribuidos = colaboradores.length * protocolosPorColaborador;
    const protocolosSemResponsavel = totalProtocolos - protocolosDistribuidos;
    
    console.log(`\n📊 Análise da distribuição:`);
    console.log(`   - Protocolos por colaborador: ${protocolosPorColaborador.toLocaleString('pt-BR')}`);
    console.log(`   - Colaboradores disponíveis: ${colaboradores.length}`);
    console.log(`   - Protocolos que serão distribuídos: ${protocolosDistribuidos.toLocaleString('pt-BR')}`);
    console.log(`   - Protocolos que ficarão sem responsável: ${protocolosSemResponsavel.toLocaleString('pt-BR')}`);
    
    if (protocolosSemResponsavel > 0) {
      console.warn(`⚠️  ATENÇÃO: ${protocolosSemResponsavel.toLocaleString('pt-BR')} protocolos ficarão sem responsável!`);
      console.warn(`   Isso é normal quando há mais protocolos que colaboradores disponíveis.`);
    }
    
    // 4. Mostrar distribuição planejada
    console.log(`\n📋 Distribuição planejada:`);
    for (let i = 0; i < colaboradores.length; i++) {
      const inicio = (i * protocolosPorColaborador) + 1;
      const fim = (i + 1) * protocolosPorColaborador;
      
      console.log(`   ${i + 1}. ${colaboradores[i].nome}: protocolos ${inicio.toLocaleString('pt-BR')} a ${fim.toLocaleString('pt-BR')} (${protocolosPorColaborador} protocolos)`);
    }
    
    if (protocolosSemResponsavel > 0) {
      const inicioSemResponsavel = protocolosDistribuidos + 1;
      const fimSemResponsavel = totalProtocolos;
      console.log(`   ⚠️  Protocolos sem responsável: ${inicioSemResponsavel.toLocaleString('pt-BR')} a ${fimSemResponsavel.toLocaleString('pt-BR')} (${protocolosSemResponsavel} protocolos)`);
    }
    
    // 5. Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const resposta = await new Promise((resolve) => {
      rl.question(`\n⚠️  ATENÇÃO: Isso irá distribuir ${protocolosPorColaborador.toLocaleString('pt-BR')} protocolos para cada colaborador. Digite 'CONFIRMO' para continuar: `, resolve);
    });
    
    rl.close();
    
    if (resposta !== 'CONFIRMO') {
      console.log('❌ Operação cancelada pelo usuário');
      return;
    }
    
    // 6. Limpar responsáveis existentes
    console.log('\n🧹 Limpando responsáveis existentes...');
    const { error: errorLimpeza } = await supabase
      .from('protocolos')
      .update({ responsavel_id: null });
    
    if (errorLimpeza) {
      console.error('❌ Erro ao limpar responsáveis:', errorLimpeza);
      return;
    }
    
    console.log('✅ Responsáveis limpos');
    
    // 7. Distribuir protocolos
    console.log('\n🔄 Distribuindo protocolos...');
    
    for (let i = 0; i < colaboradores.length; i++) {
      const colaborador = colaboradores[i];
      const inicio = (i * protocolosPorColaborador) + 1;
      const fim = (i + 1) * protocolosPorColaborador;
      
      console.log(`📦 ${colaborador.nome}: protocolos ${inicio.toLocaleString('pt-BR')} a ${fim.toLocaleString('pt-BR')} (${protocolosPorColaborador} protocolos)`);
      
      // Atualizar protocolos para este colaborador
      const { error: errorUpdate } = await supabase
        .from('protocolos')
        .update({ responsavel_id: colaborador.id })
        .gte('numero_protocolo', inicio)
        .lte('numero_protocolo', fim);
      
      if (errorUpdate) {
        console.error(`❌ Erro ao atribuir protocolos para ${colaborador.nome}:`, errorUpdate);
        return;
      }
      
      console.log(`✅ ${colaborador.nome}: ${protocolosPorColaborador} protocolos atribuídos`);
    }
    
    // 8. Verificar distribuição final
    console.log('\n🔍 Verificando distribuição final...');
    
    for (const colaborador of colaboradores) {
      const { data: protocolosColab, error: errorColab } = await supabase
        .from('protocolos')
        .select('numero_protocolo')
        .eq('responsavel_id', colaborador.id)
        .order('numero_protocolo');
      
      if (errorColab) {
        console.error(`❌ Erro ao verificar protocolos de ${colaborador.nome}:`, errorColab);
        continue;
      }
      
      const protocolosColabArray = protocolosColab || [];
      if (protocolosColabArray.length > 0) {
        const primeiro = protocolosColabArray[0]?.numero_protocolo || 'N/A';
        const ultimo = protocolosColabArray[protocolosColabArray.length - 1]?.numero_protocolo || 'N/A';
        
        console.log(`📊 ${colaborador.nome}: ${protocolosColabArray.length} protocolos (${primeiro.toLocaleString('pt-BR')} a ${ultimo.toLocaleString('pt-BR')})`);
      } else {
        console.log(`📊 ${colaborador.nome}: 0 protocolos`);
      }
    }
    
    // 9. Verificar protocolos sem responsável
    const { data: semResponsavel, error: errorSemResponsavel } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo', { count: 'exact' })
      .is('responsavel_id', null)
      .order('numero_protocolo');
    
    if (errorSemResponsavel) {
      console.error('❌ Erro ao verificar protocolos sem responsável:', errorSemResponsavel);
    } else {
      const protocolosSemResp = semResponsavel || [];
      console.log(`\n📊 Protocolos sem responsável: ${protocolosSemResp.length.toLocaleString('pt-BR')}`);
      
      if (protocolosSemResp.length > 0) {
        const primeiro = protocolosSemResp[0]?.numero_protocolo || 'N/A';
        const ultimo = protocolosSemResp[protocolosSemResp.length - 1]?.numero_protocolo || 'N/A';
        console.log(`📊 Faixa sem responsável: ${primeiro.toLocaleString('pt-BR')} a ${ultimo.toLocaleString('pt-BR')}`);
      }
    }
    
    // 10. Resumo final
    console.log('\n🎉 === DISTRIBUIÇÃO CONCLUÍDA ===');
    console.log(`📊 Total de protocolos: ${totalProtocolos.toLocaleString('pt-BR')}`);
    console.log(`📊 Protocolos distribuídos: ${protocolosDistribuidos.toLocaleString('pt-BR')}`);
    console.log(`📊 Protocolos sem responsável: ${protocolosSemResponsavel.toLocaleString('pt-BR')}`);
    console.log(`📊 Colaboradores utilizados: ${colaboradores.length}`);
    console.log(`📊 Protocolos por colaborador: ${protocolosPorColaborador.toLocaleString('pt-BR')}`);
    
    if (protocolosSemResponsavel > 0) {
      console.log(`\n💡 Dica: Para distribuir os ${protocolosSemResponsavel.toLocaleString('pt-BR')} protocolos restantes, adicione mais colaboradores ou execute o script novamente quando houver mais colaboradores disponíveis.`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a distribuição:', error);
  }
}

// Executar o script
distribuirProtocolos10Colaboradores().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 