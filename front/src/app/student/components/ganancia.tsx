import { formatearMoneda } from "@/utils/format";
import Image from "next/image";
import React from "react";
import { ServerDataService } from "@/services/server-data-service";
import HistoricalGainsGraph from "./historical-gains-graph";

interface GananciaProps {
  gananciaTotal: number;
  studentId: number;
}

export default async function Ganancia({ gananciaTotal, studentId }: GananciaProps) {
  // Get historical amounts for the ganancia total graph
  const historicalData = await ServerDataService.getHistoricalAmountsWithCurrentRate(studentId);

  // Format the amounts data for the graph
  const graphData = historicalData.amounts
    .map((item) => {
      const date = item.date instanceof Date ? item.date : new Date(item.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${day}/${month}/${year}`;
      const formattedAmount = formatearMoneda(item.amount, 0);

      return {
        date: formattedDate,
        amount: item.amount,
        formattedAmount: formattedAmount,
        sortKey: date.getTime(),
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey);

  // Format investment markers
  const investmentMarkers = historicalData.investmentMarkers.map((marker) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(),
      amount: marker.amount,
    };
  });

  // Format rate change markers
  const rateChangeMarkers = historicalData.rateChangeMarkers.map((marker) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(),
      rate: marker.rate,
    };
  });

  // Determine styling based on gain/loss
  const isPositive = gananciaTotal >= 0;
  const bgGradient = isPositive ? "from-emerald-50 to-green-50" : "from-red-50 to-pink-50";
  const borderColor = isPositive ? "border-emerald-200" : "border-red-200";
  const textColor = isPositive ? "text-emerald-600" : "text-red-600";
  const iconBgColor = isPositive ? "bg-emerald-100" : "bg-red-100";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${borderColor} p-6 w-full transition-all duration-300 hover:shadow-md`}
    >
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Ganancia Total</h3>
        </div>
        <div className="flex items-center">
          <Image src="/vcoin-xs.gif" alt="Vcoin Logo" width={20} height={20} className="opacity-60" unoptimized />
        </div>
      </div>

      {/* Main Gain Display */}
      <div className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-baseline space-x-1">
            {isPositive && <span className={`text-2xl font-bold ${textColor}`}>+</span>}
            <span className={`text-3xl font-bold ${textColor}`}>{formatearMoneda(Math.abs(gananciaTotal), 2)}%</span>
          </div>
        </div>
      </div>

      {/* Graph Section */}
      {graphData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2">Evolución de tu inversión</p>
          <HistoricalGainsGraph
            data={graphData}
            investmentMarkers={investmentMarkers}
            rateChangeMarkers={rateChangeMarkers}
            className="w-full h-full"
            isCollapsed={false}
          />
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs">
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
        </div>
      )}
    </div>
  );
}
