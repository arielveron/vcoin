import React from "react";
import { formatearMoneda } from "@/utils/format";
import { ClassSettings } from "@/db/pseudo-db";

interface InteresProps {
  classSettings: ClassSettings;
}

export default function Interes({ classSettings }: InteresProps) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      <div className="text-gray-700 flex flex-row items-center justify-center gap-2">
        {formatearMoneda(classSettings.monthly_interest_rate * 100)}%{" "}
        <span className="text-green-500">▲</span>
      </div>
      <div className="text-gray-700 text-xs">Interés mensual</div>
    </div>
  );
}
