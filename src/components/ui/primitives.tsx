/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// Avatar
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ size = 'md', className = '', children, ...props }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
  };
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF] font-semibold select-none ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => (
  <span className={`uppercase font-bold ${className}`} {...props}>
    {children}
  </span>
);

// Progress
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  indicatorColor = 'bg-[#B886FD]',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
      {...props}
    >
      <div
        className={`h-full transition-all duration-300 ${indicatorColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Alert
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-slate-50 border-slate-200 text-[#181A20]',
    destructive: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div
      role="alert"
      className={`relative w-full rounded-2xl border p-4 text-xs ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h5 className={`font-bold mb-1 leading-none tracking-tight flex items-center space-x-1.5 ${className}`} {...props}>
    {children}
  </h5>
);

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  <div className={`text-xs opacity-90 leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

// Separator
export const Separator: React.FC<{ orientation?: 'horizontal' | 'vertical'; className?: string }> = ({
  orientation = 'horizontal',
  className = '',
}) => (
  <div
    className={`bg-slate-200 ${
      orientation === 'horizontal' ? 'h-[1px] w-full my-2' : 'h-full w-[1px] mx-2'
    } ${className}`}
  />
);
