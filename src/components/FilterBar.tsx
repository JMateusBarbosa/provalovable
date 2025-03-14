
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FilterState } from '@/lib/types';
import { pcNumbers, timeSlots } from '@/lib/data';

interface FilterBarProps {
  onFilter: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterState>({
    studentName: '',
    module: '',
    pcNumber: '',
    examDate: null,
    examTime: '',
    status: ''
  });

  const handleChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const clearFilters = () => {
    const resetFilters: FilterState = {
      studentName: '',
      module: '',
      pcNumber: '',
      examDate: null,
      examTime: '',
      status: ''
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <div className="w-full bg-light-blue rounded-lg p-5 mb-6 shadow-sm border border-border animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {/* Student Name Filter */}
          <div className="relative">
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Aluno
            </label>
            <div className="relative">
              <input
                id="studentName"
                type="text"
                className="filter-input w-full pr-8"
                placeholder="Digite o nome do aluno"
                value={filters.studentName}
                onChange={(e) => handleChange('studentName', e.target.value)}
              />
              <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Module Filter */}
          <div>
            <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
              Módulo
            </label>
            <input
              id="module"
              type="text"
              className="filter-input w-full"
              placeholder="Nome do módulo"
              value={filters.module}
              onChange={(e) => handleChange('module', e.target.value)}
            />
          </div>
          
          {/* PC Number Filter */}
          <div>
            <label htmlFor="pcNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número do PC
            </label>
            <Select
              value={filters.pcNumber}
              onValueChange={(value) => handleChange('pcNumber', value)}
            >
              <SelectTrigger className="filter-input w-full">
                <SelectValue placeholder="Selecione o PC" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                <SelectItem value="all">Todos</SelectItem>
                {pcNumbers.map((num) => (
                  <SelectItem key={num} value={num}>
                    PC {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Exam Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Prova
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "filter-input w-full justify-start text-left font-normal",
                    !filters.examDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.examDate ? (
                    format(filters.examDate, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={filters.examDate || undefined}
                  onSelect={(date) => handleChange('examDate', date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Exam Time Filter */}
          <div>
            <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 mb-1">
              Horário
            </label>
            <Select
              value={filters.examTime}
              onValueChange={(value) => handleChange('examTime', value)}
            >
              <SelectTrigger className="filter-input w-full">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleChange('status', value as any)}
            >
              <SelectTrigger className="filter-input w-full">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <Button 
              type="submit" 
              className="button-primary flex-1"
            >
              Filtrar
            </Button>
            <Button
              type="button"
              className="button-secondary flex-1"
              onClick={clearFilters}
            >
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;
