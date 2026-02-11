import { useState, useEffect } from "react";
import { ExamSchedule, FilterState, ExamStatus } from "@/lib/types";
import { makeExamTsFromDateAndTime } from "@/utils/dates";
import { fromZonedTime} from "date-fns-tz";

const MANAUS_TIMEZONE = "America/Manaus";

/**
 * Obtém a data efetiva do exame (exam_ts se disponível, senão exam_date)
 */
const getEffectiveExamDate = (exam: ExamSchedule): Date => {
  return exam.examTs || exam.examDate;
};

// --- robust getEffectiveExamTimestamp (aceita string|Date|null)
const getEffectiveExamTimestamp = (exam: ExamSchedule): number | null => {
  // exam.examTs may already be a Date (from fromSupabaseExam) or null
  if (exam.examTs) {
    const d = exam.examTs instanceof Date ? exam.examTs : new Date(exam.examTs);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }

  // fallback: if both examDate (Date) and examTime (HH:mm) exist, build ISO via your util
  if (exam.examDate && exam.examTime) {
    try {
      const examTsIso = makeExamTsFromDateAndTime(exam.examDate, exam.examTime);
      const t = new Date(examTsIso);
      if (!Number.isNaN(t.getTime())) return t.getTime();
    } catch (e) {
      // ignore and fallback
    }
  }
  if (exam.examDate) {
    const t = exam.examDate instanceof Date ? exam.examDate.getTime() : new Date(exam.examDate).getTime();
    return Number.isNaN(t) ? null : t;
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

// --- replace getManausDayIntervalUtc with this version
const getManausDayIntervalUtc = (date: Date): { start: number; end: number } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const pad = (n: number) => String(n).padStart(2, "0");

  // Dia lógico interpretado como Manaus
  const startLocal = `${year}-${pad(month)}-${pad(day)}T00:00:00`;
  const endLocal = `${year}-${pad(month)}-${pad(day + 1)}T00:00:00`;

  // Agora sim: converter corretamente para UTC
  const startUtc = fromZonedTime(startLocal, MANAUS_TIMEZONE);
  const endUtc = fromZonedTime(endLocal, MANAUS_TIMEZONE);

  return {
    start: startUtc.getTime(),
    end: endUtc.getTime(),
  };
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
      const aTs = getEffectiveExamTimestamp(a) ?? 0;
      const bTs = getEffectiveExamTimestamp(b) ?? 0;

      const aEffective = new Date(aTs);
      const bEffective = new Date(bTs);


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
