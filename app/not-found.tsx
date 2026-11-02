import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="score-font text-6xl font-bold text-[var(--accent-gold)]">4–0–4</p>
      <h1 className="display font-black text-2xl">Offside. This page doesn&apos;t exist.</h1>
      <Link href="/" className="btn-primary px-5 py-2.5 mt-2">
        Back to the board
      </Link>
    </main>
  );
}
