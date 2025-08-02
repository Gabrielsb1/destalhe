import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { protocolService } from '../services/supabase';
import { supabase } from '../services/supabase';
import { metaService } from '../services/metaService';
import MetaManager from '../components/MetaManager';
import ProductivityChart from '../components/ProductivityChart';
import CollaboratorRanking from '../components/CollaboratorRanking';
import InfoCards from '../components/InfoCards';
import { 
  Users, FileText, Upload, Download, 
  BarChart3, Calendar, Target, Plus,
  CheckCircle, XCircle, Clock, User,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardAnimations.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [protocolos, setProtocolos] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'todos',
    dataInicio: '',
    dataFim: ''
  });
  
  const [showImportModal, setShowImportModal] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Filtro alterado:', name, '=', value);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: value
      };
      console.log('Novos filtros:', newFilters);
      return newFilters;
    });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare filters for the API
      const apiFilters = {};
      
      // Status filter
      if (filters.status && filters.status !== 'todos') {
        apiFilters.status = filters.status;
        console.log('Aplicando filtro de status específico:', filters.status);
      } else {
        console.log('Buscando todos os protocolos (sem filtro de status)');
      }
      
      // Date filters
      if (filters.dataInicio) {
        apiFilters.data_inicio = filters.dataInicio;
      }
      
      if (filters.dataFim) {
        apiFilters.data_fim = filters.dataFim;
      }
      
      console.log('Filtros aplicados:', apiFilters);
      console.log('Filtro de status selecionado:', filters.status);
      
      // Fetch protocols with filters
      const { data: protocolsData, error } = await protocolService.getAll(apiFilters);
      
      if (error) throw error;
      
      console.log('Protocolos retornados da API:', protocolsData);
      
      // Process and set protocols
      const protocolosFormatados = protocolsData.map(protocolo => ({
        ...protocolo,
        verificacao: {
          status: protocolo.status,
          observacoes: protocolo.observacoes,
          responsavel_id: protocolo.responsavel_id,
          responsavel_nome: protocolo.responsavel?.nome || 'N/A',
          data_verificacao: protocolo.atualizado_em
        },
        responsavel_nome: protocolo.responsavel?.nome || 'N/A'
      }));
      
      console.log('Protocolos formatados:', protocolosFormatados);
      setProtocolos(protocolosFormatados);
      
      // Calculate stats
      const stats = await calculateStats(protocolosFormatados);
      setStats(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [filters]);



  useEffect(() => {
    console.log('useEffect executado - filtros atuais:', filters);
    loadData();
  }, [loadData, filters])

  const calculateStats = async (protocols) => {
    console.log('Iniciando calculateStats com protocolos:', protocols);
    
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    try {
      // Buscar meta do dia
      const { data: metaHoje } = await metaService.getMeta(today);
      const metaDiaria = metaHoje?.meta_qtd || 48; // Meta padrão se não configurada
      
      console.log(`Meta do dia: ${metaDiaria} protocolos`);

      // Buscar todos os colaboradores ativos
      const { data: colaboradores } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('ativo', true)
        .eq('tipo_usuario', 'colaborador');

      // Buscar protocolos finalizados hoje diretamente do banco
      const { data: protocolosFinalizadosHoje, error: errorHoje } = await supabase
        .from('protocolos')
        .select('id, numero_protocolo, status, responsavel_id, atualizado_em')
        .in('status', ['cancelado', 'dados_excluidos', 'coordenacao'])
        .gte('atualizado_em', startOfDay.toISOString())
        .lt('atualizado_em', new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (errorHoje) {
        console.error('Erro ao buscar protocolos finalizados hoje:', errorHoje);
      }

      console.log('Protocolos finalizados hoje (do banco):', protocolosFinalizadosHoje);

      // Calcular progresso por colaborador
      const por_usuario = [];
      
      if (colaboradores && colaboradores.length > 0) {
        for (const colaborador of colaboradores) {
          // Contar protocolos finalizados pelo colaborador hoje
          const count = protocolosFinalizadosHoje ? protocolosFinalizadosHoje.filter(p => 
            p.responsavel_id === colaborador.id
          ).length : 0;

          console.log(`Colaborador ${colaborador.nome} (${colaborador.id}): ${count} protocolos finalizados hoje`);

          por_usuario.push({
            id: colaborador.id,
            nome: colaborador.nome,
            count,
            meta: metaDiaria,
            meta_atingida: count >= metaDiaria,
            percentual: Math.round((count / metaDiaria) * 100)
          });
        }
      } else {
        console.log('Nenhum colaborador ativo encontrado');
      }

      // Buscar estatísticas gerais do banco
      const { data: statsGerais, error: errorStats } = await supabase
        .from('protocolos')
        .select('status')
        .in('status', ['pendente', 'em_andamento', 'cancelado', 'dados_excluidos', 'coordenacao']);

      if (errorStats) {
        console.error('Erro ao buscar estatísticas gerais:', errorStats);
      }

      // Calcular totais
      const totalProtocolos = protocols.length;
      const pendentes = statsGerais ? statsGerais.filter(p => p.status === 'pendente').length : 0;
      const finalizados = statsGerais ? statsGerais.filter(p => 
        ['cancelado', 'dados_excluidos', 'coordenacao'].includes(p.status)
      ).length : 0;
      
      // Finalizados hoje
      const finalizadosHoje = protocolosFinalizadosHoje ? protocolosFinalizadosHoje.length : 0;

      // Buscar protocolos da semana atual
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data: protocolosSemana, error: errorSemana } = await supabase
        .from('protocolos')
        .select('id')
        .in('status', ['cancelado', 'dados_excluidos', 'coordenacao'])
        .gte('atualizado_em', startOfWeek.toISOString());
      
      const finalizadosSemana = protocolosSemana ? protocolosSemana.length : 0;

      // Buscar protocolos do mês atual
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: protocolosMes, error: errorMes } = await supabase
        .from('protocolos')
        .select('id')
        .in('status', ['cancelado', 'dados_excluidos', 'coordenacao'])
        .gte('atualizado_em', startOfMonth.toISOString());
      
      const finalizadosMes = protocolosMes ? protocolosMes.length : 0;

      // Debug log para verificar cálculos
      console.log('Cálculos do Status do Progresso:');
      console.log(`- Finalizados hoje: ${finalizadosHoje}`);
      console.log(`- Finalizados semana: ${finalizadosSemana}`);
      console.log(`- Finalizados mês: ${finalizadosMes}`);

      const stats = {
        total: totalProtocolos,
        pendentes: pendentes,
        finalizados: finalizados,
        finalizados_hoje: finalizadosHoje,
        finalizados_semana: finalizadosSemana,
        finalizados_mes: finalizadosMes,
        em_andamento: statsGerais ? statsGerais.filter(p => p.status === 'em_andamento').length : 0,
        cancelados: statsGerais ? statsGerais.filter(p => p.status === 'cancelado').length : 0,
        dados_excluidos: statsGerais ? statsGerais.filter(p => p.status === 'dados_excluidos').length : 0,
        coordenacao: statsGerais ? statsGerais.filter(p => p.status === 'coordenacao').length : 0,
        colaboradores_ativos: colaboradores?.length || 0,
        por_usuario
      };

      console.log('Estatísticas finais:', stats);
      return stats;

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      // Retornar objeto vazio em caso de erro
      return {
        total: 0,
        pendentes: 0,
        finalizados: 0,
        finalizados_hoje: 0,
        em_andamento: 0,
        cancelados: 0,
        dados_excluidos: 0,
        colaboradores_ativos: 0,
        por_usuario: []
      };
    }
  };

  const handleImportProtocols = async (e) => {
    e.preventDefault()
    const fileInput = e.target.file.files[0]
    if (!fileInput) return

    try {
      const text = await fileInput.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      const protocolos = lines.map(line => ({
        numero_protocolo: line.trim(),
        status: 'pendente'
      }))

      const { error } = await protocolService.importBatch(protocolos)
      if (error) {
        toast.error('Erro ao importar protocolos')
        return
      }

      toast.success(`${protocolos.length} protocolos importados com sucesso!`)
      setShowImportModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao processar arquivo')
    }
  }

  const exportToCSV = () => {
    // Adicionar BOM para UTF-8 (resolve problemas de codificação no Excel)
    const BOM = '\uFEFF';
    
    const headers = ['Número', 'Status', 'Responsável', 'Data Verificação', 'Observações']
    const rows = protocolos.map(p => [
      p.numero_protocolo,
      p.status,
      p.responsavel?.nome || '',
      p.verificacao?.data_verificacao ? new Date(p.verificacao.data_verificacao).toLocaleString('pt-BR') : '',
      p.observacoes || ''
    ])

    // Criar CSV com separador de vírgula e aspas duplas
    const csvContent = [headers, ...rows]
      .map(row => 
        row.map(field => {
          // Escapar aspas duplas e quebras de linha
          const escapedField = String(field).replace(/"/g, '""');
          return `"${escapedField}"`;
        }).join(';') // Usar ponto e vírgula como separador (padrão brasileiro)
      )
      .join('\r\n'); // Usar \r\n para compatibilidade com Excel

    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `protocolos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      case 'dados_excluidos': return 'bg-gray-100 text-gray-800'
      case 'coordenacao': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4" />
      case 'em_andamento': return <FileText className="w-4 h-4" />
      case 'cancelado': return <XCircle className="w-4 h-4" />
      case 'dados_excluidos': return <CheckCircle className="w-4 h-4" />
      case 'coordenacao': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users') {
      navigate('/admin/users');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Painel Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {user.nome} (Admin)
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString('pt-BR')}
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'protocols', name: 'Protocolos', icon: FileText },
              { id: 'users', name: 'Usuários', icon: Users },
              { id: 'goals', name: 'Metas', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Cards de Totais Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total de Protocolos</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Todos os protocolos na tabela</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Protocolos Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
                    <p className="text-xs text-gray-500 mt-1">Aguardando verificação</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Protocolos Finalizados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.finalizados}</p>
                    <p className="text-xs text-gray-500 mt-1">Verificados e concluídos</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Em Andamento</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.em_andamento}</p>
                    <p className="text-xs text-gray-500 mt-1">Sendo verificados</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-50">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Detalhamento dos Finalizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Cancelados</p>
                    <p className="text-3xl font-bold text-red-600">{stats.cancelados}</p>
                    <p className="text-xs text-gray-500 mt-1">Protocolos cancelados</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-50">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Dados Excluídos</p>
                    <p className="text-3xl font-bold text-gray-600">{stats.dados_excluidos}</p>
                    <p className="text-xs text-gray-500 mt-1">Dados excluídos do sistema</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-50">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Coordenação */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Coordenação</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.coordenacao || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Protocolos com observações</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Cards Informativos Melhorados */}
            <InfoCards 
              stats={{
                totalUsers: stats.colaboradores_ativos,
                protocolosHoje: stats.finalizados_hoje,
                protocolosRestantes: Math.max(0, (stats.colaboradores_ativos * (stats.por_usuario?.[0]?.meta || 48)) - (stats.finalizados_hoje || 0)),
                protocolosSemana: stats.finalizados_semana,
                protocolosMes: stats.finalizados_mes
              }}
              meta={stats.colaboradores_ativos * (stats.por_usuario?.[0]?.meta || 48)}
            />

            {/* Gráfico de Produtividade */}
            <ProductivityChart 
              protocolos={protocolos}
              meta={stats.colaboradores_ativos * (stats.por_usuario?.[0]?.meta || 48)}
            />

            {/* Ranking de Colaboradores */}
            <CollaboratorRanking users={stats.por_usuario || []} />
          </div>
        )}

        {/* Protocols Tab */}
        {activeTab === 'protocols' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={handleFilterChange}
                    name="status"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="dados_excluidos">Dados Excluídos</option>
                    <option value="coordenacao">Coordenação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={handleFilterChange}
                    name="dataInicio"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filters.dataFim}
                    onChange={handleFilterChange}
                    name="dataFim"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Protocols Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Verificação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {protocolos.map((protocol) => (
                    <tr key={protocol.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {protocol.numero_protocolo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(protocol.status)}`}>
                          {getStatusIcon(protocol.status)}
                          <span className="ml-1 capitalize">{protocol.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {protocol.responsavel_nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {protocol.verificacao?.data_verificacao 
                          ? new Date(protocol.verificacao.data_verificacao).toLocaleString('pt-BR')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {protocol.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
              <button
                onClick={() => navigate('/admin/users/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Redirecionando para a página de gerenciamento de usuários...</p>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <MetaManager />
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Protocolos</h3>
            <form onSubmit={handleImportProtocols} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo (um protocolo por linha)
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".txt,.csv"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Importar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
