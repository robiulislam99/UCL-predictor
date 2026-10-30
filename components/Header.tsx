"use client";

import { User } from "firebase/auth";
import { logout } from "@/lib/firebase";

export default function Header({
  user,
  rightSlot,
}: {
  user?: User | null;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center font-black text-sm"
          style={{ background: "var(--accent-violet)", color: "white" }}
        >
          MC
        </div>
        <span className="display font-extrabold tracking-tight text-lg">
          Matchday&nbsp;Calls
        </span>
      </div>
      <div className="flex items-center gap-4">
        {rightSlot}
        {user && (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
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
