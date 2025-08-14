"use client";

import React from "react";

interface InterestRateGraphProps {
  rates: { date: string; rate: number; formattedPercentage: string; sortKey: number }[];
  className?: string;
}

export default function InterestRateGraph({ rates, className = "" }: InterestRateGraphProps) {
  if (!rates || rates.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="relative bg-white rounded-lg p-4">
          <div className="h-20 flex items-center justify-center">
            <div className="text-gray-400 text-sm">Sin datos disponibles</div>
          </div>
        </div>
      </div>
    );
  }

  const sortedRates = rates;

  // Handle single data point case
  if (sortedRates.length === 1) {
    const singleRate = sortedRates[0];
    return (
      <div className={`${className}`}>
        <div className="relative bg-white rounded-lg p-4">
          <div className="h-20 flex items-center justify-center flex-col space-y-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="text-gray-600 text-xs text-center">
              <div>{singleRate.formattedPercentage}%</div>
              <div className="text-gray-400">{singleRate.date}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find min and max rates for scaling
  const minRate = Math.min(...sortedRates.map(r => r.rate));
  const maxRate = Math.max(...sortedRates.map(r => r.rate));
  const rateRange = maxRate - minRate || 0.001;
  
  // Graph dimensions
  const graphWidth = 280;
  const graphHeight = 100;
  const padding = 20;
  
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
      segmentColor = '#10b981'; // green-500
    } else if (currentRate < previousRate) {
      segmentColor = '#ef4444'; // red-500
    } else {
      segmentColor = '#9ca3af'; // gray-400
    }
    
    return {
      x1: prevPoint.x,
      y1: prevPoint.y,
      x2: point.x,
      y2: point.y,
      color: segmentColor
    };
  });

  // Generate path for area fill
  const areaPath = `
    M ${points[0].x} ${graphHeight - padding}
    L ${points[0].x} ${points[0].y}
    ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
    L ${points[points.length - 1].x} ${graphHeight - padding}
    Z
  `;

  const dataHash = sortedRates.length > 0 ? 
    sortedRates.map(r => `${r.date}-${r.rate}`).join('').length.toString(36) : 
    'default';
  const gradientId = `gradient-${dataHash}`;

  return (
    <div className={`${className}`}>
      <div className="relative bg-white rounded-lg p-2">
        <svg 
          width={graphWidth} 
          height={graphHeight} 
          className="w-full h-auto"
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (graphHeight - 2 * padding)}
              x2={graphWidth - padding}
              y2={padding + ratio * (graphHeight - 2 * padding)}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
          />
          
          {/* Line segments with colors */}
          {segments.map((segment, index) => (
            <line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={segment.color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          
          {/* Data points with hover effects */}
          {points.map((point, index) => {
            let dotColor;
            if (index === 0) {
              dotColor = '#6b7280';
            } else {
              const currentRate = point.rate;
              const previousRate = points[index - 1].rate;
              
              if (currentRate > previousRate) {
                dotColor = '#10b981';
              } else if (currentRate < previousRate) {
                dotColor = '#ef4444';
              } else {
                dotColor = '#6b7280';
              }
            }
            
            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="white"
                  stroke={dotColor}
                  strokeWidth="2"
                  className="cursor-pointer"
                />
                <title>{`${point.date}: ${point.formattedPercentage}%`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}