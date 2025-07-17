'use client';

import { endDate } from '@/config/settings'
import { getCurrentMonto } from '@/actions/investment-actions'
import React, { useState, useEffect, useRef } from 'react'

interface MontoActualProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoActual: number; // Initial amount from server
}

export default function MontoActual({ montoActual: initialMonto, className, ...props }: MontoActualProps) {
  // Check if we've reached the end date
  const hasReachedEndDate = () => new Date() >= new Date(endDate);
  
  const [montoMostrado, setMontoMostrado] = useState(initialMonto);
  
  const montoObjetivoRef = useRef(initialMonto);
  const animacionRef = useRef<number | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);

  const animarHaciaValor = (valorInicial: number, valorFinal: number) => {
    if (animacionRef.current) {
      cancelAnimationFrame(animacionRef.current);
    }

    setEnAnimacion(true);
    const diferencia = valorFinal - valorInicial;
    const duracion = 10000; // Animation duration close to fetch interval (10s) for continuous effect
    
    const tiempoInicio = Date.now();

    const animar = () => {
      const tiempoTranscurrido = Date.now() - tiempoInicio;
      const progreso = Math.min(tiempoTranscurrido / duracion, 1);
      
      const valorActual = valorInicial + (diferencia * progreso);
      setMontoMostrado(valorActual);

      if (progreso < 1) {
        animacionRef.current = requestAnimationFrame(animar);
      } else {
        setMontoMostrado(valorFinal);
        setEnAnimacion(false);
      }
    };

    animacionRef.current = requestAnimationFrame(animar);
  };

  useEffect(() => {
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
        // Fetch fresh data from server
        const nuevoMonto = await getCurrentMonto();
        const montoAnterior = montoObjetivoRef.current;
        
        if (Math.abs(nuevoMonto - montoAnterior) > 0.00001) {
          animarHaciaValor(montoAnterior, nuevoMonto);
          montoObjetivoRef.current = nuevoMonto;
        }
      } catch (error) {
        console.warn('Error fetching current amount, using cached value:', error);
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
  }, [initialMonto]); // Remove enAnimacion from dependencies

  // ✅ Función más robusta para formatear
  const formatearConDecimales = (numero: number) => {
    // Convertir a string con 3 decimales
    const numeroCompleto = numero.toFixed(4);
    const [parteEntera, parteDecimal] = numeroCompleto.split('.');
    
    // Formatear parte entera con separador de miles
    const enteroFormateado = parseInt(parteEntera).toLocaleString('es-ES');
    
    return { enteroFormateado, decimalesFormateados: parteDecimal };
  };

  const { enteroFormateado, decimalesFormateados } = formatearConDecimales(montoMostrado);

  return (
    <div className={`col-span-2 font-bold text-2xl text-center text-green-600 ${className}`} {...props}>
      $ {enteroFormateado},<span className='align-super text-xs'>{decimalesFormateados}</span>
    </div>
  );
}