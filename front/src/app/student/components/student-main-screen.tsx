import React from "react";
import MontoActual from "./monto-actual";
import Interes from "./interes";
import Ganancia from "./ganancia";
import Estimado from "./estimado";
import ListInvertidos from "./list-invertidos";
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

  return (
    <div className="grid grid-cols-2 gap-4 items-start justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
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
  );
}
