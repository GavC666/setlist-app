# Setlist — Fitness App

## Exercise demonstrations: our own code, not Posecode
`posecode-render` (the animation engine from the project you found) is licensed **AGPL-3.0**,
which is copyleft — deploying it in a network-facing app obliges you to release your whole
app's source under AGPL too. Since you want this closed-source, it's dropped entirely, along
with `posecode-parser`.

In its place: `src/App.jsx` has a small (~230-line) hand-written forward-kinematics rig —
`BONES` (a parent/child joint tree), `MOVE_DATA` (18 movement patterns, each a start pose
and end pose in joint-angle degrees, reusing the same values worked out earlier), and
`Mannequin3D`, a component that tweens between the two poses on a loop and renders it with
plain **Three.js** (MIT-licensed — no copyleft, no attribution requirement, fine for a
closed-source product). No vendored code, no external character asset, no other runtime
dependency beyond `three` itself.

**Heads up:** these joint angles are a stylized, hand-authored approximation — not motion
capture data — and I can't render or preview this myself to check them (no network access
in my sandbox). Once it's running, a few signs/magnitudes will likely need nudging by eye,
especially the lunge and the twist. `MOVE_DATA` in `App.jsx` is where to tweak them.

## Run on StackBlitz (works fully in an Android browser, no local install needed)
1. Go to https://stackblitz.com/ in Chrome on your phone.
2. Tap "+ Create" → "Vite" (React) template.
3. Delete the generated files and upload this project's files instead (`package.json`,
   `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`).
4. StackBlitz runs `npm install` in-browser (WebContainers) — just `three`, `react`,
   `react-dom`, `lucide-react`, all normal published packages, nothing vendored.
5. You'll get a live preview + shareable `*.stackblitz.io` URL — add it to your phone's
   home screen for an app-like feel.

## Run on a computer
```
npm install
npm run dev
```
To view it on your phone instead:
```
npm run dev -- --host
```
then open `http://<computer's-LAN-IP>:5173` on your phone (same WiFi).

## Note on window.storage
The routine/health persistence in `App.jsx` uses `window.storage`, a Claude.ai-artifact-only
API. Outside claude.ai it will throw — swap it for `localStorage` (or your own backend)
before relying on it. Happy to make that change for you.
