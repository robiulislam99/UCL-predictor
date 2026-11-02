"use client";

import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function loginWithGoogle() {
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
  return signOut(auth);
}

/** Turn a Firebase error into a sentence a person can act on (null = ignore). */
export function friendlyError(e: unknown): string | null {
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
