"use client";

import { Trophy } from "lucide-react";

interface AchievementSummaryProps {
  stats: {
    total_points: number;
    achievements_unlocked: number;
    achievements_total: number;
    rank?: number;
  };
  unseenCount: number;
  className?: string;
  onClick?: () => void;
}

export default function AchievementSummary({ stats, unseenCount, className = "", onClick }: AchievementSummaryProps) {
  return (
    <div
      className={`flex items-center space-x-2 ${
        onClick ? "cursor-pointer hover:opacity-75 transition-opacity" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        <Trophy className="w-5 h-5 text-yellow-600" />
        {unseenCount > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">{unseenCount > 9 ? "9+" : unseenCount}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start">
        {/* <div className="flex items-center space-x-1">
          <span className="text-xs font-medium text-gray-700">{stats.total_points}</span>
          <Star className="w-3 h-3 text-blue-500" />
        </div> */}
        <div className="text-[10px] text-gray-500">
          <span className="font-medium text-gray-900">{stats.achievements_unlocked}</span> de <span className="font-medium text-gray-900">{stats.achievements_total}</span>{" "}
          logros
        </div>
        <div className="text-[10px] text-gray-500">completados</div>
      </div>
    </div>
  );
}
