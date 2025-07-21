import { formatearMoneda } from "@/utils/format";
import Image from "next/image";
import React from "react";
import { ServerDataService } from "@/services/server-data-service";
import HistoricalGainsGraph from "./historical-gains-graph";

interface GananciaProps {
  gananciaTotal: number;
  studentId?: number;
}

export default async function Ganancia({ gananciaTotal, studentId = 1 }: GananciaProps) {
  // Get historical amounts for the ganancia total graph - shows what amounts would have looked like at each date
  // This shows the "current evaluation" effect where rate changes cause historical values to spike up or drop down
  const historicalData = await ServerDataService.getHistoricalAmountsWithCurrentRate(studentId);
  console.log("Historical Data:", historicalData);
  
  // Format the amounts data for the graph to avoid hydration issues
  const graphData = historicalData.amounts
    .map((item) => {
      const date = item.date instanceof Date ? item.date : new Date(item.date);

      // Format date consistently on the server to avoid hydration issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${day}/${month}/${year}`;

      // Pre-format the amount to avoid locale-based hydration issues
      const formattedAmount = formatearMoneda(item.amount, 0);

      return {
        date: formattedDate, // Pre-formatted date string
        amount: item.amount, // Keep original amount for calculations
        formattedAmount: formattedAmount, // Pre-formatted amount
        sortKey: date.getTime(), // Pre-calculated sort key
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey); // Sort on server to avoid client-side date operations

  // Format investment markers
  const investmentMarkers = historicalData.investmentMarkers.map((marker) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(), // Convert to timestamp for graph
      amount: marker.amount,
    };
  });

  // Format rate change markers
  const rateChangeMarkers = historicalData.rateChangeMarkers.map((marker) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(), // Convert to timestamp for graph
      rate: marker.rate,
    };
  });

  console.log("Graph Data:", graphData);
  console.log("Investment Markers:", investmentMarkers);
  console.log("Rate Change Markers:", rateChangeMarkers);
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      {/* Integrated Historical Gains Graph */}
      <HistoricalGainsGraph 
        data={graphData}
        investmentMarkers={investmentMarkers}
        rateChangeMarkers={rateChangeMarkers}
        className="w-full"
      />
      <div className="text-gray-700 flex flex-row items-center justify-center gap-2">
        {formatearMoneda(gananciaTotal, 2)}%
        <Image src="/vcoin-xs.gif" alt="Vcoin Logo" width={15} height={16} className="col-span-2 mx-auto" unoptimized />
      </div>
      <div className="text-gray-700 text-xs">Ganancia total</div>
    </div>
  );
}
