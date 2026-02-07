'use client';

import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
  luxury?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, clickable, luxury, children, onClick, ...props }, ref) => {
    const { playClick } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickable) {
        playClick();
        onClick?.(e);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-2xl p-6 transition-all duration-300',
          clickable && 'cursor-pointer card-hover active:scale-95',
          luxury && 'luxury-badge border-2 border-yellow-400',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
