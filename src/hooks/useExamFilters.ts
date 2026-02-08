
import { useState, useEffect } from "react";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { ExamSchedule, FilterState, ExamStatus } from "@/lib/types";

/**
 * Obtém a data efetiva do exame (exam_ts se disponível, senão exam_date)
 */
const getEffectiveExamDate = (exam: ExamSchedule): Date => {
  return exam.examTs || exam.examDate;
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
    
    // Filtro por data: usa intervalo de início/fim do dia para comparação correta
    if (filters.examDate instanceof Date) {
      const filterDayStart = startOfDay(filters.examDate);
      const filterDayEnd = endOfDay(filters.examDate);
      
      result = result.filter(exam => {
        const effectiveDate = getEffectiveExamDate(exam);
        return effectiveDate >= filterDayStart && effectiveDate <= filterDayEnd;
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
    today.setHours(0, 0, 0, 0);

    // Ordenação: provas de hoje primeiro, depois por data/hora (exam_ts)
    result.sort((a, b) => {
      const aEffective = getEffectiveExamDate(a);
      const bEffective = getEffectiveExamDate(b);
      
      const aIsToday = isSameDay(aEffective, today);
      const bIsToday = isSameDay(bEffective, today);
      
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      
      return aEffective.getTime() - bEffective.getTime();
    });

    setFilteredExams(result);
  }, [filters, exams]);

  return { filters, setFilters, filteredExams };
}
