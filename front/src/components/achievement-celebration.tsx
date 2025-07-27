'use client';

import { useEffect, useState, useCallback } from 'react';
import { Achievement } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';

interface AchievementCelebrationProps {
  achievement: Achievement;
  onClose?: () => void;
  autoCloseDelay?: number;
}

export default function AchievementCelebration({
  achievement,
  onClose,
  autoCloseDelay = 5000
}: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setShowConfetti(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for exit animation
  }, [onClose]);

  useEffect(() => {
    // Show modal with animation
    setIsVisible(true);
    
    // Auto close after delay (only if autoCloseDelay > 0)
    let timer: NodeJS.Timeout | undefined;
    if (autoCloseDelay > 0) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    }

    // Stop confetti after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [autoCloseDelay, handleClose]);

  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'from-gray-100 to-gray-200',
          border: 'border-gray-300',
          text: 'text-gray-700',
          glow: 'shadow-gray-200/50'
        };
      case 'rare':
        return {
          bg: 'from-blue-100 to-blue-200',
          border: 'border-blue-300',
          text: 'text-blue-700',
          glow: 'shadow-blue-200/50'
        };
      case 'epic':
        return {
          bg: 'from-purple-100 to-purple-200',
          border: 'border-purple-300',
          text: 'text-purple-700',
          glow: 'shadow-purple-200/50'
        };
      case 'legendary':
        return {
          bg: 'from-yellow-100 to-yellow-200',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          glow: 'shadow-yellow-200/50'
        };
    }
  };

  const colors = getRarityColors(achievement.rarity);

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Modal Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div
          className={cn(
            "bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all duration-300",
            `bg-gradient-to-br ${colors.bg} ${colors.border} ${colors.glow}`,
            "border-2 shadow-2xl",
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Achievement Unlocked Text */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              🎉 Achievement Unlocked!
            </h2>
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
              {achievement.rarity} Achievement
            </p>
          </div>

          {/* Achievement Icon */}
          <div className="mb-6 flex justify-center">
            <div className={cn(
              "p-4 rounded-full border-4",
              colors.border,
              "bg-white/80 shadow-lg",
              achievement.icon_config.animationClass || "animate-bounce"
            )}>
              <IconRenderer
                name={achievement.icon_config.name}
                library={achievement.icon_config.library}
                size={achievement.icon_config.size || 48}
                color={achievement.icon_config.color}
                className="drop-shadow-sm"
              />
            </div>
          </div>

          {/* Achievement Details */}
          <div className="mb-6">
            <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
              {achievement.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {achievement.description}
            </p>
          </div>

          {/* Points */}
          <div className="mb-6">
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold",
              `bg-gradient-to-r ${colors.bg}`,
              colors.border,
              colors.text,
              "border"
            )}>
              <span className="mr-1">⭐</span>
              +{achievement.points} Points
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200",
              "bg-white/80 hover:bg-white border-2",
              colors.border,
              colors.text,
              "hover:scale-105 active:scale-95"
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
