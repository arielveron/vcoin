"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CollapsibleContextType {
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

export function CollapsibleProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  const toggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <CollapsibleContext.Provider value={{ isExpanded, setExpanded, toggle }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function useCollapsibleStore() {
  const context = useContext(CollapsibleContext);
  if (context === undefined) {
    throw new Error('useCollapsibleStore must be used within a CollapsibleProvider');
  }
  return context;
}
