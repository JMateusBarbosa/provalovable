import { useState, useEffect } from "react";
import { ExamSchedule, FilterState, ExamStatus } from "@/lib/types";

const MANAUS_TIMEZONE = "America/Manaus";

/**
 * Obtém a data efetiva do exame (exam_ts se disponível, senão exam_date)
 */
const getEffectiveExamDate = (exam: ExamSchedule): Date => {
  return exam.examTs || exam.examDate;
};

/**
 * Retorna YYYY-MM-DD no fuso informado (ex.: America/Manaus), sem sofrer com toISOString().
 */
const formatDateStringInTimeZone = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  // Fallback extremamente defensivo
  if (!year || !month || !day) return "";

  return `${year}-${month}-${day}`;
};

/**
 * Formata a data selecionada no calendário como YYYY-MM-DD usando componentes do próprio Date.
 * Aqui tratamos como “data de calendário” (sem timezone), para comparar com o dia em Manaus.
 */
const formatCalendarDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useExamFilters(exams: ExamSchedule[]) {
  const [filters, setFilters] = useState<FilterState>({
    studentName: "",
    module: "",
    pcNumber: "",
    examDate: null,
    examTime: "",
    status: "all",
  });
  const [filteredExams, setFilteredExams] = useState<ExamSchedule[]>([]);

  useEffect(() => {
    let result = [...exams];

    if (filters.studentName) {
      result = result.filter((exam) =>
        exam.studentName
          ?.toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.module) {
      result = result.filter((exam) =>
        exam.module.toLowerCase().includes(filters.module.toLowerCase())
      );
    }

    if (filters.pcNumber && filters.pcNumber !== "all") {
      result = result.filter(
        (exam) => String(exam.pcNumber) === String(filters.pcNumber)
      );
    }

    // Filtro por data: compara o “dia” no fuso America/Manaus (igual ao SQL)
    // Evita discrepâncias quando o navegador está em outro timezone.
    if (filters.examDate instanceof Date) {
      const filterDayStr = formatCalendarDateString(filters.examDate);

      result = result.filter((exam) => {
        const effectiveDate = getEffectiveExamDate(exam);
        const examDayStr = formatDateStringInTimeZone(
          effectiveDate,
          MANAUS_TIMEZONE
        );
        return examDayStr === filterDayStr;
      });
    }

    // Filtro por horário: mantém lógica existente (campo textual HH:MM)
    if (filters.examTime && filters.examTime !== "all") {
      result = result.filter((exam) => exam.examTime === filters.examTime);
    }

    if (filters.status !== "all") {
      result = result.filter((exam) => exam.status === (filters.status as ExamStatus));
    }

    // Ordenação: “hoje” (em Manaus) primeiro, depois por timestamp
    const todayManausStr = formatDateStringInTimeZone(
      new Date(),
      MANAUS_TIMEZONE
    );

    result.sort((a, b) => {
      const aEffective = getEffectiveExamDate(a);
      const bEffective = getEffectiveExamDate(b);

      const aIsToday =
        formatDateStringInTimeZone(aEffective, MANAUS_TIMEZONE) === todayManausStr;
      const bIsToday =
        formatDateStringInTimeZone(bEffective, MANAUS_TIMEZONE) === todayManausStr;

      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      return aEffective.getTime() - bEffective.getTime();
    });

    setFilteredExams(result);
  }, [filters, exams]);

  return { filters, setFilters, filteredExams };
}
