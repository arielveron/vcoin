'use client';

import { Achievement } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import { unlockManualAchievement } from './actions';

interface AchievementAwardFormProps {
  achievement: Achievement;
  studentId: number;
}

export default function AchievementAwardForm({ achievement, studentId }: AchievementAwardFormProps) {
  const handleAwardAchievement = async (formData: FormData) => {
    try {
      const result = await unlockManualAchievement(formData);
      if (result.success) {
        alert('Achievement awarded successfully!');
        // Refresh the page to show updated achievements - following the pattern from other admin sections
        window.location.reload();
      } else {
        alert(result.error || 'Failed to award achievement');
      }
    } catch (error) {
      console.error('Award achievement error:', error);
      alert('Error awarding achievement: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <IconRenderer 
          name={achievement.icon_config.name}
          library={achievement.icon_config.library}
          size={achievement.icon_config.size}
          color={achievement.icon_config.color}
          animationClass={achievement.icon_config.animationClass}
          className="w-6 h-6"
        />
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {achievement.name}
          </h4>
          <p className="text-xs text-gray-500">
            {achievement.description}
          </p>
        </div>
      </div>
      <form action={handleAwardAchievement}>
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="achievementId" value={achievement.id} />
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Award
        </button>
      </form>
    </div>
  );
}
