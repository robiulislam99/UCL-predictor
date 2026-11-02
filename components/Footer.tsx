import Link from "next/link";

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-line ${className}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-xl leading-relaxed">
          A free fan game for friends. Not affiliated with, endorsed by or connected to UEFA or any club.
          Team names are used for identification only.
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/privacy/" className="hover:text-fg">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
