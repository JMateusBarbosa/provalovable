
import { useState, useEffect } from "react";
import { isSameDay } from "date-fns";
import { ExamSchedule, FilterState, ExamStatus } from "@/lib/types";

/**
 * Obtém a data efetiva do exame (exam_ts se disponível, senão exam_date)
 */
const getEffectiveExamDate = (exam: ExamSchedule): Date => {
  return exam.examTs || exam.examDate;
};

/**
 * Formata uma data para string no formato YYYY-MM-DD usando componentes locais
 * Isso evita problemas de timezone que ocorrem com toISOString()
 */
const formatLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica se duas datas são do mesmo dia usando componentes locais
 */
const isSameLocalDay = (date1: Date, date2: Date): boolean => {
  return formatLocalDateString(date1) === formatLocalDateString(date2);
};

export function useExamFilters(exams: ExamSchedule[]) {
  const [filters, setFilters] = useState<FilterState>({
    studentName: '',
    module: '',
    pcNumber: '',
    examDate: null,
    examTime: '',
    status: 'all'
  });
  const [filteredExams, setFilteredExams] = useState<ExamSchedule[]>([]);

  useEffect(() => {
    let result = [...exams];

    if (filters.studentName) {
      result = result.filter(exam =>
        exam.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }
    if (filters.module) {
      result = result.filter(exam =>
        exam.module.toLowerCase().includes(filters.module.toLowerCase())
      );
    }
    if (filters.pcNumber && filters.pcNumber !== 'all') {
      result = result.filter(exam =>
        String(exam.pcNumber) === String(filters.pcNumber)
      );
    }
    
    // Filtro por data: compara usando componentes locais de data (ano, mês, dia)
    // Isso evita problemas de timezone ao comparar timestamps UTC com datas locais
    if (filters.examDate instanceof Date) {
      const filterDateStr = formatLocalDateString(filters.examDate);
      
      result = result.filter(exam => {
        const effectiveDate = getEffectiveExamDate(exam);
        const examDateStr = formatLocalDateString(effectiveDate);
        return examDateStr === filterDateStr;
      });
    }
    
    // Filtro por horário: compara diretamente exam.examTime
    if (filters.examTime && filters.examTime !== 'all') {
      result = result.filter(exam =>
        exam.examTime === filters.examTime
      );
    }
    
    if (filters.status !== 'all') {
      result = result.filter(exam =>
        exam.status === filters.status as ExamStatus
      );
    }
    
    const today = new Date();

    // Ordenação: provas de hoje primeiro, depois por data/hora (exam_ts)
    result.sort((a, b) => {
      const aEffective = getEffectiveExamDate(a);
      const bEffective = getEffectiveExamDate(b);
      
      const aIsToday = isSameLocalDay(aEffective, today);
      const bIsToday = isSameLocalDay(bEffective, today);
      
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      
      return aEffective.getTime() - bEffective.getTime();
    });

    setFilteredExams(result);
  }, [filters, exams]);

  return { filters, setFilters, filteredExams };
}
