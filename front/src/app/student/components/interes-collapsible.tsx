"use client";

import React, { useState } from "react";
import { formatearMoneda } from "@/utils/format";
import InterestRateGraph from "./interest-rate-graph";
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InterestRateChange, RateDataPoint } from "@/types/database";

interface InteresProps {
  currentRate: number;
  latestRateChange: InterestRateChange | null;
  rateData: RateDataPoint[];
}

export default function InteresCollapsible({ 
  currentRate, 
  latestRateChange, 
  rateData 
}: InteresProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the direction and styling
  let direction = null;
  let Icon = Minus;
  let trendColor = "text-gray-600";
  let bgGradient = "from-gray-50 to-gray-100";
  let borderColor = "border-gray-200";
  let iconBgColor = "bg-gray-100";

  if (latestRateChange) {
    if (latestRateChange.rate_direction === "up") {
      direction = "up";
      Icon = TrendingUp;
      trendColor = "text-green-600";
      bgGradient = "from-green-50 to-emerald-50";
      borderColor = "border-green-200";
      iconBgColor = "bg-green-100";
    } else if (latestRateChange.rate_direction === "down") {
      direction = "down";
      Icon = TrendingDown;
      trendColor = "text-red-600";
      bgGradient = "from-red-50 to-pink-50";
      borderColor = "border-red-200";
      iconBgColor = "bg-red-100";
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-md`}>
      {/* Collapsed View - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600">Interés Mensual</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-bold ${trendColor}`}>
                  {formatearMoneda(currentRate * 100)}%
                </span>
                {direction && <Icon className={`w-4 h-4 ${trendColor}`} />}
                {latestRateChange && latestRateChange.previous_rate !== null && (
                  <span className={`text-xs ${trendColor} font-medium`}>
                    {direction === "up" ? "+" : "-"}
                    {Math.abs(((currentRate - latestRateChange.previous_rate) / latestRateChange.previous_rate) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mini Graph - Only in collapsed view */}
          <AnimatePresence>
            {!isExpanded && rateData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-32 h-12 ml-4"
              >
                <InterestRateGraph rates={rateData} className="w-full h-full" />
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
              {/* Main Rate Display */}
              <div className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 mb-4`}>
                <div className="flex items-baseline justify-center space-x-2">
                  <span className={`text-3xl font-bold ${trendColor}`}>
                    {formatearMoneda(currentRate * 100)}%
                  </span>
                  {latestRateChange && latestRateChange.previous_rate !== null && (
                    <span className={`text-sm ${trendColor} font-medium`}>
                      {direction === "up" ? "+" : "-"}
                      {Math.abs(((currentRate - latestRateChange.previous_rate) / latestRateChange.previous_rate) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                {latestRateChange && latestRateChange.previous_rate !== null && (
                  <p className="text-xs text-center mt-2 text-gray-600">
                    {direction === "up" ? "Subió" : "Bajó"} desde {formatearMoneda(latestRateChange.previous_rate * 100)}%
                  </p>
                )}
              </div>

              {/* Full Graph */}
              {rateData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-3">Historial de tasas</p>
                  <div className="h-32">
                    <InterestRateGraph rates={rateData} className="w-full h-full" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}