"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";
import FixtureCard from "@/components/FixtureCard";
import { db } from "@/lib/firebase";
import { fixtures } from "@/lib/fixtures";
import { PredictionDoc } from "@/lib/types";

function ShareContent() {
  const params = useSearchParams();
  const uid = params.get("uid");
  const [data, setData] = useState<PredictionDoc | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!uid) {
      setData(null);
      return;
    }
    (async () => {
      const snap = await getDoc(doc(db, "predictions", uid));
      setData(snap.exists() ? (snap.data() as PredictionDoc) : null);
    })();
  }, [uid]);

  if (!uid || data === null) {
    return (
      <p className="text-[var(--text-muted)] text-center mt-10">
        {uid
          ? "This prediction card doesn't exist, or the link is wrong."
          : "No card selected. Ask your friend for their share link."}
      </p>
    );
  }

  if (data === undefined) {
    return (
      <p className="text-[var(--text-muted)] text-center mt-10">
        Loading prediction card…
      </p>
    );
  }

  const madePickCount = Object.keys(data.picks ?? {}).length;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        {data.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoURL}
            alt=""
            className="h-12 w-12 rounded-full border border-[var(--border)]"
          />
        )}
        <div>
          <h1 className="display font-black text-2xl sm:text-3xl">
            {data.displayName}&apos;s card
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {madePickCount} of {fixtures.length} fixtures called
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {fixtures.map((f) => (
          <FixtureCard key={f.id} fixture={f} pick={data.picks?.[f.id]} readOnly />
        ))}
      </div>
    </>
  );
}

export default function SharePage() {
  return (
    <main className="pb-20">
      <Header />
      <section className="max-w-3xl mx-auto px-6 sm:px-10">
        <Suspense
          fallback={
            <p className="text-[var(--text-muted)] text-center mt-10">
              Loading…
            </p>
          }
        >
          <ShareContent />
        </Suspense>
      </section>
    </main>
  );
}
