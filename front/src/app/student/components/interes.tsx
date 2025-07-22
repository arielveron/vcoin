import React from "react";
import { formatearMoneda } from "@/utils/format";
import { ClassSettings, InterestRateHistory } from "@/types/database";
import { ServerDataService } from "@/services/server-data-service";
import InterestRateGraph from "./interest-rate-graph";

interface InteresProps {
  classSettings: ClassSettings;
  studentId: number; // Required student ID
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
        date: formattedDate, // Pre-formatted date string
        rate: rate.monthly_interest_rate, // Keep original rate for calculations
        formattedPercentage: formattedPercentage, // Pre-formatted percentage
        sortKey: date.getTime(), // Pre-calculated sort key
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey); // Sort on server to avoid client-side date operations

  // Determine the direction and color
  let direction = null;
  let colorClass = "text-gray-500";
  let icon = "";

  if (latestRateChange) {
    if (latestRateChange.rate_direction === "up") {
      direction = "up";
      colorClass = "text-green-600";
      icon = "▲";
    } else if (latestRateChange.rate_direction === "down") {
      direction = "down";
      colorClass = "text-red-600";
      icon = "▼";
    }
  }

  return (
    <div className="flex flex-col gap-3 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      {/* Integrated Interest Rate Graph */}
      <InterestRateGraph rates={rateData} className="w-full mt-1" />
      <div className="text-gray-700 flex flex-row items-center justify-center gap-2">
        <span className={colorClass}>{formatearMoneda(currentRate * 100)}%</span>
        {icon && (
          <span
            className={colorClass}
            title={
              direction === "up"
                ? `Subió desde ${formatearMoneda((latestRateChange?.previous_rate || 0) * 100)}%`
                : `Bajó desde ${formatearMoneda((latestRateChange?.previous_rate || 0) * 100)}%`
            }
          >
            {icon}
          </span>
        )}
      </div>
      <div className="text-gray-700 text-xs">Interés mensual</div>
    </div>
  );
}
