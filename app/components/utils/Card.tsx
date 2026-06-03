import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  description,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
