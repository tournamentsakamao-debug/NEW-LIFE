'use client';

import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, onFocus, ...props }, ref) => {
    const { playClick } = useSound();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      playClick();
      onFocus?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl glass',
            'bg-white/5 border border-white/10',
            'text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          onFocus={handleFocus}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
