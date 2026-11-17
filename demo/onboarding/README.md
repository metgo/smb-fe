# Business onboarding demo

A clickable demo of the vendor onboarding in Workspace (business details,
two-step business type picker, location, photos, your story, products, done
screen). It runs entirely in the browser on a fake backend with sample data,
so it needs no server, database, API keys or login.

Live copy: https://claude.ai/artifact/Esyeh3uuGSgcJEKULPDt3G (shared from the
artifact's Share menu).

## Open it on your computer

You only need [Node.js](https://nodejs.org) (18 or newer). From the repository root:

```bash
node demo/onboarding/serve.mjs
```

Then open http://localhost:4173.

Any static file server works too, for example `python3 -m http.server 4173 -d demo/onboarding/dist`
or `npx serve demo/onboarding/dist`. Opening `dist/index.html` by double-clicking
does not work, because browsers block module scripts and translation files on `file://`.

## Demo accounts

Any password works.

| Email | What you see |
| --- | --- |
| `new@demo.co` | A new vendor with no businesses. Onboarding opens right away. |
| `owner@demo.co` | A vendor with 6 sample businesses in the Negev. |

Data lives in the browser tab's memory, so a reload starts fresh.

## Rebuild after changing workspace-fe

`dist/` is a prebuilt copy. To refresh it from the current `workspace-fe` code:

```bash
demo/onboarding/build/build-demo.sh            # writes demo/onboarding/dist
```

Needs Node.js, yarn and python3 (macOS/Linux, or WSL/Git Bash on Windows). The first
run installs `workspace-fe` dependencies. The product code is never changed: the
script copies `workspace-fe` to a temp folder and patches the copy.

| File | Role |
| --- | --- |
| `build/build-demo.sh` | Copies workspace-fe, applies the demo patches, runs the Vite build |
| `build/patch-demo.py` | Patches the copy: fake backend, in-memory router, typed address instead of Google Maps, demo login box. Each patch fails loudly if the app code it targets has changed |
| `build/mockBackend.ts` | Fake API (axios adapter) answering the app's requests from memory |
| `build/samples.ts` | Demo users, the 12 business areas from the taxonomy CSV, and the sample businesses |
| `serve.mjs` | Tiny static server for `dist/` with no dependencies |
| `dist/` | The built demo |
