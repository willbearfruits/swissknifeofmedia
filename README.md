<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SwissKnifeOfMedia

Toolkit for media artists and synth builders: resource library, tutorial workspace with optional AI assistant, and embedded hardware utilities (serial monitor, ESP32 flasher UI, Daisy DFU prompt).

## Run Locally
- Prerequisites: Node.js 20+
- Copy `.env.example` to `.env.local` (or `.env`) and fill your Firebase config.
- Install: `npm install`
- Develop: `npm run dev`
- Build: `npm run build`
- Type-check (no emit): `npx tsc --noEmit`

## API Keys
- Provide your Gemini API key in the app via **Settings → Gemini API Key** (stored locally).
- Optional for local-only testing: set `VITE_GEMINI_API_KEY` in an environment file, but do not commit secrets or use this for public builds.

## Firebase Auth (secure login)
- Create a Firebase project (no paid plan required for basic email/password auth).
- Enable **Email/Password** sign-in in Firebase Console → Authentication.
- Add your web app and copy the config into `.env.local` matching `.env.example`.
- Optionally set `VITE_ADMIN_EMAILS` as a comma-separated allowlist for admin role.
- For GitHub Pages builds, add the same values as repository secrets so the Actions workflow can inject them during `npm run build`:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - optional: `VITE_ADMIN_EMAILS`, `VITE_GEMINI_API_KEY`

## Security Notes
- Authentication now uses Firebase; passwords are never stored locally.
- Admin role defaults to emails containing “admin” unless you specify `VITE_ADMIN_EMAILS`.
- Resource/tutorial data still lives in `localStorage`; clearing browser storage resets that demo data.
- Avoid bundling secrets; only set `VITE_GEMINI_API_KEY` for local testing.

## Deploy to GitHub Pages
- Push to `main`; `.github/workflows/deploy.yml` builds and publishes `dist` to the `gh-pages` branch.
- In GitHub repo settings, enable Pages with **Source: GitHub Actions**.
- Vite `base: './'` and `HashRouter` are configured for Pages paths.
