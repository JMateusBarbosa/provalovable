
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExamSchedule, ExamType, ExamStatus } from '@/lib/types';
import { pcNumbers, timeSlots } from '@/lib/data';

interface TableRowProps {
  exam: ExamSchedule;
  isToday: boolean;
  onUpdate: (id: string, updatedExam: Partial<ExamSchedule>) => void;
  onDelete: (id: string) => void;
}

const TableRow: React.FC<TableRowProps> = ({ exam, isToday, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExam, setEditedExam] = useState<Partial<ExamSchedule>>({});

  const handleEditStart = () => {
    setEditedExam({
      module: exam.module,
      pcNumber: exam.pcNumber,
      examDate: exam.examDate,
      examTime: exam.examTime,
      examType: exam.examType,
      status: exam.status,
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedExam({});
  };

  const handleEditSave = () => {
    onUpdate(exam.id, editedExam);
    setIsEditing(false);
    setEditedExam({});
  };

  const handleInputChange = (field: keyof ExamSchedule, value: any) => {
    setEditedExam(prev => ({ ...prev, [field]: value }));
  };

  // Status badge renderer
  const renderStatusBadge = (status: ExamStatus) => {
    const statusClasses = {
      'Pendente': 'status-badge status-pending',
      'Aprovado': 'status-badge status-approved',
      'Reprovado': 'status-badge status-failed',
    };
    
    return (
      <span className={statusClasses[status]}>
        {status}
      </span>
    );
  };

  // Get row background based on date
  const getRowClass = () => {
    if (isToday) {
      return "bg-today-row table-row-hover";
    }
    return "table-row-hover";
  };

  return (
    <tr className={getRowClass()}>
      {/* Student Name - Not editable */}
      <td className="px-4 py-3 border-b">{exam.studentName}</td>
      
      {/* Module */}
      <td className="px-4 py-3 border-b">
        {isEditing ? (
          <Input
            value={editedExam.module || exam.module}
            onChange={(e) => handleInputChange('module', e.target.value)}
            className="max-w-[200px]"
          />
        ) : (
          exam.module
        )}
      </td>
      
      {/* PC Number */}
      <td className="px-4 py-3 border-b text-center">
        {isEditing ? (
          <Select
            value={String(editedExam.pcNumber || exam.pcNumber)}
            onValueChange={(value) => handleInputChange('pcNumber', parseInt(value))}
          >
            <SelectTrigger className="w-24 mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pcNumbers.map((num) => (
                <SelectItem key={num} value={num}>
                  PC {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          `PC ${exam.pcNumber}`
        )}
      </td>
      
      {/* Exam Date */}
      <td className="px-4 py-3 border-b text-center">
        {format(exam.examDate, 'dd/MM/yyyy')}
      </td>
      
      {/* Exam Time */}
      <td className="px-4 py-3 border-b text-center">
        {isEditing ? (
          <Select
            value={editedExam.examTime || exam.examTime}
            onValueChange={(value) => handleInputChange('examTime', value)}
          >
            <SelectTrigger className="w-24 mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          exam.examTime
        )}
      </td>
      
      {/* Exam Type */}
      <td className="px-4 py-3 border-b text-center">
        {isEditing ? (
          <Select
            value={editedExam.examType || exam.examType}
            onValueChange={(value) => handleInputChange('examType', value as ExamType)}
          >
            <SelectTrigger className="w-24 mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P1">P1</SelectItem>
              <SelectItem value="Rec.1">Rec.1</SelectItem>
              <SelectItem value="Rec.2">Rec.2</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          exam.examType
        )}
      </td>
      
      {/* Status */}
      <td className="px-4 py-3 border-b text-center">
        {isEditing ? (
          <Select
            value={editedExam.status || exam.status}
            onValueChange={(value) => handleInputChange('status', value as ExamStatus)}
          >
            <SelectTrigger className="w-28 mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          renderStatusBadge(exam.status)
        )}
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 border-b text-center">
        <div className="flex justify-center space-x-2">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-approved text-white hover:bg-approved/80"
                onClick={handleEditSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-gray-400 text-white hover:bg-gray-500"
                onClick={handleEditCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleEditStart}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-failed text-white hover:bg-failed/80"
                onClick={() => onDelete(exam.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
