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

async function distribuirProtocolos() {
  console.log('🚀 Iniciando distribuição de protocolos entre colaboradores...');
  
  try {
    // 1. Verificar colaboradores ativos
    console.log('📊 Verificando colaboradores ativos...');
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
    console.log('📊 Verificando total de protocolos...');
    const { data: protocolos, error: errorProtocolos } = await supabase
      .from('protocolos')
      .select('id, numero_protocolo', { count: 'exact' });
    
    if (errorProtocolos) {
      console.error('❌ Erro ao contar protocolos:', errorProtocolos);
      return;
    }
    
    const totalProtocolos = protocolos?.length || 0;
    console.log(`📊 Total de protocolos: ${totalProtocolos}`);
    
    // 3. Calcular distribuição
    const protocolosPorColaborador = 1000;
    const protocolosNecessarios = colaboradores.length * protocolosPorColaborador;
    
    console.log(`📊 Distribuição planejada:`);
    console.log(`   - Protocolos por colaborador: ${protocolosPorColaborador}`);
    console.log(`   - Protocolos necessários: ${protocolosNecessarios}`);
    console.log(`   - Protocolos disponíveis: ${totalProtocolos}`);
    
    if (totalProtocolos < protocolosNecessarios) {
      console.warn(`⚠️  ATENÇÃO: Não há protocolos suficientes!`);
      console.warn(`   Faltam ${protocolosNecessarios - totalProtocolos} protocolos`);
    }
    
    // 4. Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const resposta = await new Promise((resolve) => {
      rl.question(`⚠️  ATENÇÃO: Isso irá distribuir ${protocolosPorColaborador} protocolos para cada colaborador. Digite 'CONFIRMO' para continuar: `, resolve);
    });
    
    rl.close();
    
    if (resposta !== 'CONFIRMO') {
      console.log('❌ Operação cancelada pelo usuário');
      return;
    }
    
    // 5. Limpar responsáveis existentes (opcional)
    console.log('🧹 Limpando responsáveis existentes...');
    const { error: errorLimpeza } = await supabase
      .from('protocolos')
      .update({ responsavel_id: null });
    
    if (errorLimpeza) {
      console.error('❌ Erro ao limpar responsáveis:', errorLimpeza);
      return;
    }
    
    console.log('✅ Responsáveis limpos');
    
    // 6. Distribuir protocolos
    console.log('🔄 Distribuindo protocolos...');
    
    for (let i = 0; i < colaboradores.length; i++) {
      const colaborador = colaboradores[i];
      const inicio = (i * protocolosPorColaborador) + 1;
      const fim = Math.min((i + 1) * protocolosPorColaborador, totalProtocolos);
      
      console.log(`📦 ${colaborador.nome}: protocolos ${inicio} a ${fim}`);
      
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
      
      console.log(`✅ ${colaborador.nome}: ${fim - inicio + 1} protocolos atribuídos`);
    }
    
    // 7. Verificar distribuição final
    console.log('🔍 Verificando distribuição final...');
    
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
      const primeiro = protocolosColabArray[0]?.numero_protocolo || 'N/A';
      const ultimo = protocolosColabArray[protocolosColabArray.length - 1]?.numero_protocolo || 'N/A';
      
      console.log(`📊 ${colaborador.nome}: ${protocolosColabArray.length} protocolos (${primeiro} a ${ultimo})`);
    }
    
    // 8. Verificar protocolos sem responsável
    const { data: semResponsavel, error: errorSemResponsavel } = await supabase
      .from('protocolos')
      .select('id', { count: 'exact' })
      .is('responsavel_id', null);
    
    if (errorSemResponsavel) {
      console.error('❌ Erro ao verificar protocolos sem responsável:', errorSemResponsavel);
    } else {
      console.log(`📊 Protocolos sem responsável: ${semResponsavel?.length || 0}`);
    }
    
    console.log('🎉 Distribuição concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a distribuição:', error);
  }
}

// Executar o script
distribuirProtocolos().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 