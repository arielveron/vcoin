'use client';

import { getMontoActual } from '@/logic/calculations'
import React, { useState, useEffect, useRef } from 'react'

export default function MontoActual(
  props: React.HTMLAttributes<HTMLDivElement> & { className?: string }
) {
  const [montoMostrado, setMontoMostrado] = useState(() => getMontoActual());
  
  const montoObjetivoRef = useRef(getMontoActual());
  const animacionRef = useRef<number | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);

  const animarHaciaValor = (valorInicial: number, valorFinal: number) => {
    if (animacionRef.current) {
      cancelAnimationFrame(animacionRef.current);
    }

    setEnAnimacion(true);
    const diferencia = valorFinal - valorInicial;
    const duracion = 1200;
    
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
    const actualizarMonto = () => {
      const nuevoMonto = getMontoActual();
      const montoAnterior = montoObjetivoRef.current;
      
      if (Math.abs(nuevoMonto - montoAnterior) > 0.00001) {
        animarHaciaValor(montoAnterior, nuevoMonto);
        montoObjetivoRef.current = nuevoMonto;
      }
    };

    const getIntervalo = () => enAnimacion ? 2000 : 800;
    
    const programarSiguiente = () => {
      setTimeout(() => {
        actualizarMonto();
        programarSiguiente();
      }, getIntervalo());
    };

    programarSiguiente();
    
    return () => {
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, [enAnimacion]);

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
    <div className={`col-span-2 font-bold text-2xl text-center text-green-600 ${props.className}`}>
      $ {enteroFormateado},<span className='align-super text-xs'>{decimalesFormateados}</span>
    </div>
  );
}