
import React, { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import ScheduleTable from '@/components/ScheduleTable';
import FilterBar from '@/components/FilterBar';
import ExamPagination from '@/components/ExamPagination';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { useExamData } from '@/hooks/useExamData';
import { useExamFilters, getTodayInManaus } from '@/hooks/useExamFilters';

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const { schoolId } = useAuth();
  const { exams, updateExam, deleteExam, loading } = useExamData(schoolId);
  const { filters, setFilters, filteredExams } = useExamFilters(exams);
  const [currentPage, setCurrentPage] = useState(1);

  const isTodayFilter =
    filters.examDate instanceof Date &&
    filters.examDate.toDateString() === getTodayInManaus().toDateString() &&
    !filters.studentName &&
    !filters.module;



  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
        onUpdate={updateExam}
        onDelete={deleteExam}
        emptyTitle={isTodayFilter ? 'Nenhuma prova agendada para hoje.' : undefined}
        emptyDescription={
          isTodayFilter
            ? 'Use os filtros acima para buscar provas de outras datas.'
            : undefined
        }
      />

      {filteredExams.length > ITEMS_PER_PAGE && (
        <ExamPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <Toaster />
    </PageLayout>
  );
};

export default Index;
