"use client";

import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./firebase";
import { League, Picks, PredictionDoc } from "./types";

// ---- Predictions: predictions/{uid} ------------------------------------

export async function getPrediction(uid: string) {
  const snap = await getDoc(doc(db, "predictions", uid));
  return snap.exists() ? (snap.data() as PredictionDoc) : null;
}

/** Saves the profile fields, and the picks when given. Always merges. */
export async function savePrediction(user: User, picks?: Picks) {
  await setDoc(
    doc(db, "predictions", user.uid),
    {
      displayName: (user.displayName ?? "Anonymous").slice(0, 100),
      photoURL: user.photoURL ?? null,
      updatedAt: serverTimestamp(),
      ...(picks ? { picks } : {}),
    },
    { merge: true }
  );
}

// ---- Leagues: leagues/{code}, indexed per player in users/{uid}.leagues --
// The private users/{uid} index means "my leagues" is a couple of gets,
// never a collection query, so the rules stay simple.

// No 0/O/1/I so codes survive being read out loud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
export const MAX_LEAGUE_MEMBERS = 50;

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function getLeague(code: string): Promise<League | null> {
  const snap = await getDoc(doc(db, "leagues", code));
  return snap.exists() ? ({ code, ...snap.data() } as League) : null;
}

export async function getMyLeagues(uid: string): Promise<League[]> {
  const snap = await getDoc(doc(db, "users", uid));
  const codes: string[] = snap.exists() ? (snap.data().leagues ?? []) : [];
  const leagues = await Promise.all(codes.map((c) => getLeague(c).catch(() => null)));
  return leagues
    .filter((l): l is League => !!l && l.members.includes(uid))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function userIndex(uid: string) {
  return doc(db, "users", uid);
}

export async function createLeague(user: User, name: string) {
  await savePrediction(user); // so the table can show this player's name
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    if (await getLeague(code)) continue;
    const batch = writeBatch(db);
    batch.set(doc(db, "leagues", code), {
      name: name.trim().slice(0, 40),
      ownerUid: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
    });
    batch.set(userIndex(user.uid), { leagues: arrayUnion(code) }, { merge: true });
    await batch.commit();
    return code;
  }
  throw new Error("Couldn't generate a free league code");
}

export type JoinResult = "joined" | "already-member" | "not-found" | "full";

export async function joinLeague(user: User, code: string): Promise<JoinResult> {
  const league = await getLeague(code);
  if (!league) return "not-found";
  const alreadyMember = league.members.includes(user.uid);
  if (!alreadyMember && league.members.length >= MAX_LEAGUE_MEMBERS) return "full";
  await savePrediction(user);
  const batch = writeBatch(db);
  if (!alreadyMember) batch.update(doc(db, "leagues", code), { members: arrayUnion(user.uid) });
  // Also repairs the index if the player was a member but it's missing.
  batch.set(userIndex(user.uid), { leagues: arrayUnion(code) }, { merge: true });
  await batch.commit();
  return alreadyMember ? "already-member" : "joined";
}

export async function leaveLeague(uid: string, code: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "leagues", code), { members: arrayRemove(uid) });
  batch.set(userIndex(uid), { leagues: arrayRemove(code) }, { merge: true });
  await batch.commit();
}
