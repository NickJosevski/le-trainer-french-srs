# 🇫🇷🇮🇹🇪🇸🇯🇵🇩🇪🇨🇳 Le Trainer — Vocabulary SRS

A standalone, offline-first web app for learning vocabulary through
**Spaced Repetition (SM-2)**, sentence context, cloze deletion, and native
speech audio. Ships with **French, Italian, Spanish, Japanese, German, and
Mandarin Chinese** decks and switches between them in-app. No backend, no build
step — just open `index.html`.

## Features

- **Six languages, one engine** — French 🇫🇷, Italian 🇮🇹, Spanish 🇪🇸,
  Japanese 🇯🇵, German 🇩🇪, and Mandarin Chinese 🇨🇳, switchable from the top
  bar. Each language has its own deck, voice, stemmer, articles, and independent
  SRS progress. Adding another is just a new file in `js/lang/`.
- **Beginner-friendly onboarding** — a first-run welcome walks you through the
  idea and lets you pick a language. Brand-new words appear as a no-pressure
  **learn card** (see it, hear it, learn the meaning) *before* you're ever
  quizzed, so you're never guessing at a word you've never met. Rating buttons
  carry plain-language hints ("no idea / tough / got it / too easy") and a **?**
  help panel explains the loop, shortcuts, and jargon (cloze, IPA, CEFR).
- **SM-2 spaced repetition** — Again / Hard / Good / Easy ratings with live
  next-interval previews; cards flow through New → Learning → Review → Mastered.
- **Grammar-aware cards** — article + gender tag (`le` / `la` / `il` / `la`,
  `[m]` / `[f]`), IPA phonetics, part of speech, and CEFR level (A1–C1).
- **Cloze deletion** — hides the target word (`[…]`) inside a full example
  sentence. An explicit *inflected form* field plus a light per-language stemmer
  mean conjugated verbs (e.g. *voudrais*, *vorrei*, *quiero*, and Japanese
  住む→*住んで*) cloze/highlight correctly, not just exact matches. Japanese is
  matched by CJK substring since it has no spaces.
- **Word mining** — see an interesting word in an example sentence? Tap it to
  capture a card for it, pre-filled with that sentence as context. If you
  already have the word, it's added as another example instead. "Save & study
  now" drops the card into your current session without losing your place.
- **Multiple examples per card** — a card can hold several example sentences;
  an "↻ Another example" button cycles through them so you see the word in more
  than one context.
- **Native audio** — `speechSynthesis` set to the active language (`fr-FR`,
  `it-IT`, `es-ES`, `ja-JP`), voice picker, and a 0.75× slow-playback mode.
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
git clone https://github.com/NickJosevski/le-trainer-srs.git
cd le-trainer-srs
open index.html   # or just double-click it
```

Or play it online: **https://nickjosevski.github.io/le-trainer-srs/**

Each language ships with a curated 30-word starter deck across A1–B1 (Japanese
maps JLPT N5/N4/N3 → A1/A2/B1 so the level filter still applies).

## Project structure

```
index.html            markup — Review / Deck / Stats / Settings + modal
css/styles.css        dark slate theme, glassmorphism, responsive
js/
├── app.js            language-agnostic engine
│                     (Lang · Store · SRS · Audio · Review · DeckManager
│                      · Stats · Settings · Data · Modal · App)
├── match.js          shared target-word matcher (used by the app AND the test)
└── lang/
    ├── fr.js         French pack: deck + stemmer + voice + articles + UI
    ├── it.js         Italian pack (same shape)
    ├── es.js         Spanish pack
    ├── ja.js         Japanese pack (no gender; CJK-aware matching)
    ├── de.js         German pack (der/die/das; -en stemmer)
    └── zh.js         Mandarin pack (no gender/inflection; CJK-aware)
test/decks.test.mjs   deck integrity check, run in CI before deploy
```

### Adding a language

Drop a `js/lang/<code>.js` that registers a pack on
`window.LeTrainer.langs`, then add one `<script>` tag in `index.html`. A pack
provides: `code`, `name`, `flag`, `voiceLang`/`voiceMatch`, `ui` strings,
`genders` (article/gender options), a `stem(word)` function, and a `deck`
array. The engine, storage namespacing, and language switcher pick it up
automatically.

## Testing

```bash
npm test        # node test/decks.test.mjs
```

The test loads the real matcher and every language pack exactly as the browser
does, then asserts every card's target can be located in its example sentence
(so cloze deletion and highlighting are guaranteed to work). It runs in GitHub
Actions on every push — **a failing deck blocks the Pages deploy**, so a card
whose sentence doesn't contain its word can never ship.

## License

MIT
