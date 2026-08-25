/**
 * Instrument bay panel. Corner brackets + a header rail carrying a
 * designation code, title, and status chip.
 *
 * The bracket marks are drawn, not bordered, so they read as machined
 * registration marks rather than a rounded card.
 */

const STATUS = {
  ok: 'text-phosphor border-phosphor/50',
  warn: 'text-amber-alert border-amber-alert/50',
  crit: 'text-blood border-blood/50',
  off: 'text-ash border-ash/40',
};

function Bracket({ className }) {
  return (
    <svg
      className={`pointer-events-none absolute h-3 w-3 text-phosphor/45 ${className}`}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 0 H12 M0 0 V12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Panel({
  designation,
  title,
  status = 'off',
  statusLabel,
  actions,
  children,
  className = '',
  bodyClassName = '',
}) {
  return (
    <section className={`bay clip-corner ${className}`}>
      <Bracket className="left-0 top-0" />
      <Bracket className="right-0 top-0 rotate-90" />
      <Bracket className="bottom-0 right-0 rotate-180" />
      <Bracket className="bottom-0 left-0 -rotate-90" />

      <header className="flex items-center gap-3 border-b border-phosphor/15 px-4 py-2.5">
        {designation && (
          <span className="label shrink-0 text-violet-glow/70">{designation}</span>
        )}
        <h2 className="font-display text-[13px] font-600 uppercase tracking-[0.18em] text-phosphor/90">
          {title}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          {actions}
          {statusLabel && (
            <span
              className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${STATUS[status]}`}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </header>

      <div className={bodyClassName || 'p-4'}>{children}</div>
    </section>
  );
}
