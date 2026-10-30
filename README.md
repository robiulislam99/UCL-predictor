# Matchday Calls — UCL Prediction App

Sign in, predict scores for every Champions League fixture, save your picks
to your account, and share a read-only link so friends can see your card.

Built with Next.js (static export) + Firebase (Google sign-in + Firestore),
so it deploys **free on GitHub Pages** — no server to run or pay for.

## 1. Create a free Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (free, no billing needed for this usage level).
2. In the project, click **Build → Authentication → Get started**, enable the **Google** sign-in provider.
3. Click **Build → Firestore Database → Create database** → start in **production mode** (rules are provided below).
4. Go to **Project settings → General → Your apps → Add app → Web (`</>`)**. Register the app and copy the `firebaseConfig` values — you'll need them below.
5. Still in Authentication, open **Settings → Authorized domains** and add `<your-github-username>.github.io` (and your custom domain if you use one) so Google sign-in works once deployed.
6. In Firestore, open the **Rules** tab and paste the contents of `firestore.rules` from this repo, then **Publish**. This lets anyone view a shared card by link, but only the signed-in owner can write their own.

## 2. Run it locally (optional)

```bash
cp .env.local.example .env.local
# paste your firebaseConfig values into .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## 3. Push to GitHub and deploy for free

1. Create a new **public** GitHub repo and push this project to it.
2. In the repo, go to **Settings → Pages** → under "Build and deployment", set **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions → New repository secret** and add each of these (values from step 1.4):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Push to `main` (or run the workflow manually from the **Actions** tab). The included workflow (`.github/workflows/deploy.yml`) builds the static site and deploys it to GitHub Pages automatically, at `https://<your-username>.github.io/<repo-name>/`.

That's it — every push to `main` redeploys.

## Updating fixtures

Match data lives in `lib/fixtures.ts` as a plain array — no admin panel needed.
It's seeded with confirmed matchups from the 2026/27 league-phase draw
(27 August 2026); UEFA publishes exact matchday dates and kick-off times by
29 August 2026, and the full 8-matches-per-club schedule after that. Update
the `date` field (and add the rest of the fixtures) once that's out — just
add/edit objects in that file and push.

## How it works

- **Auth**: Google sign-in via Firebase Auth (client-side only — works fine on static hosting).
- **Storage**: each user's picks are saved to Firestore at `predictions/{uid}`.
- **Sharing**: the "Share my card" button copies a link like `/share/?uid=...`. That page is public and read-only — Firestore rules allow anyone to *read* a prediction doc but only its owner to *write* it.
- **Hosting**: `next.config.ts` sets `output: "export"`, so `npm run build` produces a plain static `out/` folder that GitHub Pages can serve directly — no Node server required in production.

## Project structure

```
app/
  page.tsx                 landing page + Google sign-in
  predict/page.tsx         the prediction board (auth-gated)
  share/page.tsx           public read-only card view (?uid=...)
components/
  FixtureCard.tsx          ticket-style match card
  ScoreStepper.tsx         scoreboard-style score picker
  Header.tsx
lib/
  firebase.ts              Firebase init + auth helpers
  fixtures.ts              the editable match list
  types.ts
  useAuth.ts               auth-state hook
firestore.rules            paste into Firebase Console → Firestore → Rules
.github/workflows/deploy.yml   builds + deploys to GitHub Pages on push
```
