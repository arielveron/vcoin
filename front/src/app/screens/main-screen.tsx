import React from "react";
import MontoActual from "@/app/components/monto-actual";
import Interes from "@/app/components/interes";
import Ganancia from "@/app/components/ganancia";
import Estimado from "@/app/components/estimado";
import ListInvertidos from "@/app/components/list-invertidos";
import { ServerDataService } from "@/services/server-data-service";
import { calculateMontoActual, calculateGananciaTotal, calculateMontoAFinalizacion } from "@/logic/calculations";

export default async function MainScreen() {
  // For now, hardcoded student ID = 1, but this could come from authentication
  const studentId = 1;
  
  // Fetch data on the server
  const totalInvertido = await ServerDataService.getTotalInvested(studentId);
  const listInvertidos = await ServerDataService.getInvestmentsList(studentId);
  const classSettings = await ServerDataService.getStudentClassSettings(studentId);
  
  // Calculate derived values on the server using class-specific settings
  const montoActual = calculateMontoActual(listInvertidos, classSettings);
  const gananciaTotal = calculateGananciaTotal(listInvertidos, classSettings);
  const montoEstimado = calculateMontoAFinalizacion(listInvertidos, classSettings);

  return (
    <div className="grid grid-cols-2 gap-4 items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
      <div className='col-span-2 text-gray-700 font-bold text-center [family-name:var(--font-geist-mono)]'>VCOIN</div>
      <MontoActual 
        className="col-span-2" 
        montoActual={montoActual}
        classSettings={classSettings}
      />
      <Interes 
        classSettings={classSettings}
      />
      <Ganancia 
        gananciaTotal={gananciaTotal}
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
