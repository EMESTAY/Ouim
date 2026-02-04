import React, { useState } from 'react';
import {
  Logs,
  Download,
  LayoutDashboard,
  Dumbbell,
  History,
  Heart,
  BookOpen,
  Activity,
} from 'lucide-react';
import { useDataStore } from '../stores/useDataStore';
import { Tabs, Button } from './ui';
import type { Tab } from './ui';

// config onglets
const TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'exercises', label: 'Exercises', icon: <BookOpen size={18} /> },
  { id: 'sessions', label: 'Sessions', icon: <Dumbbell size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
  { id: 'body', label: 'Body', icon: <Heart size={18} /> },
];

interface LayoutProps {
  children: (activeTab: string) => React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, reset, exportData } = useDataStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!data) return null;

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gym-blue/30 overflow-x-hidden realtive">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gym-blue/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gym-purple/10 rounded-full blur-[120px] opacity-40 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gym-blue to-gym-purple flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Activity size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Gym Tracker
                </h1>
              </div>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40 border border-white/5">
                v{data.version}
              </span>
            </div>

            <div className="hidden md:block">
              <div className="h-8 w-[1px] bg-white/5 mx-2" />
            </div>
            <div className="hidden md:block">
              <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
              <Download size={16} />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-neutral-400 hover:text-red-400 hover:bg-red-500/5">
              <Logs size={16} />
              <span className="hidden sm:inline">BITE</span>
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="px-4 py-2 overflow-x-auto no-scrollbar">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </header>

      <div className="h-16 md:h-16" />
      <div className="h-14 md:hidden" />

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 py-8 animate-fade-in">
        {children(activeTab)}
      </main>
    </div>
  );
};
