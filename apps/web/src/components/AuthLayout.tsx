import type { ReactNode } from 'react';
import Brand from './Brand';
import Icon from './Icon';

export default function AuthLayout({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return <main className="auth-layout">
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-7 sm:px-10 sm:py-10">
      <header className="flex items-center justify-between"><Brand /><span className="hidden text-xs font-medium text-secondary sm:block">A little clarity. A lot of progress.</span></header>
      <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:gap-20">
        <section className="hidden lg:block">
          <span className="chip mb-6 border-info/30 bg-info-subtle px-3 py-1.5 text-info-ink">Your work, in a better place</span>
          <h2 className="max-w-md text-5xl font-medium leading-[1.12] tracking-tight">Make room for<br />your best work<span className="text-info-ink">.</span></h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-secondary">Bring your projects, priorities and next steps together. Find your focus, one task at a time.</p>
          <div className="mt-10 flex max-w-sm gap-4 border-t border-line pt-6"><span className="icon-tile bg-charcoal text-accent"><Icon name="check" /></span><div><p className="text-sm font-semibold">Less scattered. More settled.</p><p className="mt-1 text-sm leading-6 text-secondary">A clear view of what matters, wherever you work.</p></div></div>
        </section>
        <section className="surface-glass w-full max-w-lg justify-self-center rounded-xl p-7 shadow-md sm:p-10">
          <p className="eyebrow mb-3">Your personal workspace</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mb-8 mt-3 text-sm leading-6 text-secondary">{description}</p>
          {children}<div className="mt-7 border-t border-line pt-6 text-center text-sm text-secondary">{footer}</div>
        </section>
      </div>
      <footer className="flex flex-wrap justify-between gap-2 text-xs text-secondary"><span>Tasko · Thoughtfully organized.</span><span>Projects. Priorities. Progress.</span></footer>
    </div>
  </main>;
}
