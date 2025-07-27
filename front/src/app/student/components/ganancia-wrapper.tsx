// ganancia-wrapper.tsx
import React from "react";
import { formatearMoneda } from "@/utils/format";
import { ServerDataService } from "@/services/server-data-service";
import GananciaCollapsible from "./ganancia-collapsible";
import { GraphDataPoint, InvestmentMarker, RateChangeMarker, HistoricalAmount } from "@/types/database";

interface GananciaWrapperProps {
  gananciaTotal: number;
  studentId: number;
}

export default async function GananciaWrapper({ gananciaTotal, studentId }: GananciaWrapperProps) {
  const historicalData = await ServerDataService.getHistoricalAmountsWithCurrentRate(studentId);
  
  const graphData: GraphDataPoint[] = historicalData.amounts
    .map((item: HistoricalAmount) => {
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
    .sort((a: GraphDataPoint, b: GraphDataPoint) => a.sortKey - b.sortKey);

  const investmentMarkers: InvestmentMarker[] = historicalData.investmentMarkers.map((marker: { date: Date; amount: number }) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(),
      amount: marker.amount,
    };
  });

  const rateChangeMarkers: RateChangeMarker[] = historicalData.rateChangeMarkers.map((marker: { date: Date; rate: number }) => {
    const date = marker.date instanceof Date ? marker.date : new Date(marker.date);
    return {
      date: date.getTime(),
      rate: marker.rate,
    };
  });

  return (
    <GananciaCollapsible
      gananciaTotal={gananciaTotal}
      graphData={graphData}
      investmentMarkers={investmentMarkers}
      rateChangeMarkers={rateChangeMarkers}
    />
  );
}