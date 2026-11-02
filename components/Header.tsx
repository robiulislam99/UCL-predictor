"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { logout } from "@/lib/firebase";
import { initials } from "@/lib/format";
import { CardIcon, LogOutIcon, TrophyIcon } from "./icons";

export const NAV = [
  { href: "/predict/", label: "My card", match: ["/predict/"], Icon: CardIcon },
  { href: "/leagues/", label: "Leagues", match: ["/leagues/", "/league/"], Icon: TrophyIcon },
];

export function useActiveNav() {
  const pathname = usePathname();
  const path = pathname?.replace(/\/?$/, "/") ?? "";
  return (match: string[]) => match.some((m) => path.startsWith(m));
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0 rounded-lg" aria-label="Matchday Calls home">
      <span
        className="grid h-8 w-8 place-items-center rounded-lg bg-violet font-display text-[13px] font-black text-white shadow-[0_4px_16px_-4px_rgba(124,92,252,0.7)]"
        aria-hidden
      >
        MC
      </span>
      <span className="font-display text-[17px] font-extrabold tracking-tight">Matchday Calls</span>
    </Link>
  );
}

export function Avatar({ name, photoURL, size = "h-8 w-8" }: { name?: string | null; photoURL?: string | null; size?: string }) {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoURL} alt="" referrerPolicy="no-referrer" className={`${size} shrink-0 rounded-full border border-line object-cover`} />
    );
  }
  return (
    <span
      aria-hidden
      className={`${size} grid shrink-0 place-items-center rounded-full bg-surface-3 text-[11px] font-semibold text-fg`}
    >
      {initials(name)}
    </span>
  );
}

function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex items-center rounded-full p-0.5 ring-1 ring-transparent transition hover:ring-line-strong"
      >
        <Avatar name={user.displayName} photoURL={user.photoURL} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.displayName ?? "Signed in"}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>
          <Link role="menuitem" href="/privacy/" className="block px-4 py-2.5 text-sm text-muted hover:bg-surface-3 hover:text-fg">
            Privacy
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-3 hover:text-fg"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({
  user,
  status,
  showSignIn = false,
}: {
  user?: User | null;
  /** Small status element shown in the bar, e.g. the autosave state. */
  status?: React.ReactNode;
  showSignIn?: boolean;
}) {
  const isActive = useActiveNav();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/65">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Logo href={user ? "/predict/" : "/"} />

        {user && (
          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = isActive(n.match);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-violet-soft text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {status}
          {user ? (
            <AccountMenu user={user} />
          ) : (
            showSignIn && (
              <Link href="/" className="btn btn-secondary btn-sm">
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
