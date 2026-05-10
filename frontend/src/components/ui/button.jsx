import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils.js';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg hover:shadow-xl hover:scale-105': variant === 'default',
          'bg-white/80 backdrop-blur text-gray-700 shadow hover:bg-white': variant === 'ghost',
          'bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-lg ar-glow': variant === 'ar',
        },
        {
          'h-10 px-6': size === 'default',
          'h-12 px-8 text-base': size === 'lg',
          'h-9 w-9': size === 'icon',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
