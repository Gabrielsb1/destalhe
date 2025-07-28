import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, user } = useAuth()
  
  // Log para depuração
  useEffect(() => {
    console.log('Componente Login renderizado')
    console.log('Estado do usuário:', user)
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Tentando fazer login com:', { email })
    
    if (!email || !password) {
      console.log('Email ou senha não preenchidos')
      return
    }
    
    try {
      console.log('Chamando função de login...')
      const result = await login(email, password)
      console.log('Resultado do login:', result)
    } catch (error) {
      console.error('Erro durante o login:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Protocolos
          </h1>
          <p className="text-gray-600 mt-2">
            Faça login para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Tipos de Acesso
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Admin:</span>
              <span className="text-gray-500">admin@sistema.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Colaborador:</span>
              <span className="text-gray-500">colaborador@sistema.com</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            O sistema possui dois tipos de usuários com diferentes permissões
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
