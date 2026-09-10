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

1. Pick round length, difficulty, categories, and team names.
2. Pass the phone to the clue-giver. They see the target word plus taboo
   words they can't say.
3. Tap ✓ Correct or ✗ Skip to move to the next card.
4. When time's up, pass to the other team.
