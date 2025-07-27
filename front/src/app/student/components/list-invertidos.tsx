"use client";

import React, { useState } from "react";
import IconRenderer from '@/components/icon-renderer';
import { InvestmentCategory } from '@/types/database';

interface InvestmentItem {
  id: number;
  fecha: Date; // Always Date type
  monto: number;
  concepto: string;
  category?: InvestmentCategory | null;
}

interface ListInvertidosProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  totalInvertido: number;
  listInvertidos: InvestmentItem[];
}

export default function ListInvertidos({ totalInvertido, listInvertidos, className, ...props }: ListInvertidosProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  if (!listInvertidos || listInvertidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
        No hay fondos invertidos.
      </div>
    );
  }
  
  return (
    <div className={`w-full max-w-md px-5 text-xs ${className}`} {...props}>
      <div 
        className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="text-gray-700 font-bold text-center flex-1">
          Total Invertido: {totalInvertido.toLocaleString("es-AR")} $
        </div>
        <div className="ml-2 text-gray-500">
          {isCollapsed ? "►" : "▼"}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-center bg-gray-200 p-2">
            <div className="text-gray-700 font-bold">Fecha</div>
            <div className="text-gray-700 font-bold text-center">Monto</div>
            <div className="text-gray-700 font-bold">Concepto</div>
          </div>
          <hr className="border-gray-300" />
          {listInvertidos.map((item) => {
            const fechaDisplay = item.fecha.toISOString().split('T')[0];
            const category = item.category;
            
            // Build className from category text style
            const categoryClasses = category?.text_style ? [
              category.text_style.fontSize || '',
              category.text_style.fontWeight || '',
              category.text_style.fontStyle || '',
              category.text_style.textColor || '',
              category.text_style.effectClass || ''
            ].filter(Boolean).join(' ') : '';

            // Build inline styles from customCSS
            const inlineStyles = category?.text_style?.customCSS ? 
              Object.fromEntries(
                category.text_style.customCSS.split(';')
                  .filter(rule => rule.trim())
                  .map(rule => {
                    const [key, value] = rule.split(':').map(s => s.trim());
                    return [key, value];
                  })
              ) : {};
              
            return (
              <div key={`${item.id}-${fechaDisplay}`} className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-start p-2 border-b border-gray-100 last:border-b-0">
                <div className="text-gray-700 text-nowrap">{fechaDisplay}</div>
                <div className="text-gray-700 text-right text-nowrap font-bold">{item.monto.toLocaleString("es-AR")} $</div>
                <div className="flex items-center gap-2">
                  {/* Category Icon */}
                  {category?.icon_config && (
                    <IconRenderer
                      name={category.icon_config.name}
                      library={category.icon_config.library}
                      size={12} // Tiny size for list view
                      color={category.icon_config.color}
                      animationClass={category.icon_config.animationClass}
                      className="flex-shrink-0"
                    />
                  )}
                  {/* Concept Text with Category Styling */}
                  <div 
                    className={`text-xs leading-tight break-words ${categoryClasses}`}
                    style={inlineStyles}
                  >
                    {item.concepto}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
