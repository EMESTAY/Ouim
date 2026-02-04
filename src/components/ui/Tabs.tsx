import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      className={twMerge(
        'flex gap-1 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/5',
        className
      )}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden',
              isActive
                ? 'bg-neutral-800 shadow-lg shadow-black/20 text-gym-blue'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            )}>
            {/* indicateur actif */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-tr from-gym-blue/10 to-gym-purple/10 pointer-events-none" />
            )}

            <span className={clsx('relative z-10 transition-colors', isActive && 'text-white')}>
              {tab.icon}
            </span>
            <span className={clsx('relative z-10 transition-colors', isActive && 'text-white')}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
