import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './services/supabase'
import Login from './components/Login'
import CollaboratorDashboard from './pages/CollaboratorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ConfigWarning from './components/ConfigWarning'
import './App.css'

// Lazy load dos componentes de administração
const UsersList = lazy(() => import('./pages/admin/UsersList'))
const UserForm = lazy(() => import('./pages/admin/UserForm'))

// Componente para proteger rotas
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.tipo_usuario !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Componente principal da aplicação
const AppContent = () => {
  const { user, loading } = useAuth()
  
  console.log('AppContent - Estado atual:', { 
    loading, 
    user: user ? 'Usuário logado' : 'Nenhum usuário',
    path: window.location.pathname 
  })

  // Se estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inicializando sistema...</p>
        </div>
      </div>
    )
  }

  // Se não houver usuário, mostra a tela de login
  if (!user) {
    return (
      <Routes>
        <Route 
          path="/login" 
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
              <Login />
            </div>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Se o usuário estiver logado, mostra as rotas protegidas
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Routes>
        <Route 
          path="/login" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user.tipo_usuario === 'admin' ? <AdminDashboard /> : <CollaboratorDashboard />}
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas de administração */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute adminOnly>
              <UsersList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users/new" 
          element={
            <ProtectedRoute adminOnly>
              <UserForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users/edit/:id" 
          element={
            <ProtectedRoute adminOnly>
              <UserForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Suspense>
  )
}

function App() {
  // Se o Supabase não estiver configurado, mostrar tela de configuração
  if (!supabase) {
    return (
      <div className="App">
        <ConfigWarning />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="App">
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  )
}

export default App
