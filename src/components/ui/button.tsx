import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/20 hover:from-purple-500 hover:to-indigo-500',
        stellar:
          'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/30 hover:from-amber-400 hover:to-orange-500',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
        outline:
          'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600 backdrop-blur-sm',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700',
        ghost:
          'text-slate-300 hover:bg-slate-800/60 hover:text-white',
        link:
          'text-purple-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
