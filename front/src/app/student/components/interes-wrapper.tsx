// interes-wrapper.tsx
import React from "react";
import { ServerDataService } from "@/services/server-data-service";
import InteresCollapsible from "./interes-collapsible";
import { InterestRateHistory, RateDataPoint } from "@/types/database";
import { formatPercentage } from "@/shared/utils/formatting";

interface InteresWrapperProps {
  studentId: number;
}

export default async function InteresWrapper({ studentId }: InteresWrapperProps) {
  // Get current rate and rate change information
  const classId = await ServerDataService.getStudentClassId(studentId);
  const currentRate = await ServerDataService.getCurrentInterestRate(classId);
  const latestRateChange = await ServerDataService.getLatestRateChange(classId);

  // Get historical rates for the graph
  const historicalRates = await ServerDataService.getInterestRateHistory(classId);
  const rateData: RateDataPoint[] = historicalRates
    .map((rate: InterestRateHistory) => {
      const date = rate.effective_date instanceof Date ? rate.effective_date : new Date(rate.effective_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${day}/${month}/${year}`;
      const formattedPercentage = formatPercentage(rate.monthly_interest_rate);

      return {
        date: formattedDate,
        rate: rate.monthly_interest_rate,
        formattedPercentage: formattedPercentage,
        sortKey: date.getTime(),
      };
    })
    .sort((a: RateDataPoint, b: RateDataPoint) => a.sortKey - b.sortKey);

  return (
    <InteresCollapsible
      currentRate={currentRate}
      latestRateChange={latestRateChange}
      rateData={rateData}
    />
  );
}
