"use client";

import { getCurrentMonto } from "@/actions/investment-actions";
import { ClassSettings } from "@/db/pseudo-db";
import React, { useState, useEffect, useRef } from "react";

interface MontoActualProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoActual: number; // Initial amount from server
  classSettings: ClassSettings; // Class-specific settings
  studentId: number; // Student ID for fetching updates
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
    const duracion = 10000; // Animation duration close to fetch interval (10s) for continuous effect

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
    // Check if we've reached the end date using class settings
    const hasReachedEndDate = () => {
      const now = new Date();
      const endDate = new Date(classSettings.end_date.getTime());
      endDate.setHours(23, 59, 59, 999);

      // Handle timezone conversion for Argentina (GMT-3)
      if (classSettings.timezone && classSettings.timezone.includes("Argentina")) {
        endDate.setTime(endDate.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
      }
      // Handle timezone conversion for Sao Paulo (GMT-2)
      else if (classSettings.timezone && classSettings.timezone.includes("Sao_Paulo")) {
        endDate.setTime(endDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      }

      return now >= endDate;
    };

    // Don't start any timers if we've reached the end date
    if (hasReachedEndDate()) {
      setMontoMostrado(initialMonto);
      montoObjetivoRef.current = initialMonto;
      return;
    }

    const actualizarMonto = async () => {
      // Check again before each update
      if (hasReachedEndDate()) {
        const finalMonto = initialMonto; // Use initial value if reached end
        animarHaciaValor(montoObjetivoRef.current, finalMonto);
        montoObjetivoRef.current = finalMonto;
        return;
      }

      try {
        // Fetch fresh data from server with correct student ID
        const nuevoMonto = await getCurrentMonto(studentId);
        const montoAnterior = montoObjetivoRef.current;

        if (Math.abs(nuevoMonto - montoAnterior) > 0.00001) {
          animarHaciaValor(montoAnterior, nuevoMonto);
          montoObjetivoRef.current = nuevoMonto;
        }
      } catch (error) {
        console.warn("Error fetching current amount, using cached value:", error);
      }
    };

    // Start immediately, then continue with 10-second intervals
    actualizarMonto(); // First call immediately

    const interval = setInterval(() => {
      if (!hasReachedEndDate()) {
        actualizarMonto();
      }
    }, 10000); // 10-second interval for subsequent calls

    return () => {
      clearInterval(interval);
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, [initialMonto, studentId, classSettings]); // Dependencies for useEffect

  // ✅ Función más robusta para formatear
  const formatearConDecimales = (numero: number) => {
    // Convertir a string con 3 decimales
    const numeroCompleto = numero.toFixed(4);
    const [parteEntera, parteDecimal] = numeroCompleto.split(".");

    // Formatear parte entera con separador de miles
    const enteroFormateado = parseInt(parteEntera).toLocaleString("es-ES");

    return { enteroFormateado, decimalesFormateados: parteDecimal };
  };

  const { enteroFormateado, decimalesFormateados } = formatearConDecimales(montoMostrado);

  return (
    <div
      className={`bg-gradient-to-b from-yellow-50 to-green-200 border border-green-300 rounded-lg p-4 col-span-2 ${className}`}
      {...props}
    >
      <div className="font-bold text-4xl text-center text-green-600">
        $ {enteroFormateado},<span className="align-super text-xs font-mono">{decimalesFormateados}</span>
      </div>
    </div>
  );
}
