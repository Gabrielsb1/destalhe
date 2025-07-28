import React from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'

const ConfigWarning = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuração Necessária
          </h1>
          <p className="text-gray-600">
            O Supabase não está configurado. Siga os passos abaixo para configurar o sistema.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">1. Criar Projeto no Supabase</h3>
            <p className="text-blue-800 text-sm mb-3">
              Acesse supabase.com e crie um novo projeto
            </p>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir Supabase
            </a>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">2. Executar Script SQL</h3>
            <p className="text-green-800 text-sm mb-3">
              No SQL Editor do Supabase, execute o script em <code>database/schema.sql</code>
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">3. Configurar Variáveis de Ambiente</h3>
            <p className="text-purple-800 text-sm mb-3">
              Crie um arquivo <code>.env.local</code> na raiz do projeto com:
            </p>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
              REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co<br/>
              REACT_APP_SUPABASE_ANON_KEY=sua-chave-anon
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">4. Reiniciar o Servidor</h3>
            <p className="text-orange-800 text-sm">
              Após criar o arquivo .env.local, pare o servidor (Ctrl+C) e execute <code>npm start</code> novamente.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Credenciais de Teste (após configuração):</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin@sistema.com / admin123</p>
            <p><strong>Colaborador:</strong> joao@sistema.com / colaborador123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigWarning
