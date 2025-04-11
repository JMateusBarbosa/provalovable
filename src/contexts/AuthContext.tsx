
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { userApi } from '@/lib/supabase-client';

/**
 * Interface que define o formato do contexto de autenticação
 * Contém o usuário atual, estado de carregamento, funções de login/logout
 * e o ID da escola do usuário logado
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  schoolId: string | null;
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de Autenticação
 * 
 * Componente que gerencia o estado de autenticação do usuário no sistema
 * Verifica a autenticação ao carregar a aplicação e fornece funções de login/logout
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar o estado da autenticação no carregamento
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          return;
        }
        
        if (session) {
          // Buscar os dados completos do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            await supabase.auth.signOut();
          } else if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              schoolId: userData.school_id,
              username: userData.username
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Buscar os dados completos do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          await supabase.auth.signOut();
          setUser(null);
        } else if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            schoolId: userData.school_id,
            username: userData.username
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    // Limpar o listener ao desmontar o componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  /**
   * Função de login
   * 
   * Processo:
   * 1. Busca o usuário pelo nome de usuário para obter o email
   * 2. Faz login com o email e senha usando Supabase Auth
   * 
   * @param username Nome de usuário
   * @param password Senha
   */
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Primeiro, procurar o usuário pelo nome de usuário para obter o email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();
      
      if (userError || !userData) {
        toast({
          title: "Erro de autenticação",
          description: "Nome de usuário ou senha inválidos",
          variant: "destructive",
        });
        return;
      }
      
      // Agora fazer login com o email encontrado
      const { error } = await supabase.auth.signInWithPassword({ 
        email: userData.email, 
        password 
      });
      
      if (error) {
        toast({
          title: "Erro de autenticação",
          description: "Nome de usuário ou senha inválidos",
          variant: "destructive",
        });
        return;
      }
      
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro de autenticação",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função de logout
   * 
   * Encerra a sessão do usuário e redireciona para a página de login
   */
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, schoolId: user?.schoolId || null }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação
 * Deve ser usado dentro de um AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
