export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-24 text-muted">
      <span className="spinner" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Full-page loading state for pages that wait on sign-in before rendering their shell. */
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center">
      <LoadingState label={label} />
    </main>
  );
}

export function MessageState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card mx-auto my-8 max-w-lg px-6 py-10 text-center">
      {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-muted">{icon}</div>}
      <h2 className="mb-2 font-display text-xl font-black">{title}</h2>
      {body && <p className="mx-auto max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center gap-2">{action}</div>}
    </div>
  );
}
