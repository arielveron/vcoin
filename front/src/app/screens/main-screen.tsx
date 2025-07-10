import React from "react";
import MontoActual from "@/app/components/monto-actual";
import Interes from "@/app/components/interes";
import Ganancia from "@/app/components/ganancia";
import Estimado from "@/app/components/estimado";
import ListInvertidos from "@/app/components/list-invertidos";

export default function MainScreen() {
  return (
    <div className="grid grid-cols-2 gap-4 items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
      <div className='col-span-2 text-gray-700 font-bold text-center [family-name:var(--font-geist-mono)]'>VCOIN</div>
      <MontoActual className="col-span-2" />
      <Interes />
      <Ganancia />
      <Estimado className="col-span-2" />
      <hr className="col-span-2 border-gray-300" />
      <ListInvertidos className="col-span-2" />
    </div>
  );
}
