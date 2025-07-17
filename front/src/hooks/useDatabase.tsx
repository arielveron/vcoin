'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { InvestmentService } from '../services/investment-service';

interface DatabaseContextType {
  service: InvestmentService;
  isInitialized: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [service] = useState(() => new InvestmentService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Test if we can fetch data
        await service.getAllClasses();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Database connection failed:', err);
        setError(err instanceof Error ? err.message : 'Database connection failed');
        setIsInitialized(false);
      }
    };

    initialize();
  }, [service]);

  return (
    <DatabaseContext.Provider value={{ service, isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Custom hooks for specific data
export function useInvestments(studentId: number = 1) {
  const { service, isInitialized } = useDatabase();
  const [investments, setInvestments] = useState<Array<{
    id: number;
    fecha: string;
    monto: number;
    concepto: string;
  }>>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [investmentsList, total] = await Promise.all([
          service.getInvestmentsByStudent(studentId),
          service.getTotalInvestedByStudent(studentId)
        ]);
        
        setInvestments(investmentsList.map(inv => ({
          id: inv.id,
          fecha: inv.fecha,
          monto: inv.monto,
          concepto: inv.concepto
        })));
        setTotalInvested(total);
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service, studentId, isInitialized]);

  return { investments, totalInvested, loading };
}
