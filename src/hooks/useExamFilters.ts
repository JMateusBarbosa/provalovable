import { useState, useEffect } from "react";
import { ExamSchedule, FilterState, ExamStatus } from "@/lib/types";
import { makeExamTsFromDateAndTime } from "@/utils/dates";

const MANAUS_TIMEZONE = "America/Manaus";

/**
 * Obtém a data efetiva do exame (exam_ts se disponível, senão exam_date)
 */
const getEffectiveExamDate = (exam: ExamSchedule): Date => {
  return exam.examTs || exam.examDate;
};

/**
 * Retorna o timestamp efetivo (em ms) do exame.
 * Usa exam_ts quando disponível; caso contrário combina exam_date + exam_time.
 */
const getEffectiveExamTimestamp = (exam: ExamSchedule): number | null => {
  if (exam.examTs) {
    return exam.examTs.getTime();
  }
  if (exam.examDate && exam.examTime) {
    const examTsIso = makeExamTsFromDateAndTime(exam.examDate, exam.examTime);
    const examTsDate = new Date(examTsIso);
    if (!Number.isNaN(examTsDate.getTime())) {
      return examTsDate.getTime();
    }
  }
  if (exam.examDate) {
    const fallbackTs = exam.examDate.getTime();
    return Number.isNaN(fallbackTs) ? null : fallbackTs;
  }
  return null;
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
 * Converte a data do calendário para um Date em UTC (meio-dia),
 * para evitar deslocamentos de dia quando o navegador está em outro fuso.
 */
const getManausDayIntervalUtc = (date: Date): { start: number; end: number } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const start = Date.UTC(year, month, day, 4, 0, 0);
    const end = Date.UTC(year, month, day + 1, 4, 0, 0);
    return { start, end };
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
      const { start, end } = getManausDayIntervalUtc(filters.examDate);

      result = result.filter((exam) => {
        const effectiveDate = getEffectiveExamDate(exam);
        const timestamp = getEffectiveExamTimestamp(exam);
        return timestamp !== null && timestamp >= start && timestamp < end;
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
