/**
 * Reusable hook for managing form modals
 * Centralizes modal state and form submission logic
 */

import { useState } from 'react';

interface UseFormModalOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useFormModal<T = unknown>(options: UseFormModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsOpen(true);
  };

  const openEditModal = (item: T) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (submitFn: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await submitFn();
      closeModal();
      options.onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      options.onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    isSubmitting,
    editingItem,
    isEditing: editingItem !== null,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFormSubmit,
  };
}
