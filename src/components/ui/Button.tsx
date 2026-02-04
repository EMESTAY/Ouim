import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-gym-blue to-gym-purple 
    hover:from-blue-500 hover:to-purple-500
    text-white border-transparent
    shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40
  `,
  secondary: `
    bg-neutral-800 hover:bg-neutral-700 
    text-white border border-white/5
    hover:border-white/10
  `,
  ghost: `
    bg-transparent hover:bg-white/5 
    text-neutral-400 hover:text-white 
    border-transparent
  `,
  danger: `
    bg-red-500/10 hover:bg-red-500/20 
    text-red-400 hover:text-red-300 
    border border-red-500/20 hover:border-red-500/30
  `,
  outline: `
    bg-transparent hover:bg-white/5
    text-neutral-300 hover:text-white
    border border-white/10 hover:border-white/20
  `,
  link: `
    bg-transparent hover:underline
    text-gym-blue hover:text-blue-400
    border-transparent shadow-none px-0
  `,
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        clsx(
          // styles base
          'inline-flex items-center justify-center gap-2',
          'rounded-xl font-medium tracking-wide',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-gym-blue/50 focus:ring-offset-2 focus:ring-offset-black',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          // echelle active
          'active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          className
        )
      )}
      {...props}>
      {children}
    </button>
  );
};
