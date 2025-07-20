'use client';

import React, { useEffect, useRef } from 'react';

interface HistoricalGainsGraphProps {
  data: Array<{
    date: string; // Pre-formatted date string to avoid hydration issues
    amount: number;
    formattedAmount: string; // Pre-formatted amount to avoid locale issues
    sortKey: number; // Pre-calculated sort key
  }>;
  className?: string;
}

export default function HistoricalGainsGraph({ data, className = "" }: HistoricalGainsGraphProps) {
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

  }, [data]);

  if (!data || data.length === 0) {
    return null; // Don't render anything if no data
  }

  return (
    <div className={`bg-white rounded ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-16"
      />
    </div>
  );
}
