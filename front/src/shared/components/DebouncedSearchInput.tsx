/**
 * Shared Debounced Search Input Framework
 * Reusable component for text search with debouncing to prevent focus loss
 * Used across admin pages for consistent search experience
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export interface DebouncedSearchInputProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  autoFocus?: boolean
  disabled?: boolean
  'data-testid'?: string
}

/**
 * Debounced Search Input Component
 * 
 * Features:
 * - Prevents focus loss during typing by maintaining local state
 * - Debounces onChange calls to reduce server requests
 * - Auto-focus support with cursor positioning at end
 * - Clear button when text is present
 * - Accessible with proper ARIA labels
 * 
 * @param value - Current search value from parent state
 * @param onChange - Callback when debounced value changes
 * @param placeholder - Input placeholder text
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @param className - Additional CSS classes
 * @param autoFocus - Whether to auto-focus on mount or when value changes
 * @param disabled - Whether the input is disabled
 */
export default function DebouncedSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 500,
  className = "",
  autoFocus = false,
  disabled = false,
  'data-testid': dataTestId
}: DebouncedSearchInputProps) {
  const [localValue, setLocalValue] = useState(value || '')
  const [hadFocus, setHadFocus] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount if autoFocus is true or if there's a search value
  useEffect(() => {
    if ((autoFocus || value) && inputRef.current && !disabled) {
      inputRef.current.focus()
      // Place cursor at end of text
      const currentValue = inputRef.current.value
      inputRef.current.setSelectionRange(currentValue.length, currentValue.length)
    }
  }, [autoFocus, value, disabled])

  // Update local value when prop value changes (e.g., from URL navigation)
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  // Restore focus after URL navigation if the input previously had focus
  useEffect(() => {
    if (hadFocus && inputRef.current && document.activeElement !== inputRef.current && !disabled) {
      // Use a small timeout to ensure the component has re-rendered
      const focusTimeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          // Position cursor at the end
          inputRef.current.setSelectionRange(localValue.length, localValue.length)
        }
      }, 10)
      
      return () => clearTimeout(focusTimeout)
    }
  }, [value, hadFocus, localValue, disabled])

  // Handle input change with debouncing
  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onChange(newValue.trim() || null)
    }, debounceMs)
  }

  // Track focus state
  const handleFocus = () => {
    setHadFocus(true)
  }

  const handleBlur = () => {
    setHadFocus(false)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange(null)
    // Refocus the input after clearing
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key clears the search
    if (e.key === 'Escape' && localValue) {
      e.preventDefault()
      handleClear()
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
      </div>
      
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        data-testid={dataTestId}
        aria-label={placeholder}
        className={`w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          localValue ? 'pr-10' : 'pr-3'
        } ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${className.includes('focus:') ? '' : 'focus:shadow-sm'}`}
      />
      
      {/* Clear Button - only show when there's text and not disabled */}
      {localValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-gray-600"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Hook for managing debounced search state
 * Useful for complex components that need more control over search behavior
 */
export function useDebouncedSearch(
  initialValue: string | null = null,
  onDebouncedChange: (value: string | null) => void,
  debounceMs: number = 500
) {
  const [value, setValue] = useState(initialValue || '')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateValue = (newValue: string) => {
    setValue(newValue)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onDebouncedChange(newValue.trim() || null)
    }, debounceMs)
  }

  const clearValue = () => {
    setValue('')
    onDebouncedChange(null)
  }

  useEffect(() => {
    setValue(initialValue || '')
  }, [initialValue])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    updateValue,
    clearValue
  }
}
