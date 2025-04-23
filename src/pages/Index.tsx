import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import ScheduleTable from '@/components/ScheduleTable';
import FilterBar from '@/components/FilterBar';
import ExamPagination from '@/components/ExamPagination';
import { examApi } from '@/lib/supabase-client';
import { ExamSchedule, FilterState, ExamStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const { schoolId } = useAuth();
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [filteredExams, setFilteredExams] = useState<ExamSchedule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    studentName: '',
    module: '',
    pcNumber: '',
    examDate: null,
    examTime: '',
    status: 'all'
  });
  
  useEffect(() => {
    async function loadExams() {
      if (!schoolId) return; // Não carregar se não tiver schoolId
      
      try {
        const data = await examApi.getExams(schoolId);
        setExams(data);
        console.log('Exames carregados no estado:', data);
      } catch (error) {
        console.error('Erro ao buscar exames:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos.",
          variant: "destructive",
        });
      }
    }
    loadExams();
  }, [schoolId]);
  
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
    
    if (filters.examDate instanceof Date) {
      result = result.filter(exam => 
        format(exam.examDate, 'yyyy-MM-dd') === format(filters.examDate, 'yyyy-MM-dd')
      );
    }
    
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
    
    result.sort((a, b) => {
      const aIsToday = isSameDay(a.examDate, today);
      const bIsToday = isSameDay(b.examDate, today);
      
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      
      return a.examDate.getTime() - b.examDate.getTime();
    });
    
    setFilteredExams(result);
    setCurrentPage(1);
  }, [filters, exams]);
  
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handleUpdateExam = async (id: string, updatedExam: Partial<ExamSchedule>) => {
    try {
      const updated = await examApi.updateExam(id, updatedExam);
  
      const updatedExams = exams.map(exam => 
        exam.id === id ? { ...exam, ...updated } : exam
      );
      setExams(updatedExams);
  
      toast({
        title: "Atualização realizada",
        description: "Os dados da prova foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar o exame:", error);
    }
  };
  
  const handleDeleteExam = async (id: string) => {
    try {
      await examApi.deleteExam(id);
  
      const updatedExams = exams.filter(exam => exam.id !== id);
      setExams(updatedExams);
  
      toast({
        title: "Prova excluída",
        description: "O agendamento da prova foi excluído com sucesso.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
      console.error("Erro ao excluir o exame:", error);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout title="Provas Agendadas">
      <div className="mb-6">
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
        />
      </div>
      
      <ScheduleTable 
        exams={getCurrentPageItems()} 
        onUpdate={handleUpdateExam}
        onDelete={handleDeleteExam}
      />
      
      {filteredExams.length > ITEMS_PER_PAGE && (
        <ExamPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </PageLayout>
  );
};

export default Index;
