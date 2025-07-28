import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { protocolService } from '../services/supabase';
import { supabase } from '../services/supabase';
import { 
  Users, FileText, Upload, Download, 
  BarChart3, Calendar, Target, Plus,
  CheckCircle, XCircle, Clock, User,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  }, [loadData])

  const calculateStats = async (protocols) => {
    console.log('Iniciando calculateStats com protocolos:', protocols);
    
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Filtra protocolos finalizados hoje (cancelados ou dados_excluidos)
    const todayProtocols = protocols.filter(p => {
      const isFinalizado = ['cancelado', 'dados_excluidos'].includes(p.status);
      
      if (!isFinalizado) {
        console.log(`Protocolo ${p.numero_protocolo}: não finalizado (status=${p.status})`);
        return false;
      }
      
      // Para protocolos finalizados, usar a data de atualização
      const dataVerificacao = p.verificacao?.data_verificacao ? new Date(p.verificacao.data_verificacao) : null;
      const isHoje = dataVerificacao && dataVerificacao >= startOfDay;
      
      console.log(`Protocolo ${p.numero_protocolo}: status=${p.status}, data_verificacao=${p.verificacao?.data_verificacao}, isHoje=${isHoje}`);
      
      return isHoje;
    });

    console.log('Protocolos finalizados hoje:', todayProtocols);

    try {
      // Buscar todos os colaboradores ativos
      const { data: colaboradores, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('ativo', true)
        .eq('tipo_usuario', 'colaborador');

      console.log('Colaboradores ativos encontrados:', colaboradores);

      // Calcular progresso por colaborador
      const por_usuario = [];
      
      if (colaboradores && colaboradores.length > 0) {
        for (const colaborador of colaboradores) {
          // Contar protocolos finalizados pelo colaborador hoje
          const count = todayProtocols.filter(p => 
            p.responsavel_id === colaborador.id
          ).length;

          console.log(`Colaborador ${colaborador.nome} (${colaborador.id}): ${count} protocolos finalizados hoje`);

          por_usuario.push({
            id: colaborador.id,
            nome: colaborador.nome,
            count,
            meta_atingida: count >= 48 // Meta padrão de 48 protocolos
          });
        }
      } else {
        console.log('Nenhum colaborador ativo encontrado');
      }

      // Calcular totais
      const totalProtocolos = protocols.length;
      const pendentes = protocols.filter(p => p.status === 'pendente').length;
      const finalizados = protocols.filter(p => 
        ['cancelado', 'dados_excluidos'].includes(p.status)
      ).length;
      
      // Finalizados hoje
      const finalizadosHoje = todayProtocols.length;

      const stats = {
        total: totalProtocolos,
        pendentes: pendentes,
        finalizados: finalizados,
        finalizados_hoje: finalizadosHoje,
        em_andamento: protocols.filter(p => p.status === 'em_andamento').length,
        cancelados: protocols.filter(p => p.status === 'cancelado').length,
        dados_excluidos: protocols.filter(p => p.status === 'dados_excluidos').length,
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
    const headers = ['Número', 'Status', 'Responsável', 'Data Verificação', 'Observações']
    const rows = protocolos.map(p => [
      p.numero_protocolo,
      p.status,
      p.responsavel?.nome || '',
      p.verificacao?.data_verificacao ? new Date(p.verificacao.data_verificacao).toLocaleString('pt-BR') : '',
      p.observacoes || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4" />
      case 'em_andamento': return <FileText className="w-4 h-4" />
      case 'cancelado': return <XCircle className="w-4 h-4" />
      case 'dados_excluidos': return <CheckCircle className="w-4 h-4" />
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Protocolos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendentes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Finalizados</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.finalizados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Colaboradores Ativos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.colaboradores_ativos}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress by User */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Progresso por Colaborador (Hoje)
              </h3>
              <div className="space-y-4">
                {stats.por_usuario?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{user.nome}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {user.count}/48
                      </span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.meta_atingida ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.meta_atingida ? 'Meta Atingida' : 'Em Progresso'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configurar Metas</h2>
            <p className="text-gray-600">Funcionalidade de configuração de metas será implementada aqui.</p>
          </div>
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
