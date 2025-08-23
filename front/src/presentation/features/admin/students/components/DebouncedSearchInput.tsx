/**
 * Debounced Search Input Component
 * Prevents focus loss during typing by debouncing URL updates
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface DebouncedSearchInputProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  autoFocus?: boolean
}

export default function DebouncedSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 500,
  className = "",
  autoFocus = false
}: DebouncedSearchInputProps) {
  const [localValue, setLocalValue] = useState(value || '')
  const [hadFocus, setHadFocus] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount if autoFocus is true or if there's a search value
  useEffect(() => {
    if ((autoFocus || value) && inputRef.current) {
      inputRef.current.focus()
      // Place cursor at end of text
      const currentValue = inputRef.current.value
      inputRef.current.setSelectionRange(currentValue.length, currentValue.length)
    }
  }, [autoFocus, value]) // Include 'value' to satisfy ESLint

  // Update local value when prop value changes (e.g., from URL navigation)
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  // Restore focus after URL navigation if the input previously had focus
  useEffect(() => {
    if (hadFocus && inputRef.current && document.activeElement !== inputRef.current) {
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
  }, [value, hadFocus, localValue])

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
    if (inputRef.current) {
      inputRef.current.focus()
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
        <Search className="h-4 w-4 text-gray-400" />
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
        className={`w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          localValue ? 'pr-10' : 'pr-3'
        }`}
      />
      
      {/* Clear Button - only show when there's text */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
