"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/shared/utils/formatting";
import Image from "next/image";
import HistoricalGainsGraph from "./historical-gains-graph";
import { useCollapsibleStore } from "@/presentation/hooks/useCollapsibleStore";
import { useMediaQuery } from "@/presentation/hooks/useMediaQuery";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GraphDataPoint, InvestmentMarker, RateChangeMarker } from "@/types/database";

interface GananciaProps {
  gananciaTotal: number;
  graphData: GraphDataPoint[];
  investmentMarkers: InvestmentMarker[];
  rateChangeMarkers: RateChangeMarker[];
}

export default function GananciaCollapsible({
  gananciaTotal,
  graphData,
  investmentMarkers,
  rateChangeMarkers,
}: GananciaProps) {
  const [isLocalExpanded, setIsLocalExpanded] = useState(false);
  
  // Check if we're in a wide screen (md and above)
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  
  // Use shared state for wide screens, local state for narrow screens
  const sharedState = useCollapsibleStore();
  const isExpanded = isWideScreen ? sharedState.isExpanded : isLocalExpanded;
  
  const handleToggle = () => {
    if (isWideScreen) {
      sharedState.toggle();
    } else {
      setIsLocalExpanded(prev => !prev);
    }
  };

  // Determine styling based on gain/loss
  const isPositive = gananciaTotal >= 0;
  const bgGradient = isPositive ? "from-emerald-50 to-green-50" : "from-red-50 to-pink-50";
  const borderColor = isPositive ? "border-emerald-200" : "border-red-200";
  const textColor = isPositive ? "text-emerald-600" : "text-red-600";
  const iconBgColor = isPositive ? "bg-emerald-100" : "bg-red-100";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-md`}
    >
      {/* Collapsed View - Always Visible */}
      <div className="p-4 cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <motion.h3 
                animate={{ 
                  fontSize: isExpanded ? "1.25rem" : "0.875rem",
                  fontWeight: isExpanded ? "700" : "500"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-gray-600"
              >
                Ganancia Total
              </motion.h3>
              <AnimatePresence>
                {!isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-2 mt-1"
                  >
                    <div className="flex items-baseline space-x-1">
                      {isPositive && <span className={`text-xl font-bold ${textColor}`}>+</span>}
                      <span className={`text-2xl font-bold ${textColor}`}>
                        {formatCurrency(Math.abs(gananciaTotal), { decimals: 2 })}%
                      </span>
                    </div>
                    <Image src="/vcoin-xs.gif" alt="Vcoin Logo" width={16} height={16} className="opacity-60" unoptimized />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mini Graph - Only in collapsed view */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-32 h-12 ml-4"
              >
                {graphData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                ) : graphData.length === 1 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                ) : (
                  <HistoricalGainsGraph
                    data={graphData}
                    investmentMarkers={investmentMarkers}
                    rateChangeMarkers={rateChangeMarkers}
                    className="w-full h-full"
                    isCollapsed={true}
                  />
                )}
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
            className="border-t border-gray-100"
          >
            <div className="p-6 pt-4">
              {/* Main Gain Display */}
              <div className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-baseline space-x-1">
                    {isPositive && <span className={`text-2xl font-bold ${textColor}`}>+</span>}
                    <span className={`text-3xl font-bold ${textColor}`}>
                      {formatCurrency(Math.abs(gananciaTotal), { decimals: 2 })}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-600">
                  {isPositive ? "¡Excelente rendimiento!" : "Mantén la calma, el mercado fluctúa"}
                </p>
              </div>

              {/* Full Graph - Taller en vista expandida */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3">Evolución de tu inversión</p>
                {graphData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Sin inversiones registradas</div>
                  </div>
                ) : graphData.length === 1 ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-600 text-sm text-center">
                      <div>Inversión inicial: {graphData[0].formattedAmount}</div>
                      <div className="text-gray-400 text-xs mt-1">Desde {graphData[0].date}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-48">
                      <HistoricalGainsGraph
                        data={graphData}
                        investmentMarkers={investmentMarkers}
                        rateChangeMarkers={rateChangeMarkers}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Inversiones</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-8 h-0.5 bg-red-400"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(to right, transparent, transparent 2px, #f87171 2px, #f87171 4px)",
                          }}
                        ></div>
                        <span className="text-gray-600">Cambio de tasa</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
