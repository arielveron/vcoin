import React from "react";
import MontoActual from "./monto-actual";
import Interes from "./interes";
import Ganancia from "./ganancia";
import Estimado from "./estimado";
import ListInvertidos from "./list-invertidos";
import AchievementSection from "./achievement-section";
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

  // Fetch achievement data
  const achievements = await ServerDataService.getStudentAchievements(studentId);
  const achievementStats = await ServerDataService.getStudentAchievementStats(studentId);
  const unseenAchievements = await ServerDataService.getUnseenAchievements(studentId);

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Investment Dashboard */}
      <div className="grid grid-cols-2 gap-4 items-start justify-center px-2 py-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <div className='col-span-2 text-gray-700 font-bold text-center [family-name:var(--font-geist-mono)]'>VCOIN</div>
        <MontoActual 
          className="col-span-2" 
          montoActual={montoActual}
          classSettings={classSettings}
          studentId={studentId}
        />
        <Interes 
          classSettings={classSettings}
          studentId={studentId}
        />
        <Ganancia 
          gananciaTotal={gananciaTotal}
          studentId={studentId}
        />
        
        <Estimado 
          className="col-span-2" 
          montoEstimado={montoEstimado}
          classSettings={classSettings}
        />
        <hr className="col-span-2 border-gray-300" />
        <ListInvertidos 
          className="col-span-2" 
          totalInvertido={totalInvertido} 
          listInvertidos={listInvertidos} 
        />
      </div>

      {/* Achievement Section */}
      <AchievementSection 
        achievements={achievements}
        studentStats={achievementStats}
        unseenAchievements={unseenAchievements}
      />
    </div>
  );
}
