import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { protocolService, metaService } from '../services/supabase'
import { FileText, CheckCircle, XCircle, Clock, Target, User, Calendar, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const CollaboratorDashboard = () => {
  const { user, logout } = useAuth()
  const [protocolos, setProtocolos] = useState([])
  const [selectedProtocol, setSelectedProtocol] = useState(null)
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(true)
  const [dayProgress, setDayProgress] = useState(0)
  const [dayGoal, setDayGoal] = useState(48)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchedProtocol, setSearchedProtocol] = useState(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      console.log('Iniciando carregamento de dados...');
      setLoading(true);
      
      // Carregar protocolos disponíveis (já vem ordenado e limitado a 1000)
      console.log('Carregando protocolos disponíveis...');
      const { data: protocolsData, error: protocolsError } = await protocolService.getAvailable();
      
      if (protocolsError) {
        console.error('Erro ao carregar protocolos:', protocolsError);
        toast.error('Erro ao carregar protocolos: ' + (protocolsError.message || 'Erro desconhecido'));
        return;
      }
      
      // Garantir que temos no máximo 1000 protocolos
      const limitedProtocols = (protocolsData || []).slice(0, 1000);
      console.log(`Carregados ${limitedProtocols.length} protocolos:`, limitedProtocols);
      setProtocolos(limitedProtocols);

      // Carregar progresso do dia
      console.log('Carregando progresso do dia...');
      const { count } = await protocolService.getUserDayProgress(user.id);
      console.log('Progresso do dia:', count);
      setDayProgress(count);

      // Carregar meta do dia
      console.log('Carregando meta do dia...');
      const { data: goalData } = await metaService.getDayGoal();
      console.log('Meta do dia:', goalData?.meta_qtd || 48);
      setDayGoal(goalData?.meta_qtd || 48);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
      console.log('Carregamento de dados concluído');
    }
  }

  const handleStartProtocol = async (protocol) => {
    try {
      const { data, error } = await protocolService.start(protocol.id, user.id)
      if (error) {
        toast.error('Erro ao iniciar protocolo')
        return
      }
      
      setSelectedProtocol({ ...protocol, status: 'em_andamento', usuario_responsavel: user.id })
      toast.success('Protocolo iniciado com sucesso!')
      loadData()
    } catch (error) {
      toast.error('Erro inesperado ao iniciar protocolo')
    }
  }

  const handleFinishProtocol = async (status) => {
    if (!selectedProtocol) {
      console.error('Nenhum protocolo selecionado');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Finalizando protocolo com status:', status, 'ID:', selectedProtocol.id);
      
      // Garante que o status está no formato correto
      const statusFinal = status === 'dados_excluídos' ? 'dados_excluidos' : status;
      
      const { data, error } = await protocolService.finish(
        selectedProtocol.id, 
        statusFinal, 
        observacoes
      );
      
      if (error) {
        console.error('Erro ao finalizar protocolo:', error);
        toast.error('Erro ao finalizar protocolo: ' + (error.message || 'Erro desconhecido'));
        return;
      }

      console.log('Protocolo finalizado com sucesso:', data);
      const statusText = statusFinal === 'cancelado' ? 'cancelado' : 'marcado como dados excluídos';
      toast.success(`Protocolo ${statusText} com sucesso!`);
      
      setSelectedProtocol(null);
      setObservacoes('');
      loadData();
    } catch (error) {
      console.error('Erro inesperado ao finalizar protocolo:', error);
      toast.error('Erro inesperado ao finalizar protocolo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchedProtocol(null)
      return
    }

    try {
      setSearchLoading(true)
      const protocol = await protocolService.buscarPorNumero(searchTerm.trim())
      setSearchedProtocol(protocol)
    } catch (error) {
      toast.error('Erro ao buscar protocolo')
      setSearchedProtocol(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchedProtocol(null)
  }

  const progressPercentage = Math.min((dayProgress / dayGoal) * 100, 100)
  const isGoalReached = dayProgress >= dayGoal
  
  // Filtrar protocolos com base no termo de busca
  const filteredProtocols = searchTerm
    ? protocolos.filter(protocol => 
        protocol.numero_protocolo.toString().includes(searchTerm)
      )
    : protocolos

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
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Protocolos
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {user.nome}
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
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar protocolo por número..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Progresso do Dia
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isGoalReached ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isGoalReached ? 'Meta Atingida!' : 'Em Progresso'}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{dayProgress} de {dayGoal} protocolos</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isGoalReached ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {isGoalReached 
              ? 'Parabéns! Você atingiu a meta do dia!' 
              : `Faltam ${dayGoal - dayProgress} protocolos para atingir a meta.`
            }
          </p>
        </div>

        {selectedProtocol ? (
          /* Protocol Details */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Protocolo em Andamento
              </h2>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Voltar à lista
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número do Protocolo
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {selectedProtocol.numero_protocolo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProtocol.status)}`}>
                    {getStatusIcon(selectedProtocol.status)}
                    <span className="ml-1 capitalize">{selectedProtocol.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicione observações sobre a verificação do protocolo..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleFinishProtocol('cancelado')}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <XCircle className="w-5 h-5 mr-2" />
                {submitting ? 'Processando...' : 'Marcar como Cancelado'}
              </button>
              <button
                onClick={() => handleFinishProtocol('dados_excluidos')}
                disabled={submitting}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {submitting ? 'Processando...' : 'Dados Excluídos'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Cabeçalho da lista de protocolos */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchedProtocol 
                  ? 'Protocolo Encontrado' 
                  : `Protocolos Disponíveis ${searchTerm ? `(Filtrados: ${filteredProtocols.length})` : `(${protocolos.length})`}`
                }
              </h2>
              {searchedProtocol && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpar busca
                </button>
              )}
            </div>
            
            {/* Resultado da busca */}
            {searchedProtocol ? (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Protocolo #{searchedProtocol.numero_protocolo}
                      </h3>
                      <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(searchedProtocol.status)
                      }`}>
                        {getStatusIcon(searchedProtocol.status)}
                        <span className="ml-1 capitalize">{searchedProtocol.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProtocol(searchedProtocol);
                        setSearchTerm('');
                        setSearchedProtocol(null);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredProtocols.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm 
                    ? 'Nenhum protocolo encontrado' 
                    : 'Nenhum protocolo disponível'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Nenhum protocolo corresponde ao número informado.'
                    : 'Todos os protocolos foram processados ou não há protocolos cadastrados.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredProtocols.map((protocol) => (
                  <div key={protocol.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Protocolo #{protocol.numero_protocolo}
                          </h3>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(protocol.status)}`}>
                            {getStatusIcon(protocol.status)}
                            <span className="ml-1 capitalize">{protocol.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          {protocol.status === 'em_andamento' && protocol.usuario_responsavel && (
                            <p>Em andamento por: {protocol.usuario_responsavel.nome || 'Usuário'}</p>
                          )}
                          {protocol.data_inicio && (
                            <p>Iniciado em: {new Date(protocol.data_inicio).toLocaleString('pt-BR')}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {protocol.status === 'pendente' ? (
                          <button
                            onClick={() => handleStartProtocol(protocol)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            Iniciar Verificação
                          </button>
                        ) : protocol.status === 'em_andamento' && protocol.usuario_responsavel === user.id ? (
                          <button
                            onClick={() => setSelectedProtocol(protocol)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Continuar
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {protocol.status === 'em_andamento' ? 'Em uso' : 'Indisponível'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollaboratorDashboard
