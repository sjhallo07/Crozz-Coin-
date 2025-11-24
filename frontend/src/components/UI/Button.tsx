import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/30 hover:bg-brand-500 focus-visible:outline-brand-500',
  secondary:
    'bg-white/80 text-slate-900 border-slate-200 hover:bg-white focus-visible:outline-brand-400 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-600 border-transparent hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5 focus-visible:outline-brand-500',
};

const sizeClasses: Record<Size, string> = {
  md: 'px-4 py-2.5',
  sm: 'px-3 py-1.5 text-xs',
};

const Button = ({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) => (
  <button
    className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    {...props}
  />
);

export default Button;
