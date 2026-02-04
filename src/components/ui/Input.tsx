import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-xl',
              'bg-black/40 border border-white/10',
              'text-white placeholder-neutral-600',
              'focus:outline-none focus:ring-2 focus:ring-gym-blue/50 focus:border-gym-blue/50',
              'transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {/* lueur survol */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gym-blue to-gym-purple opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 -z-10 blur-md" />
      </div>
      {error && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{error}</p>}
    </div>
  );
};
