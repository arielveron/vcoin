"use client";

import React, { useState, useMemo } from "react";
import { formatearMoneda } from "@/utils/format";
import { ClassSettings } from "@/db/pseudo-db";
import { calculateDiasRestantes } from "@/logic/calculations";
import { Calendar, TrendingUp, Target, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EstimadoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoEstimado: number;
  classSettings: ClassSettings;
  firstInvestmentDate?: Date; // Add this prop
}

export default function EstimadoCollapsible({ 
  montoEstimado, 
  classSettings, 
  firstInvestmentDate,
  className, 
  ...props 
}: EstimadoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const diasRestantes = calculateDiasRestantes(classSettings);
  
  // Calculate progress percentage using first investment date
  const { progressPercentage, totalDays, startDate } = useMemo(() => {
    const endDate = new Date(classSettings.end_date);
    const now = new Date();
    
    // Use first investment date if available, otherwise use today as fallback
    const effectiveStartDate = firstInvestmentDate || now;
    
    const totalDays = Math.floor((endDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((now.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
    
    return {
      progressPercentage,
      totalDays,
      startDate: effectiveStartDate
    };
  }, [classSettings.end_date, firstInvestmentDate]);

  const endDate = new Date(classSettings.end_date);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-purple-200 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      {/* Collapsed View - Always Visible */}
      <div 
        className="p-4 cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600">Estimación Final</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-purple-700">
                  {formatearMoneda(montoEstimado)}
                </span>
                <span className="text-xs text-purple-600 font-medium">
                  en {diasRestantes} días
                </span>
              </div>
            </div>
          </div>

          {/* Progress Ring - Only in collapsed view */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative w-12 h-12 ml-4"
              >
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e9d5ff"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#9333ea"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-700">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="ml-3"
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-purple-100"
          >
            <div className="p-6 pt-4">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    Faltan {diasRestantes} días
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Finaliza el {endDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                </span>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 mb-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Proyección optimista</span>
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {formatearMoneda(montoEstimado)}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Basado en la tasa de interés actual
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progreso del período</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {startDate.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="font-medium text-purple-600">Hoy</span>
                  <span>{endDate.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 text-center">
                  {diasRestantes > 30 
                    ? "¡Sigue invirtiendo para maximizar tus ganancias! 💪"
                    : diasRestantes > 7
                    ? "¡Ya falta poco! Mantén el ritmo 🚀"
                    : "¡Estás en la recta final! 🏁"
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}