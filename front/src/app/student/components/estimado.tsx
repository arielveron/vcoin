import React from "react";
import { formatCurrency } from "@/shared/utils/formatting";
import { ClassSettings } from "@/types/database";
import { calculateDiasRestantes } from "@/logic/calculations";
import { Calendar, TrendingUp, Target } from "lucide-react";

interface EstimadoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoEstimado: number;
  classSettings: ClassSettings;
}

export default function Estimado({ montoEstimado, classSettings, className, ...props }: EstimadoProps) {
  const diasRestantes = calculateDiasRestantes(classSettings);
  
  // Calculate progress percentage
  // Use start_date if available, otherwise default to March 1st of current year (typical school start in Argentina)
  const currentYear = new Date().getFullYear();
  const fallbackStartDate = new Date(currentYear, 2, 1); // March 1st (month is 0-indexed)
  const startDate = classSettings.start_date ? new Date(classSettings.start_date) : fallbackStartDate;
  const endDate = new Date(classSettings.end_date);
  const now = new Date();
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  return (
    <div
      className={`bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6 w-full transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Estimación Final</h3>
            <p className="text-sm text-gray-600">Al completar el período</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-purple-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{diasRestantes} días</span>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-white rounded-lg p-5 mb-4 text-center shadow-sm">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-600">Proyección optimista</span>
        </div>
        <div className="text-4xl font-bold text-gray-800">
          {formatCurrency(montoEstimado)}
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
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{startDate.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}</span>
          <span className="font-medium">Hoy</span>
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
  );
}