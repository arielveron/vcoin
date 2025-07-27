import React from "react";
import { formatearMoneda } from "@/utils/format";
import { ClassSettings, InterestRateHistory } from "@/types/database";
import { ServerDataService } from "@/services/server-data-service";
import InterestRateGraph from "./interest-rate-graph";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InteresProps {
  classSettings: ClassSettings;
  studentId: number;
}

export default async function Interes({ studentId }: InteresProps) {
  // Get current rate and rate change information
  const classId = await ServerDataService.getStudentClassId(studentId);
  const currentRate = await ServerDataService.getCurrentInterestRate(classId);
  const latestRateChange = await ServerDataService.getLatestRateChange(classId);

  // Get historical rates for the graph
  const historicalRates = await ServerDataService.getInterestRateHistory(classId);
  const rateData = historicalRates
    .map((rate: InterestRateHistory) => {
      const date = rate.effective_date instanceof Date ? rate.effective_date : new Date(rate.effective_date);

      // Format date consistently on the server to avoid hydration issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${day}/${month}/${year}`;

      // Pre-format the percentage to avoid locale-based hydration issues
      const percentage = rate.monthly_interest_rate * 100;
      const formattedPercentage = percentage.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return {
        date: formattedDate,
        rate: rate.monthly_interest_rate,
        formattedPercentage: formattedPercentage,
        sortKey: date.getTime(),
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey);

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
    <div
      className={`bg-white rounded-lg shadow-sm border ${borderColor} p-6 w-full transition-all duration-300 hover:shadow-md`}
    >
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Interés Mensual</h3>
        </div>
        {direction && <Icon className={`w-4 h-4 ${trendColor}`} />}
      </div>

      {/* Main Rate Display */}
      <div className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 mb-4`}>
        <div className="flex items-baseline justify-center space-x-2">
          <span className={`text-3xl font-bold ${trendColor}`}>{formatearMoneda(currentRate * 100)}%</span>
          {latestRateChange && latestRateChange.previous_rate !== null && (
            <span className={`text-sm ${trendColor} font-medium`}>
              {direction === "up" ? "+" : "-"}
              {Math.abs(
                ((currentRate - latestRateChange.previous_rate) / latestRateChange.previous_rate) * 100
              ).toFixed(1)}
              %
            </span>
          )}
        </div>
        {latestRateChange && latestRateChange.previous_rate !== null && (
          <div>
            <p className="text-xs text-center mt-2 text-gray-600">
              {direction === "up" ? "Subió" : "Bajó"} desde {formatearMoneda(latestRateChange.previous_rate * 100)}%
            </p>
            <p className="text-xs text-center mt-2 text-gray-600">
              {direction === "up" ? "¡Excelente rendimiento!" : "Mantén la calma, el mercado fluctúa"}
            </p>
          </div>
        )}
      </div>

      {/* Graph Section */}
      {rateData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2">Historial de tasas</p>
          <InterestRateGraph rates={rateData} className="w-full" />
        </div>
      )}
    </div>
  );
}
