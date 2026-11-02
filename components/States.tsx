export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-24 text-[var(--text-muted)]">
      <span className="spinner" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function MessageState({
  title,
  body,
  action,
}: {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="ticket px-6 py-10 text-center my-10">
      <h2 className="display font-black text-xl mb-2">{title}</h2>
      {body && <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
