export default function ProgressBar({ value, label, dark = false }: { value: number; label: string; dark?: boolean }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={`h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-line/70'}`}>
    <div className={`h-full rounded-full ${dark ? 'bg-accent' : 'bg-info'}`} style={{ width: `${percent}%` }} />
  </div>;
}
