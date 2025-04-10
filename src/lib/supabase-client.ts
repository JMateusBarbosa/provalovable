import { createClient } from '@supabase/supabase-js';
import { ExamSchedule } from './types';
import { toSupabaseExam, fromSupabaseExam } from './supabase-schema';

// Replace with your Supabase URL and public anon key when deploying
const supabaseUrl = 'https://lndunjdjtxqnxbafedfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZHVuamRqdHhxbnhiYWZlZGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Nzc1NzgsImV4cCI6MjA1NzU1MzU3OH0.maudsrhpJc1mMSMAEyFBIkZJIJ2I0mVeTc7Q6FclcRo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Importamos as funções de auth-api.ts
import { authApi } from './auth-api';

// Autenticação
export const userApi = {
  // Gerenciar usuários no sistema
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    return data;
  },
  
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (!user) return null;
    
    // Buscar informações adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    if (userError) throw userError;
    
    return userData;
  },
  
  // Nova função para buscar usuário por username
  getUserByUsername: async (username: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  // Re-exportamos as funções de authApi
  registerUser: authApi.registerUser,
  checkUsernameExists: authApi.checkUsernameExists
};

// Exam API functions
export const examApi = {
  // Get all exams with optional filters
  getExams: async (schoolId: string): Promise<ExamSchedule[]> => {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('school_id', schoolId)
      .order('exam_date', { ascending: true });
    
    console.log('Dados retornados do Supabase:', data);

    if (error) throw error;
    
    return data ? data.map(fromSupabaseExam) : [];
  },
  
  // Get a single exam by id
  getExamById: async (id: string): Promise<ExamSchedule | null> => {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data ? fromSupabaseExam(data) : null;
  },
  
  // Create a new exam
  createExam: async (exam: Omit<ExamSchedule, 'id'>, schoolId: string): Promise<ExamSchedule> => {
    const { data, error } = await supabase
      .from('exam_schedules')
      .insert(toSupabaseExam(exam, schoolId))
      .select()
      .single();
    
    if (error) throw error;
    
    return fromSupabaseExam(data);
  },
  
  // Update an existing exam
  updateExam: async (id: string, exam: Partial<ExamSchedule>): Promise<ExamSchedule> => {
    const updateData: Record<string, any> = {};
    
    // Only convert fields that exist in the partial update
    if (exam.studentName !== undefined) updateData.student_name = exam.studentName;
    if (exam.module !== undefined) updateData.module = exam.module;
    if (exam.pcNumber !== undefined) updateData.pc_number = exam.pcNumber;
    if (exam.examDate !== undefined) updateData.exam_date = exam.examDate.toISOString();
    if (exam.examTime !== undefined) updateData.exam_time = exam.examTime;
    if (exam.examType !== undefined) updateData.exam_type = exam.examType;
    if (exam.status !== undefined) updateData.status = exam.status;
    // Não permitimos atualizar a escola
    
    const { data, error } = await supabase
      .from('exam_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return fromSupabaseExam(data);
  },
  
  // Delete an exam
  deleteExam: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('exam_schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Gerenciamento de escolas
export const schoolApi = {
  getSchools: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*');
    
    if (error) throw error;
    
    return data;
  },
  
  getSchoolById: async (id: string) => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  }
};
