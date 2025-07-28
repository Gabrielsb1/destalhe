import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const UserForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo_usuario: 'colaborador',
    ativo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const user = await userService.getById(id);
      
      if (user) {
        setFormData({
          nome: user.nome || '',
          email: user.email || '',
          senha: '',
          confirmarSenha: '',
          tipo_usuario: user.tipo_usuario || 'colaborador',
          ativo: user.ativo !== false
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [isEditing, loadUser]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    const validationErrors = {};
    if (!formData.nome.trim()) validationErrors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      validationErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'E-mail inválido';
    }
    
    if (!isEditing && !formData.senha) {
      validationErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      validationErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      validationErrors.confirmarSenha = 'As senhas não conferem';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      const userData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        tipo_usuario: formData.tipo_usuario,
        ativo: formData.ativo
      };
      
      if (formData.senha) {
        userData.senha = formData.senha;
      }
      
      if (isEditing) {
        await userService.update(id, userData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await userService.create(userData);
        toast.success('Usuário criado com sucesso!');
      }
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-800 mb-6 flex items-center"
      >
        <ArrowLeft size={18} className="mr-1" /> Voltar
      </button>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || isEditing}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="tipo_usuario" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuário
            </label>
            <select
              id="tipo_usuario"
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled={loading}
            >
              <option value="colaborador">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              {isEditing ? 'Nova Senha' : 'Senha *'}
              {isEditing && <span className="text-gray-500 text-xs ml-1">(deixe em branco para não alterar)</span>}
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.senha ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
              {!isEditing && ' *'}
            </label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.confirmarSenha && <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
              Usuário ativo
            </label>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
