'use client';

import React, { useEffect, useRef } from 'react';

interface HistoricalGainsGraphProps {
  data: Array<{
    date: string; // Pre-formatted date string to avoid hydration issues
    amount: number;
    formattedAmount: string; // Pre-formatted amount to avoid locale issues
    sortKey: number; // Pre-calculated sort key
  }>;
  investmentMarkers?: Array<{
    date: number; // Timestamp
    amount: number;
  }>;
  rateChangeMarkers?: Array<{
    date: number; // Timestamp
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

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Sort data by date to ensure proper line drawing
    const sortedData = [...data].sort((a, b) => a.sortKey - b.sortKey);

    if (sortedData.length < 2) {
      return; // Don't draw anything if insufficient data
    }

    // Graph dimensions - use full canvas
    const padding = 5;
    const graphWidth = rect.width - padding * 2;
    const graphHeight = rect.height - padding * 2;

    // Find min and max values
    const amounts = sortedData.map(d => d.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountRange = maxAmount - minAmount || 1; // Avoid division by zero

    // Helper function to get coordinates
    const getX = (index: number) => padding + (index / (sortedData.length - 1)) * graphWidth;
    const getY = (amount: number) => padding + ((maxAmount - amount) / amountRange) * graphHeight;

    // Draw the line only - minimal design
    ctx.strokeStyle = '#10B981'; // Green color
    ctx.lineWidth = 2;
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

    // Draw investment markers (blue dots)
    if (investmentMarkers.length > 0) {
      ctx.fillStyle = '#3B82F6'; // Blue color for investments
      const investmentRadius = 3;
      investmentMarkers.forEach(marker => {
        // Find the closest data point to get the X position
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
        
        // Draw investment marker dot
        ctx.beginPath();
        ctx.arc(x, y, investmentRadius, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw rate change markers (vertical red lines)
    if (rateChangeMarkers.length > 0) {
      ctx.strokeStyle = '#EF4444'; // Red color for rate changes
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 1]); // Dashed line pattern
      
      rateChangeMarkers.forEach(marker => {
        // Find the closest data point to get the X position
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
        
        // Draw vertical line from top to bottom of graph
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, rect.height - padding);
        ctx.stroke();
      });
      
      // Reset line style for future drawings
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
    }

  }, [data, investmentMarkers, rateChangeMarkers]);

  if (!data || data.length === 0) {
    return null; // Don't render anything if no data
  }

  return (
    <div className={`rounded ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-16"
      />
    </div>
  );
}
