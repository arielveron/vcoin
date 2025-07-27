'use client';

import React, { useEffect, useRef } from 'react';

interface HistoricalGainsGraphProps {
  data: Array<{
    date: string;
    amount: number;
    formattedAmount: string;
    sortKey: number;
  }>;
  investmentMarkers?: Array<{
    date: number;
    amount: number;
  }>;
  rateChangeMarkers?: Array<{
    date: number;
    rate: number;
  }>;
  className?: string;
}

export default function HistoricalGainsGraph({ 
  data, 
  investmentMarkers = [], 
  rateChangeMarkers = [], 
  className = "" 
}: HistoricalGainsGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.sortKey - b.sortKey);

    if (sortedData.length < 2) {
      // Draw "No sufficient data" message
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Datos insuficientes', rect.width / 2, rect.height / 2);
      return;
    }

    // Graph dimensions
    const padding = 15;
    const graphWidth = rect.width - padding * 2;
    const graphHeight = rect.height - padding * 2;

    // Find min and max values with some padding
    const amounts = sortedData.map(d => d.amount);
    const minAmount = Math.min(...amounts) * 0.98;
    const maxAmount = Math.max(...amounts) * 1.02;
    const amountRange = maxAmount - minAmount || 1;

    // Helper functions
    const getX = (index: number) => padding + (index / (sortedData.length - 1)) * graphWidth;
    const getY = (amount: number) => padding + ((maxAmount - amount) / amountRange) * graphHeight;

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);

    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, padding, 0, rect.height - padding);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    // Draw area fill
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), rect.height - padding);
    ctx.lineTo(getX(0), getY(sortedData[0].amount));
    
    sortedData.forEach((point, index) => {
      if (index > 0) {
        ctx.lineTo(getX(index), getY(point.amount));
      }
    });
    
    ctx.lineTo(getX(sortedData.length - 1), rect.height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw the main line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    sortedData.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.amount);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw investment markers
    if (investmentMarkers.length > 0) {
      investmentMarkers.forEach(marker => {
        const markerTime = marker.date;
        let closestIndex = 0;
        let closestDistance = Math.abs(sortedData[0].sortKey - markerTime);
        
        for (let i = 1; i < sortedData.length; i++) {
          const distance = Math.abs(sortedData[i].sortKey - markerTime);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
        
        const x = getX(closestIndex);
        const y = getY(marker.amount);
        
        // Draw white circle with blue border
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw rate change markers
    if (rateChangeMarkers.length > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      
      rateChangeMarkers.forEach(marker => {
        const markerTime = marker.date;
        let closestIndex = 0;
        let closestDistance = Math.abs(sortedData[0].sortKey - markerTime);
        
        for (let i = 1; i < sortedData.length; i++) {
          const distance = Math.abs(sortedData[i].sortKey - markerTime);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
        
        const x = getX(closestIndex);
        
        // Draw vertical dashed line
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, rect.height - padding);
        ctx.stroke();
      });
      
      ctx.setLineDash([]);
    }

  }, [data, investmentMarkers, rateChangeMarkers]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: '100%', height: 'inherit' }}
      />
    </div>
  );
}