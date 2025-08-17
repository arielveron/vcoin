import React from "react";
import MontoActual from "./monto-actual";
import InteresWrapper from "./interes-wrapper";
import GananciaWrapper from "./ganancia-wrapper";
import EstimadoCollapsible from "./estimado-collapsible";
import ListInvertidos from "./list-invertidos";
import DashboardAchievementCelebrations from "./dashboard-achievement-celebrations";
import { CollapsibleProvider } from "@/presentation/hooks/useCollapsibleStore";
import { ServerDataService } from "@/services/server-data-service";

interface StudentMainScreenProps {
  studentId: number;
}

export default async function StudentMainScreen({ studentId }: StudentMainScreenProps) {
  // Fetch data for the specific student
  const totalInvertido = await ServerDataService.getTotalInvested(studentId);
  const listInvertidos = await ServerDataService.getInvestmentsList(studentId);
  const classSettings = await ServerDataService.getStudentClassSettings(studentId);

  // Calculate derived values using current rates
  const montoActual = await ServerDataService.calculateMontoActual(studentId);
  const gananciaTotal = await ServerDataService.calculateGananciaTotal(studentId);
  const montoEstimado = await ServerDataService.calculateMontoEstimado(studentId);

  // Fetch achievement data for celebrations
  const unseenAchievements = await ServerDataService.getUnseenAchievements(studentId);

  // Determine the first investment date for the list
  const firstInvestmentDate =
    listInvertidos.length > 0
      ? new Date(Math.min(...listInvertidos.map((inv) => new Date(inv.fecha).getTime())))
      : undefined;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Main Dashboard Container */}
      <div className="space-y-6">
        {/* Monto Actual - Full Width */}
        <MontoActual className="w-full" montoActual={montoActual} classSettings={classSettings} studentId={studentId} />

        {/* Stats Grid - Responsive with Collapsible Components */}
        <CollapsibleProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InteresWrapper studentId={studentId} />
            <GananciaWrapper gananciaTotal={gananciaTotal} studentId={studentId} />
          </div>

          {/* Estimado - Full Width Collapsible */}
          <EstimadoCollapsible
            className="w-full"
            montoEstimado={montoEstimado}
            classSettings={classSettings}
            firstInvestmentDate={firstInvestmentDate}
          />

          {/* Investment List - Full Width */}
          <ListInvertidos className="w-full" totalInvertido={totalInvertido} listInvertidos={listInvertidos} />
        </CollapsibleProvider>
      </div>

      {/* Achievement Celebrations - Shows confetti and celebrations for new achievements */}
      <DashboardAchievementCelebrations unseenAchievements={unseenAchievements} />
    </div>
  );
}
