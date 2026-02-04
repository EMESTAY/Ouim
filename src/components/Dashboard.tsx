import React from 'react';
import { useDataStore } from '../stores/useDataStore';
import { LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data, reset } = useDataStore();

  if (!data) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gym Tracker
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-400 border border-neutral-700">
              v{data.version}
            </span>
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
            <LogOut size={16} />
            Back to Import
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <p className="text-neutral-400 text-sm mb-1">Total Workouts</p>
            <p className="text-3xl font-bold">{data.workoutHistory.length}</p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <p className="text-neutral-400 text-sm mb-1">Defined Sessions</p>
            <p className="text-3xl font-bold">{Object.keys(data.sessions).length}</p>
          </div>

          {data.userProfile && (
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <p className="text-neutral-400 text-sm mb-1">Profile</p>
              <p className="text-3xl font-bold capitalize">{data.userProfile.sex || 'Not set'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
