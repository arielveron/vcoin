'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchIcons, getIconsByCategory, type IconDefinition } from '@/lib/icon-registry';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: {
    name: string;
    library: string;
  };
  onChange: (icon: { name: string; library: string } | null) => void;
  color?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Icons' },
  { id: 'achievement', label: 'Achievements' },
  { id: 'academic', label: 'Academic' },
  { id: 'reward', label: 'Rewards' },
  { id: 'finance', label: 'Finance' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'general', label: 'General' }
] as const;

export default function IconPicker({ value, onChange, color }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'achievement' | 'academic' | 'reward' | 'finance' | 'seasonal' | 'general'>('all');
  const [filteredIcons, setFilteredIcons] = useState<IconDefinition[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let icons: IconDefinition[] = [];
    
    if (category === 'all') {
      icons = searchIcons(search);
    } else {
      icons = getIconsByCategory(category);
      if (search) {
        icons = icons.filter(icon => 
          icon.name.toLowerCase().includes(search.toLowerCase()) ||
          icon.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }
    }
    
    setFilteredIcons(icons);
  }, [search, category, isClient]);

  const handleSelect = useCallback((icon: IconDefinition) => {
    onChange({
      name: icon.name,
      library: icon.library
    });
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  if (!isClient) {
    return (
      <div className="relative">
        <button className="w-full p-2 border border-gray-300 rounded bg-gray-100">
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-blue-500 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <IconRenderer
                  name={value.name}
                  library={value.library}
                  size={20}
                  color={color}
                />
                <span className="text-sm">
                  {value.name} ({value.library})
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-sm">Select an icon...</span>
            )}
          </div>
          <svg
            className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    category === cat.id
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icons Grid */}
          <div className="p-2 overflow-y-auto max-h-64">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map((icon) => (
                  <button
                    key={`${icon.library}-${icon.name}`}
                    type="button"
                    onClick={() => handleSelect(icon)}
                    className={cn(
                      "p-2 rounded hover:bg-gray-100 flex flex-col items-center justify-center gap-1",
                      value?.name === icon.name && value?.library === icon.library
                        ? "bg-blue-100 border border-blue-300"
                        : "border border-transparent"
                    )}
                    title={`${icon.name} (${icon.library})`}
                  >
                    <IconRenderer
                      name={icon.name}
                      library={icon.library}
                      size={20}
                      color={color}
                    />
                    <span className="text-xs text-gray-600 truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No icons found</p>
                <p className="text-xs mt-1">Try a different search or category</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
