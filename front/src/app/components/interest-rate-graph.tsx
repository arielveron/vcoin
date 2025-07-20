"use client";

import React from "react";

interface InterestRateGraphProps {
  rates: { date: string; rate: number; formattedPercentage: string; sortKey: number }[]; // Pre-formatted data
  className?: string;
}

export default function InterestRateGraph({ rates, className = "" }: InterestRateGraphProps) {
  if (!rates || rates.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="relative bg-white rounded p-2">
          <div className="h-16 flex items-center justify-center">
            <div className="text-gray-400 text-xs">Sin datos</div>
          </div>
        </div>
      </div>
    );
  }

  // Data is already sorted on the server, no need to sort again
  const sortedRates = rates;

  // Find min and max rates for scaling
  const minRate = Math.min(...sortedRates.map(r => r.rate));
  const maxRate = Math.max(...sortedRates.map(r => r.rate));
  const rateRange = maxRate - minRate || 0.001; // Avoid division by zero
  
  // Graph dimensions
  const graphWidth = 200;
  const graphHeight = 60;
  const padding = 10;
  
  // Calculate points for the line
  const points = sortedRates.map((rate, index) => {
    const x = padding + (index / (sortedRates.length - 1)) * (graphWidth - 2 * padding);
    const y = graphHeight - padding - ((rate.rate - minRate) / rateRange) * (graphHeight - 2 * padding);
    return { x, y, rate: rate.rate, date: rate.date, formattedPercentage: rate.formattedPercentage };
  });
  
  // Calculate segment colors for each movement
  const segments = points.slice(1).map((point, index) => {
    const prevPoint = points[index];
    const currentRate = point.rate;
    const previousRate = prevPoint.rate;
    
    let segmentColor;
    if (currentRate > previousRate) {
      segmentColor = '#10b981'; // green-500 for up
    } else if (currentRate < previousRate) {
      segmentColor = '#ef4444'; // red-500 for down
    } else {
      segmentColor = '#6b7280'; // gray-500 for no change
    }
    
    return {
      x1: prevPoint.x,
      y1: prevPoint.y,
      x2: point.x,
      y2: point.y,
      color: segmentColor
    };
  });

  // Generate a stable ID for the SVG pattern based on data hash to avoid hydration issues
  const dataHash = sortedRates.length > 0 ? 
    sortedRates.map(r => `${r.date}-${r.rate}`).join('').length.toString(36) : 
    'default';
  const patternId = `grid-pattern-${dataHash}`;

  return (
    <div className={`${className}`}>
      {/* SVG Line Graph */}
      <div className="relative bg-white rounded p-2">
        <svg 
          width={graphWidth} 
          height={graphHeight} 
          className="w-full h-auto"
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          
          {/* Individual line segments with colors based on movement */}
          {segments.map((segment, index) => (
            <line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={segment.color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          
          {/* Data points */}
          {points.map((point, index) => {
            let dotColor;
            if (index === 0) {
              // First point is always gray
              dotColor = '#6b7280';
            } else {
              // Use the same color logic as the segment leading to this point
              const currentRate = point.rate;
              const previousRate = points[index - 1].rate;
              
              if (currentRate > previousRate) {
                dotColor = '#10b981'; // green-500 for up
              } else if (currentRate < previousRate) {
                dotColor = '#ef4444'; // red-500 for down
              } else {
                dotColor = '#6b7280'; // gray-500 for no change
              }
            }
            
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={dotColor}
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
