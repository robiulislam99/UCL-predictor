"use client";

import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import {
  Auth,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { connectFirestoreEmulator, Firestore, getFirestore } from "firebase/firestore";

// All values here are PUBLIC web config (not secrets) — Firebase's own docs
// confirm these are safe to ship to the client. Protect the project with
// Firestore rules, App Check and API-key domain restrictions instead.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** False when the build has no Firebase web config (e.g. the repo secrets aren't set). */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Local development against the Firebase Emulator Suite (see README).
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";

let services: { auth: Auth; db: Firestore } | null = null;

// Firebase starts lazily, in the browser, on first use. Initialising it at
// module load ran during the static build too, where a missing API key
// crashed prerendering of every page.
function getServices() {
  if (!services) {
    if (!firebaseConfigured) throw new Error("firebase-not-configured");
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    if (useEmulators) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    }
    services = { auth, db };
  }
  return services;
}

export const getFirebaseAuth = () => getServices().auth;
export const getDb = () => getServices().db;

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  try {
    return await signInWithPopup(auth, provider);
  } catch (e) {
    // Mobile browsers often block popups — fall back to a full-page redirect.
    if (e instanceof FirebaseError && e.code === "auth/popup-blocked") {
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
}

export async function logout() {
  return signOut(getFirebaseAuth());
}

/** Turn a Firebase error into a sentence a person can act on (null = ignore). */
export function friendlyError(e: unknown): string | null {
  if (e instanceof Error && e.message === "firebase-not-configured") {
    return "Sign-in isn't set up on this site yet.";
  }
  const code = e instanceof FirebaseError ? e.code : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/network-request-failed":
    case "unavailable":
      return "You seem to be offline. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "Sign-in isn't enabled for this domain yet (add it under Firebase → Authentication → Authorized domains).";
    case "permission-denied":
      return "That action isn't allowed.";
    default:
      return "Something went wrong. Please try again.";
  }
}
