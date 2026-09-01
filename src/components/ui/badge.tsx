/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none';
  
  const variantClasses = {
    default: 'bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF]',
    secondary: 'bg-slate-100 text-[#181A20] hover:bg-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    outline: 'border border-slate-200 text-[#181A20]',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
