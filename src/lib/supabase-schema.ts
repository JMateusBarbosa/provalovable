
import { ExamSchedule } from './types';

/**
 * Supabase Database Schema
 * 
 * Este arquivo define as funções para converter entre os formatos de dados
 * usados no frontend (tipos TypeScript) e os formatos usados no Supabase (banco de dados).
 * 
 * Relação entre nomenclaturas:
 * - Frontend: camelCase (studentName)
 * - Supabase: snake_case (student_name)
 */

/**
 * Converte um objeto ExamSchedule do formato da aplicação para o formato do Supabase
 * 
 * @param exam Objeto de agendamento no formato da aplicação (sem ID)
 * @param schoolId ID da escola associada ao exame
 * @returns Objeto no formato esperado pelo Supabase
 */
export const toSupabaseExam = (exam: Omit<ExamSchedule, 'id'>, schoolId: string): Record<string, any> => {
  // Combina data + hora para criar exam_ts
  const examTs = combineDateTime(exam.examDate, exam.examTime);
  
  return {
    student_name: exam.studentName,
    module: exam.module,
    pc_number: exam.pcNumber,
    exam_date: exam.examDate.toISOString(), // Mantido para compatibilidade
    exam_time: exam.examTime,
    exam_type: exam.examType,
    status: exam.status,
    school_id: schoolId,
    exam_ts: examTs.toISOString() // Nova coluna principal
  };
};

/**
 * Combina data e hora em um único timestamp
 * @param date Data do exame
 * @param time Horário no formato "HH:MM"
 * @returns Date com data e hora combinados
 */
export const combineDateTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Converte um registro do Supabase para o formato de ExamSchedule da aplicação
 * 
 * @param record Registro retornado pelo Supabase
 * @returns Objeto ExamSchedule no formato usado pela aplicação
 */
export const fromSupabaseExam = (record: Record<string, any>): ExamSchedule => {
  // Se exam_ts existir, usar como fonte principal
  const examTs = record.exam_ts ? new Date(record.exam_ts) : null;
  
  // Para examDate, preferir exam_ts se disponível, senão usar exam_date legado
  const examDate = examTs || new Date(record.exam_date);
  
  return {
    id: record.id,
    studentName: record.student_name,
    module: record.module,
    pcNumber: record.pc_number,
    examDate: examDate,
    examTime: record.exam_time,
    examType: record.exam_type,
    status: record.status,
    schoolId: record.school_id,
    examTs: examTs
  };
};
