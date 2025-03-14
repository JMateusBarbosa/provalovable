
import React, { useState, useEffect } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import ScheduleTable from '@/components/ScheduleTable';
import { ExamSchedule, FilterState } from '@/lib/types';
import { sampleExamSchedules } from '@/lib/data';

const Index = () => {
  const { toast } = useToast();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [filteredExams, setFilteredExams] = useState<ExamSchedule[]>([]);
  
  // Initialize with today's data
  useEffect(() => {
    // In a real app, this would be a fetch request to your API
    setExamSchedules(sampleExamSchedules);
    
    // Initially show today's exams by default
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysExams = sampleExamSchedules.filter(exam => 
      isSameDay(exam.examDate, today)
    );
    
    setFilteredExams(todaysExams);
  }, []);

  const handleFilter = (filters: FilterState) => {
    let filtered = [...examSchedules];
    
    // Apply filters if they are set
    if (filters.studentName) {
      filtered = filtered.filter(exam => 
        exam.studentName.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }
    
    if (filters.module) {
      filtered = filtered.filter(exam => 
        exam.module.toLowerCase().includes(filters.module.toLowerCase())
      );
    }
    
    if (filters.pcNumber) {
      filtered = filtered.filter(exam => 
        exam.pcNumber === parseInt(filters.pcNumber)
      );
    }
    
    if (filters.examDate) {
      filtered = filtered.filter(exam => 
        isSameDay(exam.examDate, filters.examDate as Date)
      );
    }
    
    if (filters.examTime) {
      filtered = filtered.filter(exam => 
        exam.examTime === filters.examTime
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(exam => 
        exam.status === filters.status
      );
    }
    
    setFilteredExams(filtered);
  };

  const handleExamUpdate = (id: string, updatedExam: Partial<ExamSchedule>) => {
    // Update the exam in the state
    const updatedExams = examSchedules.map(exam => 
      exam.id === id ? { ...exam, ...updatedExam } : exam
    );
    
    setExamSchedules(updatedExams);
    
    // Also update the filtered list
    const updatedFiltered = filteredExams.map(exam => 
      exam.id === id ? { ...exam, ...updatedExam } : exam
    );
    
    setFilteredExams(updatedFiltered);
    
    // Notify the user
    toast({
      title: "Prova atualizada",
      description: "As informações da prova foram atualizadas com sucesso.",
    });
  };

  const handleExamDelete = (id: string) => {
    // Remove the exam from the state
    const remainingExams = examSchedules.filter(exam => exam.id !== id);
    setExamSchedules(remainingExams);
    
    // Also remove from filtered list
    const remainingFiltered = filteredExams.filter(exam => exam.id !== id);
    setFilteredExams(remainingFiltered);
    
    // Notify the user
    toast({
      title: "Prova excluída",
      description: "A prova foi excluída com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container pt-24 pb-10 px-4 sm:px-6">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-navy mb-2">Agendamento de Provas</h1>
          <p className="text-gray-600">
            Gerencie os agendamentos de provas dos alunos. Use os filtros abaixo para encontrar agendamentos específicos.
          </p>
        </div>
        
        <FilterBar onFilter={handleFilter} />
        
        <ScheduleTable 
          exams={filteredExams}
          onUpdate={handleExamUpdate}
          onDelete={handleExamDelete}
        />
      </main>
    </div>
  );
};

export default Index;
