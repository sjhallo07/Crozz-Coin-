import clsx from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const Card = ({ title, description, actions, children, className }: CardProps) => (
  <section
    className={clsx(
      'relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-card-dark',
      className
    )}
  >
    {(title || description || actions) && (
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title &&
            (typeof title === 'string' ? (
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
            ) : (
              <div className="text-base font-semibold text-slate-900 dark:text-white">{title}</div>
            ))}
          {description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className="space-y-4 text-slate-600 dark:text-slate-200">{children}</div>
  </section>
);

export default Card;
