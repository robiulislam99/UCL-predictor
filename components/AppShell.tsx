"use client";

import Link from "next/link";
import { User } from "firebase/auth";
import Header, { NAV, useActiveNav } from "./Header";
import Footer from "./Footer";

/** Bottom tab bar for signed-in pages on phones; the header carries the nav from md up. */
function MobileNav() {
  const isActive = useActiveNav();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-2">
        {NAV.map(({ href, label, match, Icon }) => {
          const active = isActive(match);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-fg" : "text-muted"
                }`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? "bg-violet-soft text-[#b7a6ff]" : ""}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Header, page container, footer and (when signed in) the phone tab bar. */
export default function AppShell({
  user,
  status,
  children,
}: {
  user?: User | null;
  status?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header user={user} status={status} showSignIn={!user} />
      <main id="main" className={`mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10 ${user ? "pb-28 md:pb-16" : "pb-16"}`}>
        {children}
      </main>
      <Footer className={user ? "pb-28 md:pb-10" : undefined} />
      {user && <MobileNav />}
    </>
  );
}

/** Page title block: eyebrow, title, description and optional actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-gold">{eyebrow}</p>}
        <h1 className="font-display text-[28px] font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
      {children}
    </Link>
  );
}
