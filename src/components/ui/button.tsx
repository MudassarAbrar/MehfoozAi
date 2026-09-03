/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variantClasses = {
      default: 'bg-[#1C2C34] text-white hover:bg-[#2A3C44] font-bold shadow-xs',
      brand: 'bg-[#1C2C34] text-white hover:bg-[#2A3C44] font-bold shadow-xs',
      destructive: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold shadow-xs',
      outline: 'border border-[#BCD4D4]/60 bg-white hover:bg-[#ECF4F4] text-[#1C2C34]',
      secondary: 'bg-[#F4F4F4] text-[#1C2C34] hover:bg-[#ECF4F4]',
      ghost: 'hover:bg-[#ECF4F4] text-[#1C2C34]',
      link: 'text-[#FC7454] underline-offset-4 hover:underline p-0 h-auto font-bold',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2 text-xs',
      sm: 'h-8 px-3 text-[11px]',
      lg: 'h-12 px-6 text-sm',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
