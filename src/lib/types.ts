
export type ExamStatus = 'Pendente' | 'Aprovado' | 'Reprovado';

export type ExamType = 'P1' | 'Rec.1' | 'Rec.2';

export type ExamSchedule = {
  id: string;
  studentName: string;
  module: string;
  pcNumber: number;
  examDate: Date;
  examTime: string;
  examType: ExamType;
  status: ExamStatus;
  schoolId: string;
}

export type FilterState = {
  studentName: string;
  module: string;
  pcNumber: string;
  examDate: Date | null;
  examTime: string;
  status: string;
}

// Tipo User atualizado para incluir username
export type User = {
  id: string;
  email: string;
  name: string;
  schoolId: string;
  username: string; // Campo adicionado
}
