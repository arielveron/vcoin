'use client';

import { Achievement, AchievementWithProgress } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: AchievementWithProgress;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showProgress?: boolean;
}

export default function AchievementBadge({
  achievement,
  size = 'md',
  onClick,
  showProgress = true
}: AchievementBadgeProps) {
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      icon: 16,
      text: 'text-xs',
      padding: 'p-2'
    },
    md: {
      container: 'w-20 h-20',
      icon: 20,
      text: 'text-sm',
      padding: 'p-3'
    },
    lg: {
      container: 'w-24 h-24',
      icon: 24,
      text: 'text-base',
      padding: 'p-4'
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

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        config.container,
        onClick && "hover:scale-105 active:scale-95"
      )}
      onClick={onClick}
      title={`${achievement.name}\n${achievement.description}${!isUnlocked ? `\nProgress: ${progress}%` : ''}`}
    >
      {/* Main Badge */}
      <div
        className={cn(
          "w-full h-full rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden",
          colors.bg,
          colors.border,
          config.padding,
          isUnlocked ? "shadow-lg" : "shadow-sm",
          !isUnlocked && "opacity-60"
        )}
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

        {/* Points Badge (for unlocked achievements) */}
        {isUnlocked && achievement.points > 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border border-yellow-500">
            {achievement.points}
          </div>
        )}
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
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
    </div>
  );
}
