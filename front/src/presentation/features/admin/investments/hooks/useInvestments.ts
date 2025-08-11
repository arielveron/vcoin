/**
 * Custom hook for managing investments admin logic
 * Extracted from investments-admin-client.tsx to separate business logic from UI
 */

import { useState } from 'react';
import { InvestmentWithStudent, Student, InvestmentCategory } from '@/types/database';
import { createInvestment, updateInvestment, deleteInvestment } from '@/app/admin/investments/actions';
import { useAdminFilters } from '@/hooks/useAdminFilters';
import { WithFormattedDates } from '@/utils/format-dates';

// Types
type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string;
};

type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'>;

type ClassForClient = WithFormattedDates<{ 
  id: number; 
  name: string; 
  description?: string;
  end_date: Date; 
  timezone: string;
  current_monthly_interest_rate?: number;
  created_at: Date; 
  updated_at: Date 
}, 'end_date' | 'created_at' | 'updated_at'>;

interface UseInvestmentsProps {
  initialInvestments: InvestmentForClient[];
  students: StudentForClient[];
  categories: InvestmentCategory[];
}

export function useInvestments({ initialInvestments, students, categories }: UseInvestmentsProps) {
  const [investments, setInvestments] = useState(initialInvestments);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<InvestmentForClient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { filters, updateFilters } = useAdminFilters();

  const handleCreateInvestment = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createInvestment(formData);
      
      if (result.success && result.data) {
        setShowCreateForm(false);
        // TODO: Replace with proper state update instead of reload
        window.location.reload();
      } else if (!result.success) {
        alert(result.error || 'Failed to create investment');
      }
    } catch (error) {
      console.error('Create investment error:', error);
      alert('Failed to create investment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvestment = async (formData: FormData) => {
    if (!editingInvestment) return;
    
    try {
      const result = await updateInvestment(editingInvestment.id, formData);
      if (result.success) {
        // TODO: Replace with proper state update instead of reload
        window.location.reload();
      } else if (!result.success) {
        alert(result.error || 'Failed to update investment');
      }
    } catch {
      alert('Failed to update investment');
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    
    try {
      const result = await deleteInvestment(id);
      if (result.success) {
        setInvestments(investments.filter(inv => inv.id !== id));
      } else if (!result.success) {
        alert(result.error || 'Failed to delete investment');
      }
    } catch {
      alert('Failed to delete investment');
    }
  };

  // Filter investments based on current filters
  const filteredInvestments = investments.filter(investment => {
    if (filters.classId) {
      const student = students.find(s => s.id === investment.student_id);
      if (!student || student.class_id !== filters.classId) return false;
    }
    
    if (filters.studentId && investment.student_id !== filters.studentId) return false;
    
    return true;
  });

  // Available students for selected class
  const availableStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students;

  // Available categories
  const availableCategories = categories.filter(cat => cat.is_active);

  return {
    // State
    investments,
    filteredInvestments,
    showCreateForm,
    editingInvestment,
    isSubmitting,
    filters,
    availableStudents,
    availableCategories,
    
    // Actions
    setShowCreateForm,
    setEditingInvestment,
    updateFilters,
    handleCreateInvestment,
    handleUpdateInvestment,
    handleDeleteInvestment,
  };
}

// Export types for use in components
export type {
  InvestmentForClient,
  StudentForClient,
  ClassForClient
};
