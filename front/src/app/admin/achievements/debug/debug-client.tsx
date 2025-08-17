'use client';

import { useState } from 'react';
import { Achievement, InvestmentCategory, Student, Investment } from '@/types/database';
import { checkStudentAchievements } from './actions';
import { sortAchievements } from '@/utils/achievement-sorting';
import { formatCurrency, formatDate } from '@/shared/utils/formatting';

interface Props {
  achievements: Achievement[];
  categories: InvestmentCategory[];
  students: Student[];
  investments: Investment[];
}

export default function DebugClient({ achievements, categories, students, investments }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [debugResult, setDebugResult] = useState<{
    success: boolean;
    studentId?: number;
    investments?: number;
    metrics?: {
      investment_count: number;
      total_invested: number;
      categoryIdCounts: Record<number, number>;
      [key: string]: number | Record<number, number>;
    };
    unlockedAchievements?: Achievement[];
    error?: string;
  } | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebugStudent = async (studentId: number) => {
    setIsDebugging(true);
    try {
      const result = await checkStudentAchievements(studentId);
      if (result.success && result.data) {
        setDebugResult(result.data);
      } else {
        setDebugResult({ success: false, error: 'Failed to debug achievements' });
      }
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsDebugging(false);
    }
  };

  // Get student investments
  const getStudentInvestments = (studentId: number) => {
    return investments.filter(inv => inv.student_id === studentId);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return 'No Category';
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.name} (${category.level})` : `Category ${categoryId}`;
  };

  return (
    <div className="space-y-6">
      {/* Categories Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Investment Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div key={category.id} className="border rounded p-3">
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-600">ID: {category.id} | Level: {category.level}</div>
              <div className="text-sm text-gray-600">
                Investments: {investments.filter(inv => inv.category_id === category.id).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Active Achievements</h2>
        <div className="space-y-3">
          {sortAchievements(achievements.filter(a => a.is_active)).map(achievement => (
            <div key={achievement.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-sm text-gray-500">
                    Type: {achievement.trigger_type} | Category: {achievement.category} | Rarity: {achievement.rarity}
                  </div>
                  {achievement.trigger_config && (
                    <div className="text-xs text-gray-400 mt-1">
                      Trigger: {JSON.stringify(achievement.trigger_config, null, 2)}
                    </div>
                  )}
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {achievement.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Debug */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Student Achievement Debug</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Student to Debug
          </label>
          <select 
            value={selectedStudent || ''} 
            onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-3 py-2"
          >
            <option value="">Select a student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} (ID: {student.id})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Student Investments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Concept</th>
                      <th className="px-3 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStudentInvestments(selectedStudent).map(inv => (
                      <tr key={inv.id} className="border-t">
                        <td className="px-3 py-2">{formatDate(inv.fecha)}</td>
                        <td className="px-3 py-2">{formatCurrency(inv.monto)}</td>
                        <td className="px-3 py-2">{inv.concepto}</td>
                        <td className="px-3 py-2">{getCategoryName(inv.category_id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => handleDebugStudent(selectedStudent)}
              disabled={isDebugging}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isDebugging ? 'Debugging...' : 'Debug Achievement System'}
            </button>

            {debugResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Debug Result:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
