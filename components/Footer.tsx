import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-3xl mx-auto px-5 sm:px-10 py-10 text-xs text-[var(--text-muted)] text-center space-y-2">
      <p>
        A free fan game for friends. Not affiliated with, endorsed by or connected to UEFA or any
        club. Team names are used for identification only.
      </p>
      <p>
        <Link href="/privacy/" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
          Privacy
        </Link>
      </p>
    </footer>
  );
}
