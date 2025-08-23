/**
 * Student Selection Store
 * Persistent selection state management using localStorage
 * Similar to Zustand pattern but follows VCoin's architecture
 */
'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'vcoin-student-selections'

interface StudentSelectionStore {
  selectedStudentIds: Set<number>
  addStudent: (studentId: number) => void
  removeStudent: (studentId: number) => void
  toggleStudent: (studentId: number) => void
  selectAll: (studentIds: number[]) => void
  clearAll: () => void
  isSelected: (studentId: number) => boolean
  getSelectedCount: () => number
  getSelectedIds: () => number[]
}

export function useStudentSelectionStore(): StudentSelectionStore {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedIds = JSON.parse(stored) as number[]
        setSelectedStudentIds(new Set(parsedIds))
      }
    } catch (error) {
      console.warn('Failed to load student selections from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (!isInitialized) return // Don't save until after initial load
    
    try {
      const idsArray = Array.from(selectedStudentIds)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray))
    } catch (error) {
      console.warn('Failed to save student selections to localStorage:', error)
    }
  }, [selectedStudentIds, isInitialized])

  const addStudent = useCallback((studentId: number) => {
    setSelectedStudentIds(prev => new Set([...prev, studentId]))
  }, [])

  const removeStudent = useCallback((studentId: number) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(studentId)
      return newSet
    })
  }, [])

  const toggleStudent = useCallback((studentId: number) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((studentIds: number[]) => {
    setSelectedStudentIds(new Set(studentIds))
  }, [])

  const clearAll = useCallback(() => {
    setSelectedStudentIds(new Set())
  }, [])

  const isSelected = useCallback((studentId: number) => {
    return selectedStudentIds.has(studentId)
  }, [selectedStudentIds])

  const getSelectedCount = useCallback(() => {
    return selectedStudentIds.size
  }, [selectedStudentIds])

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedStudentIds)
  }, [selectedStudentIds])

  return {
    selectedStudentIds,
    addStudent,
    removeStudent,
    toggleStudent,
    selectAll,
    clearAll,
    isSelected,
    getSelectedCount,
    getSelectedIds
  }
}
