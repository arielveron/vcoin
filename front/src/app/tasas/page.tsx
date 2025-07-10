"use client"
import { useState } from "react";
import Footer from "@/app/components/footer";

function calculateRates({ value, type }: { value: number; type: "mensual" | "anual" | "diaria" | "segundos" }) {
  let mensual = 0,
    anual = 0,
    diaria = 0,
    segundos = 0;
  if (type === "mensual") {
    mensual = value;
    anual = Math.pow(1 + mensual, 12) - 1;
    diaria = Math.pow(1 + mensual, 1 / 30) - 1;
    segundos = Math.pow(1 + mensual, 1 / 2592000) - 1;
  } else if (type === "anual") {
    anual = value;
    mensual = Math.pow(1 + anual, 1 / 12) - 1;
    diaria = Math.pow(1 + mensual, 1 / 30) - 1;
    segundos = Math.pow(1 + mensual, 1 / 2592000) - 1;
  } else if (type === "diaria") {
    diaria = value;
    mensual = Math.pow(1 + diaria, 30) - 1;
    anual = Math.pow(1 + mensual, 12) - 1;
    segundos = Math.pow(1 + diaria, 1 / 86400) - 1;
  } else if (type === "segundos") {
    segundos = value;
    mensual = Math.pow(1 + segundos, 2592000) - 1;
    diaria = Math.pow(1 + segundos, 86400) - 1;
    anual = Math.pow(1 + mensual, 12) - 1;
  }
  return {
    mensual,
    anual,
    diaria,
    segundos,
  };
}

export default function Pasaje() {
  const [inputType, setInputType] = useState<"mensual" | "anual" | "diaria" | "segundos">("mensual");
  const [inputValue, setInputValue] = useState(0.027);
  const rates = calculateRates({ value: inputValue, type: inputType });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Calculadora de Tasas Equivalentes</h2>
        <form className="flex flex-col gap-4 w-full bg-white/80 rounded-lg p-6 shadow">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Tipo de tasa que ingresas:</span>
            <select
              className="border rounded px-2 py-1"
              value={inputType}
              onChange={(e) => setInputType(e.target.value as any)}
            >
              <option value="mensual">Efectiva Mensual</option>
              <option value="anual">Efectiva Anual</option>
              <option value="diaria">Efectiva Diaria</option>
              <option value="segundos">Efectiva por Segundo</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Valor de la tasa ({inputType}):</span>
            <input
              type="number"
              step="0.000001"
              min="0"
              max="1"
              className="border rounded px-2 py-1"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
            />
            <span className="text-xs text-gray-500">Ejemplo: 0.027 para 2.7%</span>
          </label>
        </form>
        <div className="mt-4 w-full bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2">
          <div>
            <span className="font-semibold">Tasa Efectiva Anual:</span> {(rates.anual).toFixed(10)}
          </div>
          <div>
            <span className="font-semibold">Tasa Efectiva Mensual:</span> {(rates.mensual).toFixed(10)}
          </div>
          <div>
            <span className="font-semibold">Tasa Efectiva Diaria:</span> {(rates.diaria).toFixed(10)}
          </div>
          <div>
            <span className="font-semibold">Tasa Efectiva por Segundo:</span> {(rates.segundos).toFixed(20)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
