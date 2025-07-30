"use client";

import { getCurrentMonto } from "@/actions/investment-actions";
import { ClassSettings } from "@/db/pseudo-db";
import React, { useState, useEffect, useRef } from "react";
import { DollarSign } from "lucide-react";

interface MontoActualProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoActual: number;
  classSettings: ClassSettings;
  studentId: number;
}

export default function MontoActual({
  montoActual: initialMonto,
  classSettings,
  studentId,
  className,
  ...props
}: MontoActualProps) {
  const [montoMostrado, setMontoMostrado] = useState(initialMonto);

  const montoObjetivoRef = useRef(initialMonto);
  const animacionRef = useRef<number | null>(null);

  const animarHaciaValor = (valorInicial: number, valorFinal: number) => {
    if (animacionRef.current) {
      cancelAnimationFrame(animacionRef.current);
    }

    const diferencia = valorFinal - valorInicial;
    const duracion = 10000;

    const tiempoInicio = Date.now();

    const animar = () => {
      const tiempoTranscurrido = Date.now() - tiempoInicio;
      const progreso = Math.min(tiempoTranscurrido / duracion, 1);

      const valorActual = valorInicial + diferencia * progreso;
      setMontoMostrado(valorActual);

      if (progreso < 1) {
        animacionRef.current = requestAnimationFrame(animar);
      } else {
        setMontoMostrado(valorFinal);
      }
    };

    animacionRef.current = requestAnimationFrame(animar);
  };

  useEffect(() => {
    const hasReachedEndDate = () => {
      const now = new Date();
      const endDate = new Date(classSettings.end_date.getTime());
      endDate.setHours(23, 59, 59, 999);

      if (classSettings.timezone && classSettings.timezone.includes("Argentina")) {
        endDate.setTime(endDate.getTime() + 3 * 60 * 60 * 1000);
      } else if (classSettings.timezone && classSettings.timezone.includes("Sao_Paulo")) {
        endDate.setTime(endDate.getTime() + 2 * 60 * 60 * 1000);
      }

      return now >= endDate;
    };

    if (hasReachedEndDate()) {
      setMontoMostrado(initialMonto);
      montoObjetivoRef.current = initialMonto;
      return;
    }

    const actualizarMonto = async () => {
      if (hasReachedEndDate()) {
        const finalMonto = initialMonto;
        animarHaciaValor(montoObjetivoRef.current, finalMonto);
        montoObjetivoRef.current = finalMonto;
        return;
      }

      try {
        const nuevoMonto = await getCurrentMonto(studentId);
        const montoAnterior = montoObjetivoRef.current;

        if (Math.abs(nuevoMonto - montoAnterior) > 0.00001) {
          // Note: previousMonto and isIncreasing removed for now, can be re-added later for percentage display
          animarHaciaValor(montoAnterior, nuevoMonto);
          montoObjetivoRef.current = nuevoMonto;
        }
      } catch (error) {
        console.warn("Error fetching current amount, using cached value:", error);
      }
    };

    actualizarMonto();

    const interval = setInterval(() => {
      if (!hasReachedEndDate()) {
        actualizarMonto();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, [initialMonto, studentId, classSettings]);

  const formatearConDecimales = (numero: number) => {
    const numeroCompleto = numero.toFixed(4);
    const [parteEntera, parteDecimal] = numeroCompleto.split(".");
    const enteroFormateado = parseInt(parteEntera).toLocaleString("es-ES");
    return { enteroFormateado, decimalesFormateados: parteDecimal };
  };

  const { enteroFormateado, decimalesFormateados } = formatearConDecimales(montoMostrado);

  // Calculate percentage change
  // const percentageChange = previousMonto !== 0 ? ((montoMostrado - previousMonto) / previousMonto) * 100 : 0;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl shadow-lg border border-emerald-200 py-8 px-2 transition-all duration-300 hover:shadow-xl ${className}`}
      {...props}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Sparkle Effects */}
      {/* <div className="absolute top-4 right-4">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
      </div> */}

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6 mx-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Saldo Actual</h2>
            <p className="text-sm text-gray-600">En tiempo real</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur border-green-300 border px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-700">LIVE</span>
        </div>
      </div>

      {/* Main Amount Display */}
      <div className="relative text-center py-4">
        <div className="inline-flex items-baseline space-x-1 text-nowrap">
          <span className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 -space-x-2">
            <span className="text-2xl">$</span> {enteroFormateado}
            <span className="text-4xl sm:text-6xl font-bold text-gray-500">,</span>
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 self-start">
            {decimalesFormateados}
          </span>
        </div>

        {/* Change Indicator */}
        {/* {percentageChange !== 0 && (
          <div
            className={`mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              isIncreasing ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${isIncreasing ? "text-green-600" : "text-red-600 rotate-180"}`} />
            <span className={`text-sm font-medium ${isIncreasing ? "text-green-700" : "text-red-700"}`}>
              {isIncreasing ? "+" : ""}
              {percentageChange.toFixed(4)}%
            </span>
          </div>
        )} */}
      </div>

      {/* Footer Info */}
      {/* <div className="relative mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/50 backdrop-blur rounded-lg">
          <p className="text-xs text-gray-600">Actualización</p>
          <p className="text-sm font-semibold text-gray-800">Cada 10s</p>
        </div>
        <div className="text-center p-3 bg-white/50 backdrop-blur rounded-lg">
          <p className="text-xs text-gray-600">Precisión</p>
          <p className="text-sm font-semibold text-gray-800">4 decimales</p>
        </div>
        <div className="text-center p-3 bg-white/50 backdrop-blur rounded-lg">
          <p className="text-xs text-gray-600">Estado</p>
          <p className="text-sm font-semibold text-emerald-600">Activo</p>
        </div>
      </div> */}
    </div>
  );
}
