import React, { useState, useEffect } from 'react';
import { metaService } from '../services/metaService';
import { Calendar, Target, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MetaManager = () => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    return todayLocal.toISOString().split('T')[0];
  });
  const [metaValue, setMetaValue] = useState(48);
  const [editingMeta, setEditingMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMetas();
  }, []);

  const loadMetas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando metas do servidor...');
      
      const { data, error } = await metaService.getAllMetas();
      
      if (error) {
        console.error('❌ Erro ao carregar metas:', error);
        toast.error('Erro ao carregar metas');
        return;
      }
      
      console.log('📊 Metas carregadas:', data);
      setMetas(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (metaValue < 1) {
      toast.error('A meta deve ser maior que 0');
      return;
    }

    try {
      console.log('🔄 Criando nova meta...');
      console.log('📅 Data selecionada:', selectedDate);
      console.log('🎯 Valor da meta:', metaValue);
      
      // Passar a data como string diretamente, sem converter para Date
      const { data, error } = await metaService.setMeta(selectedDate, metaValue);
      
      console.log('📥 Resposta da criação:', { data, error });
      
      if (error) {
        toast.error('Erro ao salvar meta');
        return;
      }
      
      toast.success('Meta salva com sucesso!');
      setShowForm(false);
      const today = new Date();
      const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      setSelectedDate(todayLocal.toISOString().split('T')[0]);
      setMetaValue(48);
      loadMetas();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta');
    }
  };

  const handleEdit = (meta) => {
    console.log('🔍 Editando meta:', meta);
    console.log('📅 Data da meta para editar:', meta.data_meta);
    setEditingMeta(meta);
    setSelectedDate(meta.data_meta);
    setMetaValue(meta.meta_qtd);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (metaValue < 1) {
      toast.error('A meta deve ser maior que 0');
      return;
    }

    try {
      console.log('🔄 Atualizando meta:', editingMeta);
      console.log('📅 Data selecionada no formulário:', selectedDate);
      console.log('🎯 Valor da meta:', metaValue);
      
      const date = new Date(selectedDate);
      console.log('📅 Data parseada:', date);
      
      // Usar a função específica para atualizar quando tem ID
      const { data, error } = await metaService.updateMeta(
        editingMeta.id, 
        date, 
        metaValue
      );
      
      console.log('📥 Resposta da atualização:', { data, error });
      
      if (error) {
        toast.error('Erro ao atualizar meta');
        return;
      }
      
      toast.success('Meta atualizada com sucesso!');
      setEditingMeta(null);
      setShowForm(false);
      const today = new Date();
      const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      setSelectedDate(todayLocal.toISOString().split('T')[0]);
      setMetaValue(48);
      loadMetas();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  const handleDelete = async (metaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) {
      return;
    }

    try {
      const { error } = await metaService.deleteMeta(metaId);
      
      if (error) {
        toast.error('Erro ao excluir meta');
        return;
      }
      
      toast.success('Meta excluída com sucesso!');
      loadMetas();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta');
    }
  };

  const cancelEdit = () => {
    setEditingMeta(null);
    setShowForm(false);
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    setSelectedDate(todayLocal.toISOString().split('T')[0]);
    setMetaValue(48);
  };

  const formatDate = (dateStr) => {
    console.log('📅 formatDate - Data recebida:', dateStr);
    
    // Garantir que a data está no fuso horário local
    const date = new Date(dateStr + 'T00:00:00');
    console.log('📅 formatDate - Data parseada:', date);
    
    const formatted = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
    console.log('📅 formatDate - Data formatada:', formatted);
    return formatted;
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayStr = todayLocal.toISOString().split('T')[0];
    console.log('📅 isToday - Comparando:', dateStr, 'com', todayStr);
    return dateStr === todayStr;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando metas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Gerenciar Metas
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure as metas diárias para os colaboradores
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadMetas}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            title="Recarregar metas"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recarregar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingMeta ? 'Editar Meta' : 'Nova Meta'}
            </h3>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={editingMeta ? handleUpdate : handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta (quantidade)
                </label>
                <input
                  type="number"
                  min="1"
                  value={metaValue}
                  onChange={(e) => setMetaValue(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingMeta ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metas List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Metas Configuradas</h3>
        </div>
        
        {metas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700 mb-2">Nenhuma meta personalizada configurada</p>
            <p className="text-sm text-gray-500 mb-4">
              O sistema está usando a meta padrão de 48 protocolos por dia.
            </p>
            <p className="text-sm text-gray-500">
              Clique em "Nova Meta" para definir metas específicas para datas particulares.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {metas.map((meta) => (
              <div
                key={meta.id}
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${
                  isToday(meta.data_meta) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(meta.data_meta)}
                    </p>
                    {isToday(meta.data_meta) && (
                      <span className="text-xs text-blue-600 font-medium">HOJE</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {meta.meta_qtd} protocolos
                    </p>
                    <p className="text-xs text-gray-500">
                      Criada em {new Date(meta.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(meta)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar meta"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meta.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Sobre as Metas</h4>
            <p className="text-sm text-blue-700 mt-1">
              • A meta padrão é de 48 protocolos por dia<br/>
              • Você pode definir metas específicas para cada data<br/>
              • As metas são usadas para calcular o progresso dos colaboradores<br/>
              • Metas não configuradas usam automaticamente o valor padrão
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaManager; 