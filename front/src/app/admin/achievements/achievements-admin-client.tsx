'use client';

import { useState, useEffect } from 'react';
import { Achievement, Student, Class, AchievementWithProgress } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import AchievementAwardForm from './achievement-award-form';
import { sortAchievements } from '@/utils/achievement-sorting';
import { getStudentAchievements } from './actions';
import { Trophy, Users, BookOpen, CheckCircle, AlertCircle, Clock, Pause } from 'lucide-react';

interface BackgroundJobStatus {
  daily: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  weekly: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  check: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  lastUpdated: string;
  lastUpdatedFormatted: string;
}

interface Props {
  achievements: Achievement[];
  students: Student[];
  classes: Class[];
  backgroundJobStatus?: BackgroundJobStatus;
}

export default function AchievementsAdminClient({ 
  achievements, 
  students, 
  classes,
  backgroundJobStatus
}: Props) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [manualAchievements, setManualAchievements] = useState<Achievement[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<AchievementWithProgress[]>([]);
  const [filter, setFilter] = useState<'all' | 'automatic' | 'manual'>('all');

  useEffect(() => {
    setManualAchievements(sortAchievements(achievements.filter(a => a.trigger_type === 'manual')));
  }, [achievements]);

  useEffect(() => {
    const fetchStudentAchievements = async () => {
      if (selectedStudent) {
        try {
          const result = await getStudentAchievements(selectedStudent);
          if (result.success && result.data) {
            setStudentAchievements(result.data);
          } else {
            console.error('Failed to fetch student achievements');
            setStudentAchievements([]);
          }
        } catch (error) {
          console.error('Failed to fetch student achievements:', error);
          setStudentAchievements([]);
        }
      } else {
        setStudentAchievements([]);
      }
    };

    fetchStudentAchievements();
  }, [selectedStudent]);

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass)
    : students;

  const filteredAchievements = sortAchievements(
    filter === 'all' 
      ? achievements 
      : achievements.filter(a => a.trigger_type === filter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'not_run': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      case 'not_run': return <Pause className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Achievement Management</h2>
          <p className="text-gray-600">
            {achievements.length} achievements • Monitor student progress and background jobs
          </p>
        </div>
      </div>

      {/* Background Jobs Monitoring - Responsive */}
      {backgroundJobStatus && (
        <div className="bg-white shadow rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            Background Job Status
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(backgroundJobStatus).map(([jobType, status]) => {
              if (jobType === 'lastUpdated') return null;
              
              return (
                <div key={jobType} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium capitalize">{jobType} Job</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)} {status.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Last Run: {status.lastRunFormatted}</p>
                    {status.error && (
                      <p className="text-red-600 mt-1">Error: {status.error}</p>
                    )}
                    {status.lastMessage && (
                      <p className="text-gray-500 mt-1 truncate" title={status.lastMessage}>
                        {status.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {backgroundJobStatus.lastUpdatedFormatted}
          </div>
        </div>
      )}

      {/* Achievement Overview - Responsive */}
      <div className="bg-white shadow rounded-lg p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          Achievement Overview
        </h3>
        
        {/* Filter Tabs - Mobile-friendly */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Achievements' },
            { key: 'automatic', label: 'Automatic' },
            { key: 'manual', label: 'Manual' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-md min-h-[44px] ${
                filter === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              {label} ({achievements.filter(a => key === 'all' || a.trigger_type === key).length})
            </button>
          ))}
        </div>

        {/* Achievement Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div key={achievement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <IconRenderer 
                    name={achievement.icon_config.name}
                    library={achievement.icon_config.library}
                    size={achievement.icon_config.size}
                    color={achievement.icon_config.color}
                    animationClass={achievement.icon_config.animationClass}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {achievement.rarity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {achievement.points} pts
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      achievement.trigger_type === 'manual' 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {achievement.trigger_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Achievement Awarding - Responsive */}
      <div className="bg-white shadow rounded-lg p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Award Manual Achievements
        </h3>
        
        {/* Student and Class Selection - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Class (Optional)
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => {
                const classId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedClass(classId);
                setSelectedStudent(null); // Reset student selection
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a student...</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (Reg: {student.registro})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manual Achievements - Responsive */}
        {selectedStudent && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-green-600" />
              Manual Achievements for {students.find(s => s.id === selectedStudent)?.name}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {manualAchievements.map((achievement) => {
                const isGranted = studentAchievements.some(sa => sa.id === achievement.id && sa.unlocked);
                return (
                  <AchievementAwardForm
                    key={achievement.id}
                    achievement={achievement}
                    studentId={selectedStudent}
                    isGranted={isGranted}
                    onSuccess={() => {
                      // Refresh student achievements after award/revoke
                      const fetchStudentAchievements = async () => {
                        try {
                          const result = await getStudentAchievements(selectedStudent);
                          if (result.success && result.data) {
                            setStudentAchievements(result.data);
                          }
                        } catch (error) {
                          console.error('Failed to refresh student achievements:', error);
                        }
                      };
                      fetchStudentAchievements();
                    }}
                  />
                );
              })}
            </div>
            
            {manualAchievements.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No manual achievements available
              </p>
            )}
          </div>
        )}
        
        {!selectedStudent && (
          <p className="text-gray-500 text-center py-8">
            Select a student to view and award manual achievements
          </p>
        )}
      </div>
    </div>
  );
}
