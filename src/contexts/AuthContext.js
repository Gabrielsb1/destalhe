import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log('AuthProvider - Iniciando com estado:', { 
    user: user ? 'Usuário definido' : 'Nenhum usuário',
    loading 
  });

  useEffect(() => {
    // Função para verificar o usuário atual
    const checkUser = async () => {
      try {
        console.log('🔍 AuthContext - Verificando usuário atual...');
        const { data: currentUser, error } = await authService.getCurrentUser();
        
        console.log('🔍 AuthContext - Resultado da verificação:', { currentUser, error });
        
        if (currentUser) {
          console.log('✅ AuthContext - Usuário encontrado:', currentUser.email);
          setUser(currentUser);
        } else {
          console.log('❌ AuthContext - Nenhum usuário logado');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext - Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        console.log('✅ AuthContext - Finalizando verificação de usuário');
        setLoading(false);
      }
    };

    checkUser();

    // Configurar listener de mudança de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event);
        if (event === 'SIGNED_IN') {
          const user = session?.user || null;
          if (user) {
            // Buscar perfil completo do usuário
            const { data: userProfile } = await authService.getCurrentUser();
            setUser(userProfile);
          } else {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { error } = await authService.signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // Buscar perfil completo do usuário
      const { data: userProfile } = await authService.getCurrentUser();
      setUser(userProfile);
      
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      toast.success('Logout realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se é admin
  const checkIsAdmin = async () => {
    try {
      return await authService.isAdmin();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || false,
        checkIsAdmin,
      }}
    >
      {!loading && children}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
