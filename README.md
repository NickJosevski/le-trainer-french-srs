# 🇫🇷 Le Trainer — French Vocabulary SRS

A standalone, offline-first web app for learning French vocabulary through
**Spaced Repetition (SM-2)**, sentence context, cloze deletion, and native
speech audio. No backend, no build step — just open `index.html`.

## Features

- **SM-2 spaced repetition** — Again / Hard / Good / Easy ratings with live
  next-interval previews; cards flow through New → Learning → Review → Mastered.
- **French-first cards** — article + gender tag (`le` / `la`, `[m]` / `[f]`),
  IPA phonetics, part of speech, and CEFR level (A1–C1).
- **Cloze deletion** — hides the target word (`[…]`) inside a full example
  sentence. An explicit *inflected form* field plus a light French stemmer mean
  conjugated verbs (e.g. *voudrais*, *connais*, *comprends*) clone/highlight
  correctly, not just exact matches.
- **Native audio** — `speechSynthesis` locked to `fr-FR`, voice picker, and a
  0.75× slow-playback mode.
- **Deck manager** — search, filter by level/state, edit, delete; quick-add modal.
- **Analytics** — reviewed-today, day streak, retention %, memory-breakdown bar,
  and a 20-week activity heatmap.
- **Your data stays yours** — everything persists in `localStorage`, with clean
  JSON export / import for backup.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Flip card |
| `1` `2` `3` `4` | Rate Again / Hard / Good / Easy |
| `R` | Replay French audio |

## Getting started

```bash
git clone https://github.com/NickJosevski/le-trainer-french-srs.git
cd le-trainer-french-srs
open index.html   # or just double-click it
```

Ships with a curated 30-word starter deck across A1–B1.

## Project structure

| File | Role |
|------|------|
| `index.html` | Markup — Review / Deck / Stats / Settings views + add/edit modal |
| `styles.css` | Dark slate theme, glassmorphism, tricolor accents, responsive |
| `app.js` | Modular logic: `Store · SRS · Audio · Review · DeckManager · Stats · Settings · Data · Modal · App` |

## License

MIT
