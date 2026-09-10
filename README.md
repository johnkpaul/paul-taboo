# paul-taboo — Taboo Jr

A kid-friendly Taboo word game built for pass-and-play on a single phone. No
backend, no accounts, no tracking — just static HTML/CSS/JS so it can be
hosted on GitHub Pages and works offline once loaded.

## Play it

Once GitHub Pages is enabled for this repo (Settings → Pages → Source:
Deploy from a branch → `main` / `/root`), the game will be live at:

```
https://johnkpaul.github.io/paul-taboo/
```

Open that link on a phone and tap "Add to Home Screen" for an app-like icon.

## Develop locally

No build step required.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## How it works

- `index.html` / `style.css` / `app.js` — the game itself.
- `words.json` — the word bank (word + taboo words + category + difficulty).
  Add more entries here any time; no code changes needed.
- `manifest.json` / `sw.js` / `icons/` — makes it installable as a PWA and
  cacheable for spotty wifi (e.g. at a restaurant).

## Game rules

1. Pick a difficulty and one or more categories.
2. Say the target word using clues, without saying any of the taboo words
   below it.
3. Swipe the card left/right (or tap the ‹ › buttons) to move between words.
4. Tap "Categories" any time to change your selection.
