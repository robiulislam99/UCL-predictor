"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { logout } from "@/lib/firebase";

const NAV = [
  { href: "/predict/", label: "My card", match: ["/predict/"] },
  { href: "/leagues/", label: "Leagues", match: ["/leagues/", "/league/"] },
];

export default function Header({
  user,
  rightSlot,
}: {
  user?: User | null;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4 px-5 sm:px-10 py-5 max-w-5xl mx-auto flex-wrap">
      <Link href={user ? "/predict/" : "/"} className="flex items-center gap-2 shrink-0">
        <span
          className="h-8 w-8 rounded-md flex items-center justify-center font-black text-sm"
          style={{ background: "var(--accent-violet)", color: "white" }}
          aria-hidden
        >
          MC
        </span>
        <span className="display font-extrabold tracking-tight text-lg">Matchday&nbsp;Calls</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
        {user && (
          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map((n) => {
              const path = pathname?.replace(/\/?$/, "/") ?? "";
              const active = n.match.some((m) => path.startsWith(m));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "bg-[var(--accent-violet-soft)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        )}
        {rightSlot}
        {user && (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-[var(--border)]"
              />
            )}
            <button
              onClick={() => logout()}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
