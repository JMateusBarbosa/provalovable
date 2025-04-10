
import { supabase } from './supabase-client';
import { User } from './types';

export const authApi = {
  // Registrar um novo usuário
  registerUser: async (
    email: string, 
    password: string, 
    name: string, 
    username: string, 
    schoolId: string
  ): Promise<User> => {
    // 1. Registrar o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erro ao criar usuário');
    }
    
    // 2. Criar o registro na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email: email,
        name: name,
        username: username,
        school_id: schoolId
      })
      .select()
      .single();
    
    if (userError || !userData) {
      // Se houver erro ao criar o usuário na tabela users, tentar excluir o usuário do auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError?.message || 'Erro ao criar perfil de usuário');
    }
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      schoolId: userData.school_id,
      username: userData.username
    };
  },
  
  // Verificar se um nome de usuário já existe
  checkUsernameExists: async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (error) {
      throw new Error('Erro ao verificar nome de usuário');
    }
    
    return data !== null;
  }
};
