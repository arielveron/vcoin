"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IconRenderer from "@/components/icon-renderer";
import { InvestmentCategory } from "@/types/database";
import { ChevronDown, ChevronRight, Wallet, Calendar, DollarSign } from "lucide-react";
import { formatCurrency, formatDate, formatMonth, formatDayWithWeekday } from "@/shared/utils/formatting";

interface InvestmentItem {
  id: number;
  fecha: Date;
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full text-center">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay inversiones registradas aún.</p>
        <p className="text-sm text-gray-400 mt-1">¡Pronto comenzarás a ver tus inversiones aquí!</p>
      </div>
    );
  }

  // Group investments by month for better organization
  const investmentsByMonth = listInvertidos.reduce((acc, item) => {
    const date = new Date(item.fecha);
    const monthKey = formatMonth(date);
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, InvestmentItem[]>);

  const sortedMonths = Object.keys(investmentsByMonth).sort((a, b) => {
    const dateA = new Date(investmentsByMonth[a][0].fecha);
    const dateB = new Date(investmentsByMonth[b][0].fecha);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 w-full ${className}`} {...props}>
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-4 sm:p-6 hover:bg-gray-50 transition-colors rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg flex-shrink-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">Historial de Inversiones</h3>
            <p className="text-xs sm:text-sm text-gray-600">{listInvertidos.length} transacciones</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total invertido</p>
            <p className="text-base sm:text-xl font-bold text-indigo-600 whitespace-nowrap">
              {formatCurrency(totalInvertido)}
            </p>
          </div>
          <div className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-100"
          >
          <div className="max-h-96 overflow-y-auto">
            {sortedMonths.map((month, monthIndex) => (
              <div key={month} className={monthIndex > 0 ? "border-t border-gray-100" : ""}>
                {/* Month Header */}
                <div className="px-6 py-2 bg-indigo-50 border-t border-gray-300 shadow-md">
                  <h4 className="text-xs font-semibold text-gray-900 capitalize">{month}</h4>
                </div>

                {/* Investments for this month */}
                {investmentsByMonth[month].map((item, index) => {
                  const category = item.category;

                  // Build className from category text style (excluding textColor which will be handled inline)
                  const categoryClasses = category?.text_style
                    ? [
                        category.text_style.fontSize || "",
                        category.text_style.fontWeight || "",
                        category.text_style.fontStyle || "",
                        category.text_style.effectClass || "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "";

                  // Build inline styles from customCSS and textColor
                  const inlineStyles = {
                    // First apply customCSS if it exists
                    ...(category?.text_style?.customCSS
                      ? Object.fromEntries(
                          category.text_style.customCSS
                            .split(";")
                            .filter((rule) => rule.trim())
                            .map((rule) => {
                              const [key, value] = rule.split(":").map((s) => s.trim());
                              return [key, value];
                            })
                        )
                      : {}),
                    // Then apply textColor if it exists (this will override any color from customCSS)
                    ...(category?.text_style?.textColor?.startsWith('#') 
                      ? { color: category.text_style.textColor }
                      : {})
                  };

                  return (
                    <div
                      key={`${item.id}-${item.fecha.toISOString()}`}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                        index < investmentsByMonth[month].length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {/* Left side - Date and concept */}
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start space-x-2">
                              {/* Concept Text (Category Name) */}
                              <div className="flex-1">
                                <div className="flex items-start space-x-2">
                                  <p
                                    className={`text-sm leading-relaxed ${categoryClasses || "text-gray-800"}`}
                                    style={inlineStyles}
                                  >
                                    {item.concepto}
                                  </p>
                                  {/* Category Icon */}
                                  {category?.icon_config && (
                                    <div className="flex-shrink-0 mt-0.5">
                                      <IconRenderer
                                        name={category.icon_config.name}
                                        library={category.icon_config.library}
                                        size={16}
                                        color={category.icon_config.color}
                                        backgroundColor={category.icon_config.backgroundColor}
                                        padding={category.icon_config.padding}
                                        animationClass={category.icon_config.animationClass}
                                        effectClass={category.icon_config.effectClass}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {formatDayWithWeekday(new Date(item.fecha))}
                                  </p>
                                  <span className="hidden sm:inline text-xs text-gray-300">•</span>
                                  <p className="text-xs text-gray-400 font-mono">
                                    {formatDate(item.fecha)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Amount */}
                        <div className="flex-shrink-0 ml-4">
                          <div className="flex items-center space-x-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                                                        <span className="font-semibold">{formatCurrency(item.monto)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Total de {listInvertidos.length} inversiones registradas</p>
              <p className="text-sm font-medium text-gray-800">
                Promedio: {formatCurrency(totalInvertido / listInvertidos.length)}
              </p>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
