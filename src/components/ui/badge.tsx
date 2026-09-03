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
    default: 'bg-[#ECF4F4] text-[#1C2C34] border border-[#BCD4D4]',
    secondary: 'bg-[#F4F4F4] text-[#1C2C34] hover:bg-[#ECF4F4]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    outline: 'border border-[#BCD4D4]/60 text-[#1C2C34]',
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
