import type { ReactNode } from 'react';

export default function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
    <div className="min-w-0"><p className="eyebrow mb-2">{eyebrow}</p><h1 className="page-title break-words">{title}</h1><p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p></div>
    {action && <div className="shrink-0">{action}</div>}
  </header>;
}
