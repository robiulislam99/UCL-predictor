# Matchday Calls — UCL Prediction App

Sign in, predict scores for every Champions League fixture, earn points when
you're right, and compete with friends in private leagues.

- **Picks autosave** and **lock at kickoff**.
- **Scoring**: 3 pts for the exact score, 1 pt for the right result (win/draw/loss).
- **Private leagues**: create one, send the 6-character invite code or link, and
  get a live table (ties broken by exact scores, then correct results).
- **Share cards**: a read-only link to anyone's predictions and points.

Built with Next.js (static export) + Firebase (Google sign-in + Firestore),
so it deploys **free on GitHub Pages** — no server to run or pay for.

## 1. Create a free Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (free, no billing needed for this usage level).
2. In the project, click **Build → Authentication → Get started**, enable the **Google** sign-in provider.
3. Click **Build → Firestore Database → Create database** → start in **production mode** (rules are provided below).
4. Go to **Project settings → General → Your apps → Add app → Web (`</>`)**. Register the app and copy the `firebaseConfig` values — you'll need them below.
5. Still in Authentication, open **Settings → Authorized domains** and add `<your-github-username>.github.io` (for this repo: `robiulislam99.github.io`, plus your custom domain if you use one) so Google sign-in works once deployed.
6. In Firestore, open the **Rules** tab and paste the contents of `firestore.rules` from this repo, then **Publish**. This lets anyone view a shared card by link, but only the signed-in owner can write their own.

## 2. Run it locally (optional)

```bash
cp .env.local.example .env.local
# paste your firebaseConfig values into .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Or against the Firebase emulators (no real project needed)

The [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
runs Auth and Firestore on your machine, using this repo's `firestore.rules`.
It needs Java 11+.

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-ucl
```

Then in `.env.local` use any placeholder config with `NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-ucl"`
and add `NEXT_PUBLIC_FIREBASE_EMULATORS="true"`. The app connects to Auth on port 9099
and Firestore on port 8080, and Google sign-in shows the emulator's test-account picker.

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
4. Push to `main` (or run the workflow manually from the **Actions** tab). The included workflow (`.github/workflows/deploy.yml`) builds the static site and deploys it to GitHub Pages automatically, at `https://<your-username>.github.io/<repo-name>/` (here: `https://robiulislam99.github.io/UCL-predictor/`).

That's it — every push to `main` redeploys.

The workflow reads the site address from your Pages settings, so it also works
for a user page or a custom domain without changes. If any of the six secrets is
missing, the run stops at **Check Firebase settings** and names the missing ones,
rather than publishing a site where nobody can sign in. Pull requests run the
checks and a build, but never deploy.

## Updating fixtures and results

`lib/fixtures.ts` holds the full official 2026/27 league phase: 144 matches,
8 matchdays, UTC kickoffs from UEFA's fixture list. Clubs (with pots and badge
colours) are in `lib/teams.ts`.

After a match, add the full-time score as the last argument and push:

```ts
m("ucl-2049607", 4, "2026-11-03T20:00:00Z", "Barcelona", "Aston Villa", [2, 1]),
```

Points, totals and every league table update on the next deploy.

- Never change an existing `id` — saved picks are keyed by it.
- `lib/fixtures.test.ts` checks the UEFA format (18 matches per matchday,
  4 home + 4 away per club, 1 home + 1 away opponent from each pot), so a typo
  in a team name or matchday fails CI instead of reaching users.

## How it works

- **Auth**: Google sign-in via Firebase Auth (popup, with a redirect fallback when popups are blocked).
- **Storage**: each user's picks live at `predictions/{uid}`; leagues at `leagues/{code}` with a `members` array.
- **Scoring** (`lib/scoring.ts`) runs in the browser from the results in `lib/fixtures.ts`, so there's no server to run.
- **Security** (`firestore.rules`): anyone can open a single card by link, but nobody can list every card; writes are validated; league members can only add or remove *themselves*.
- **Hosting**: `next.config.ts` sets `output: "export"`, so `npm run build` produces a plain static `out/` folder for GitHub Pages. Firebase starts lazily in the browser, so the build itself never contacts Firebase and succeeds even without config.
- **Install**: `app/manifest.ts` and the icons let phones add the app to the home screen; `app/opengraph-image.png` is the preview shown when a link is shared.
- **CI**: every push and PR runs lint, typecheck and unit tests (`npm run check`) before building; only `main` deploys.

### Known limits of the free static setup

- The kickoff lock is enforced by the app, not by Firestore rules (the rules
  can't see `lib/fixtures.ts`). To make it tamper-proof, move fixtures into
  Firestore and check `request.time` against their kickoff in the rules.
- Share links all show the same preview image/text; per-player previews need
  a server (e.g. Vercel or Firebase App Hosting).

### Recommended Firebase hardening

- **App Check** (reCAPTCHA Enterprise) for Firestore, so only your site can use your project.
- In Google Cloud Console → APIs & Services → Credentials, restrict the browser
  API key to your site's domains.

## Project structure

```
app/
  page.tsx                 landing page + Google sign-in
  predict/page.tsx         your prediction board (autosave, kickoff locks)
  share/page.tsx           public read-only card (?uid=...)
  leagues/page.tsx         your leagues + create / join (?join=CODE)
  league/page.tsx          a league table (?code=CODE)
  privacy/page.tsx
  manifest.ts, icon.svg, apple-icon.png, opengraph-image.png
components/
  AppShell.tsx             signed-in page frame: header, phone tab bar, footer
  Header.tsx               sticky header, nav, account menu
  Board.tsx                matchday tabs + fixture grid + stat row
  FixtureCard.tsx          match card: one row per team (status, picks, points)
  ScoreStepper.tsx         accessible − / + score picker
  Footer.tsx, States.tsx, icons.tsx
lib/
  fixtures.ts              the editable match list + results
  scoring.ts               points, tallies, locks (+ scoring.test.ts)
  format.ts                countdowns, dates, initials (+ format.test.ts)
  data.ts                  Firestore reads/writes for cards and leagues
  firebase.ts              lazy Firebase init, emulator switch, sign-in, friendly errors
  site.ts                  base path + public site URL
  useAuth.ts, useNow.ts, share.ts, types.ts
public/                    home-screen icons (192, 512, maskable)
firestore.rules            paste into Firebase Console → Firestore → Rules
.github/workflows/deploy.yml   builds + deploys to GitHub Pages on push
```
