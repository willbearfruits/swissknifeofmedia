<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SwissKnifeOfMedia

Toolkit for media artists and synth builders: resource library, tutorial workspace with optional AI assistant, and embedded hardware utilities (serial monitor, ESP32 flasher UI, Daisy DFU prompt).

## Run Locally
- Prerequisites: Node.js 20+
- Install: `npm install`
- Develop: `npm run dev`
- Build: `npm run build`
- Type-check (no emit): `npx tsc --noEmit`

## API Keys
- Provide your Gemini API key in the app via **Settings → Gemini API Key** (stored locally).
- Optional for local-only testing: set `VITE_GEMINI_API_KEY` in an environment file, but do not commit secrets or use this for public builds.

## Security Notes
- Auth is demo-only: credentials are hashed before storing in `localStorage`, but there is no backend—do not reuse production passwords.
- Clearing browser storage resets stored users/resources.
- Secrets are not bundled unless you explicitly set `VITE_GEMINI_API_KEY`.

## Deploy to GitHub Pages
- Push to `main`; `.github/workflows/deploy.yml` builds and publishes `dist` to the `gh-pages` branch.
- In GitHub repo settings, enable Pages with **Source: GitHub Actions**.
- Vite `base: './'` and `HashRouter` are configured for Pages paths.
