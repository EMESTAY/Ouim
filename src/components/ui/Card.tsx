import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          // styles base glass
          'bg-neutral-900/60 backdrop-blur-md',
          'border border-white/5',
          'rounded-2xl',
          'shadow-xl shadow-black/20',
          // effet survol
          'transition-all duration-300',
          'hover:bg-neutral-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-black/40',
          // marge interne
          !noPadding && 'p-6',
          className
        )
      )}
      {...props}>
      {children}
    </div>
  );
};
