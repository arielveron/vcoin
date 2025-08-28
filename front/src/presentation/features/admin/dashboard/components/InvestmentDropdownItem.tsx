/**
 * Investment Dropdown Item Component
 * Displays individual investment details in dropdown menus
 */
'use client'

import { Calendar } from 'lucide-react'
import IconRenderer from '@/components/icon-renderer'
import { formatDayWithWeekday } from '@/shared/utils/formatting'

interface InvestmentData {
  id: number
  fecha: Date
  monto: number
  montoFormatted: string
  concepto: string
  category?: {
    id: number
    nombre: string
    icon_config?: {
      name: string
      library: string
      size?: number
      color?: string
      backgroundColor?: string
      padding?: number
      animationClass?: string
      effectClass?: string
    }
    text_style?: {
      fontSize?: string
      fontWeight?: string
      fontStyle?: string
      textColor?: string
      effectClass?: string
      customCSS?: string
    }
  } | null
}

interface InvestmentDropdownItemProps {
  investment: InvestmentData
  size?: 'sm' | 'md' | 'lg'
  showCategory?: boolean
}

export default function InvestmentDropdownItem({ 
  investment, 
  size = 'md',
  showCategory = true 
}: InvestmentDropdownItemProps) {
  const category = investment.category

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

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-1.5',
      iconContainer: 'p-1.5',
      icon: 'w-3 h-3',
      concept: 'text-xs',
      date: 'text-xs',
      amount: 'text-xs'
    },
    md: {
      container: 'p-2',
      iconContainer: 'p-2',
      icon: 'w-4 h-4',
      concept: 'text-sm',
      date: 'text-xs',
      amount: 'text-sm'
    },
    lg: {
      container: 'p-2',
      iconContainer: 'p-2',
      icon: 'w-4 h-4',
      concept: 'text-sm',
      date: 'text-sm',
      amount: 'text-base'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={`flex items-start justify-between hover:bg-gray-300 bg-gray-200 mb-1 rounded ${config.container}`}>
      {/* Left side - Date and concept */}
      <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
        <div className="flex-shrink-0 mt-0.5">
          <div className={`bg-gray-100 rounded-lg ${config.iconContainer}`}>
            <Calendar className={`${config.icon} text-gray-600`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-2">
            {/* Concept Text (Category Name) */}
            <div className="flex-1">
              <div className="flex items-start space-x-2">
                <p
                  className={`${config.concept} leading-relaxed ${categoryClasses || "text-gray-800"}`}
                  style={inlineStyles}
                >
                  {investment.concepto}
                </p>
                {/* Category Icon */}
                {showCategory && category?.icon_config && (
                  <div className="flex-shrink-0 mt-0.5">
                    <IconRenderer
                      name={category.icon_config.name}
                      library={category.icon_config.library}
                      size={14}
                      color={category.icon_config.color}
                      backgroundColor={category.icon_config.backgroundColor}
                      padding={category.icon_config.padding}
                      animationClass={category.icon_config.animationClass}
                      effectClass={category.icon_config.effectClass}
                    />
                  </div>
                )}
              </div>
              <p className={`${config.date} text-gray-500 mt-1 text-left`}>
                {formatDayWithWeekday(investment.fecha)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Amount */}
      <div className="flex-shrink-0 ml-4">
        <div className="text-green-600">
          <span className={`font-semibold ${config.amount}`}>
            {investment.montoFormatted}
          </span>
        </div>
      </div>
      
    </div>
  )
}
