'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, AchievementWithProgress } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: AchievementWithProgress;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showProgress?: boolean;
  expandable?: boolean; // Nueva prop para hacer los logros expandibles
}

export default function AchievementBadge({
  achievement,
  size = 'md',
  onClick,
  showProgress = true,
  expandable = false
}: AchievementBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeConfig = {
    sm: {
      container: 'w-20 h-24', // Aumentado para incluir texto
      icon: 16,
      text: 'text-xs',
      padding: 'p-2',
      badge: 'w-6 h-6 text-xs'
    },
    md: {
      container: 'w-24 h-28', // Aumentado para incluir texto
      icon: 20,
      text: 'text-sm',
      padding: 'p-3',
      badge: 'w-8 h-8 text-sm'
    },
    lg: {
      container: 'w-28 h-32', // Aumentado para incluir texto
      icon: 24,
      text: 'text-base',
      padding: 'p-4',
      badge: 'w-9 h-9 text-sm'
    }
  };

  const config = sizeConfig[size];
  const isUnlocked = achievement.unlocked || false;
  const progress = achievement.progress || 0;

  const getRarityColors = (rarity: Achievement['rarity'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-400',
        icon: '#9CA3AF'
      };
    }

    switch (rarity) {
      case 'common':
        return {
          bg: 'bg-gradient-to-br from-green-100 to-green-200',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: '#059669'
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
          border: 'border-blue-300',
          text: 'text-blue-700',
          icon: '#2563EB'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
          border: 'border-purple-300',
          text: 'text-purple-700',
          icon: '#7C3AED'
        };
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: '#D97706'
        };
    }
  };

  const colors = getRarityColors(achievement.rarity, isUnlocked);

  const handleClick = () => {
    if (expandable && !isUnlocked) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className={cn("relative group transition-all duration-200")}>
      {/* Main Badge Container */}
      <div className={cn(
        "flex flex-col items-center space-y-2", 
        config.container
      )}>
        {/* Icon Badge */}
        <motion.div
          className={cn(
            "w-full aspect-square rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-200",
            colors.bg,
            colors.border,
            config.padding,
            isUnlocked ? "shadow-lg" : "shadow-sm",
            !isUnlocked && "opacity-60",
            // Efecto hover unificado para todos los logros
            "hover:scale-105 cursor-pointer"
          )}
          onClick={handleClick}
          title={!expandable ? `${achievement.name}\n${achievement.description}${!isUnlocked ? `\nProgress: ${progress}%` : ''}` : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Icon */}
          <div className={cn(
            "flex items-center justify-center",
            achievement.icon_config.animationClass && isUnlocked ? achievement.icon_config.animationClass : "",
            !isUnlocked && "grayscale"
          )}>
            <IconRenderer
              name={achievement.icon_config.name}
              library={achievement.icon_config.library}
              size={achievement.icon_config.size || config.icon}
              color={isUnlocked ? (achievement.icon_config.color || colors.icon) : colors.icon}
            />
          </div>

          {/* Progress Bar (for locked achievements) */}
          {!isUnlocked && showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Lock Overlay (for locked achievements) */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
              <div className="text-gray-500 text-xs">🔒</div>
            </div>
          )}

          {/* Progress Badge (for locked achievements with progress) */}
          {!isUnlocked && showProgress && progress > 0 && (
            <div className={cn(
              "absolute -top-1 -right-1 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-blue-600 shadow-md",
              config.badge,
              // Ajustar el tamaño del texto según el progreso para evitar overflow
              progress >= 100 ? "text-xs" : "text-xs"
            )}>
              {Math.round(progress)}%
            </div>
          )}

          {/* Points Badge (for unlocked achievements) - Más grande y visible */}
          {isUnlocked && achievement.points > 0 && (
            <div className={cn(
              "absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 rounded-full flex items-center justify-center font-bold border-2 border-yellow-500 shadow-md",
              config.badge,
              // Ajustar el tamaño del texto según los puntos para evitar overflow
              achievement.points >= 100 ? "text-xs" : "text-xs"
            )}>
              {achievement.points}
            </div>
          )}

          {/* Tooltip on Hover (solo para escritorio y no expandibles) */}
          {!expandable && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 hidden md:block">
              <div className="font-semibold">{achievement.name}</div>
              <div className="text-gray-300">{achievement.description}</div>
              {!isUnlocked && progress > 0 && (
                <div className="text-blue-300">Progress: {Math.round(progress)}%</div>
              )}
              {isUnlocked && (
                <div className="text-yellow-300">+{achievement.points} points</div>
              )}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
            </div>
          )}
        </motion.div>

        {/* Achievement Name - Visible en todos los dispositivos */}
        <div className="text-center w-full">
          <div className={cn(
            "font-medium",
            config.text,
            isUnlocked ? colors.text : "text-gray-500",
            // No truncar cuando está expandido para mostrar el nombre completo
            expandable && !isUnlocked && isExpanded ? "" : "truncate"
          )}>
            {achievement.name}
          </div>
          {/* Points indicator para logros desbloqueados */}
          {isUnlocked && achievement.points > 0 && (
            <div className="text-xs text-yellow-600 font-semibold mt-1">
              +{achievement.points} pts
            </div>
          )}
        </div>
      </div>

      {/* Expanded Description (solo para logros bloqueados y expandibles) */}
      <AnimatePresence>
        {expandable && !isUnlocked && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-3 overflow-hidden"
          >
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm max-w-xs">
              <div className="font-medium text-gray-900 mb-2">{achievement.description}</div>
              
              {/* Required Value Info */}
              {achievement.required_value && achievement.current_value !== undefined && (
                <div className="text-gray-600 mb-2">
                  <div className="font-medium mb-1">Progreso:</div>
                  <div>
                    {/* Display format based on operator type */}
                    {achievement.trigger_config?.operator === '=' && (
                      <>
                        {achievement.current_value} / {achievement.required_value}
                        {achievement.trigger_config?.metric === 'investment_count' && ' inversiones'}
                        {achievement.trigger_config?.metric === 'total_invested' && ' ARS'}
                        {achievement.trigger_config?.metric === 'streak_days' && ' días consecutivos'}
                        {achievement.trigger_config?.metric === 'category_count' && ' inversiones en categoría'}
                      </>
                    )}
                    {(achievement.trigger_config?.operator === '>=' || achievement.trigger_config?.operator === '>') && (
                      <>
                        {achievement.current_value} / {achievement.required_value}
                        {achievement.trigger_config?.metric === 'investment_count' && ' inversiones'}
                        {achievement.trigger_config?.metric === 'total_invested' && ' ARS'}
                        {achievement.trigger_config?.metric === 'streak_days' && ' días consecutivos'}
                        {achievement.trigger_config?.metric === 'category_count' && ' inversiones en categoría'}
                        <div className="text-xs text-gray-500 mt-1">
                          (Necesitas {achievement.trigger_config.operator} {achievement.required_value})
                        </div>
                      </>
                    )}
                    {(achievement.trigger_config?.operator === '<=' || achievement.trigger_config?.operator === '<') && (
                      <>
                        {achievement.current_value} / {achievement.required_value}
                        {achievement.trigger_config?.metric === 'investment_count' && ' inversiones'}
                        {achievement.trigger_config?.metric === 'total_invested' && ' ARS'}
                        {achievement.trigger_config?.metric === 'streak_days' && ' días consecutivos'}
                        {achievement.trigger_config?.metric === 'category_count' && ' inversiones en categoría'}
                        <div className="text-xs text-gray-500 mt-1">
                          (Máximo permitido: {achievement.trigger_config.operator} {achievement.required_value})
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Points Reward */}
              {achievement.points > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-yellow-600 font-semibold">
                  🏆 Recompensa: +{achievement.points} puntos
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
