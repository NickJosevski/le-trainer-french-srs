/* =========================================================
   Le Trainer — Vocabulary SRS engine (language-agnostic)
   Reads language packs from window.LeTrainer.langs.
   Modules: Lang, Store, SRS, Audio, Review, DeckManager,
            Stats, Settings, Data, Modal, Toast, App
   ========================================================= */
(() => {
"use strict";

/* ---------------------------------------------------------
   0. Constants
   --------------------------------------------------------- */
const LS_PREFIX = "leTrainer.v1.";        // + language code
const LS_ACTIVE = "leTrainer.activeLang";
const DAY_MS = 86400000;
const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };

const registry = () => (window.LeTrainer && window.LeTrainer.langs) || {};

/* ---------------------------------------------------------
   1. Lang — active language pack + switching
   --------------------------------------------------------- */
const Lang = {
  code: "fr",
  pack() { return registry()[this.code]; },
  all() { return Object.values(registry()); },

  resolveInitial() {
    const codes = Object.keys(registry());
    const saved = localStorage.getItem(LS_ACTIVE);
    this.code = (saved && registry()[saved]) ? saved : (codes[0] || "fr");
    localStorage.setItem(LS_ACTIVE, this.code);
  },

  switch(code) {
    if (!registry()[code] || code === this.code) return;
    this.code = code;
    localStorage.setItem(LS_ACTIVE, code);
    Store.load(code);
    App.applyChrome();
    App.refreshAll();
    Review.start();
    Toast.show(`Switched to ${this.pack().name}`);
  },
};

/* ---------------------------------------------------------
   2. Card factory + starter deck (from active pack)
   --------------------------------------------------------- */
function newCard(fields) {
  return Object.assign({
    id: uid(),
    word: "", article: "", gender: "", pos: "Noun", level: "A1",
    ipa: "", meaning: "", sentence: "", translation: "", notes: "", inflection: "",
    extraExamples: [],   // [{ sentence, translation }] — extra variations
    interval: 0, repetition: 0, easeFactor: 2.5,
    nextReviewDate: new Date(0).toISOString(),
    lastReview: null, reviews: 0, lapses: 0,
    created: nowISO(),
  }, fields);
}

function buildStarterDeck() {
  const pack = Lang.pack();
  if (!pack) return [];
  return pack.deck.map((r, i) => {
    const [article, g] = r[1] ? r[1].split("|") : ["", ""];
    return newCard({
      id: pack.code + "-s" + i,
      word: r[0], article, gender: g,
      pos: r[2], level: r[3], ipa: r[4],
      meaning: r[5], sentence: r[6], translation: r[7], notes: r[8],
      inflection: r[9] || "",
    });
  });
}

function uid() { return "c" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
function nowISO() { return new Date().toISOString(); }
function todayKey(d = new Date()) { return d.toISOString().slice(0, 10); }

/* ---------------------------------------------------------
   3. Store — per-language localStorage persistence
   --------------------------------------------------------- */
const Store = {
  state: null, lang: "fr",
  key(code) { return LS_PREFIX + (code || this.lang); },

  load(code) {
    this.lang = code || Lang.code;
    try {
      const raw = localStorage.getItem(this.key());
      if (raw) { this.state = JSON.parse(raw); this._migrate(); return; }
    } catch (e) { console.warn("Load failed", e); }
    this.state = this._fresh();
    this.save();
  },
  _fresh() {
    return {
      lang: this.lang,
      cards: buildStarterDeck(),
      history: {}, log: [],
      settings: { voiceURI: "", slowAudio: false, autoPlay: true, cloze: true, newPerDay: 15, level: "A1" },
      meta: { created: nowISO() },
    };
  },
  _migrate() {
    const s = this.state;
    s.cards = s.cards || [];
    s.history = s.history || {};
    s.log = s.log || [];
    s.settings = Object.assign(
      { voiceURI: "", slowAudio: false, autoPlay: true, cloze: true, newPerDay: 15, level: "A1" },
      s.settings || {}
    );
    s.meta = s.meta || { created: nowISO() };
    s.cards.forEach(c => {
      if (c.inflection === undefined) c.inflection = "";
      if (!Array.isArray(c.extraExamples)) c.extraExamples = [];
    });
  },
  save() {
    try { localStorage.setItem(this.key(), JSON.stringify(this.state)); }
    catch (e) { Toast.show("⚠ Could not save (storage full?)"); }
  },
  get cards() { return this.state.cards; },
  get settings() { return this.state.settings; },
};

/* ---------------------------------------------------------
   4. SRS — SM-2 algorithm
   --------------------------------------------------------- */
const SRS = {
  preview(card) {
    return {
      [RATING.AGAIN]: this._project(card, RATING.AGAIN).label,
      [RATING.HARD]:  this._project(card, RATING.HARD).label,
      [RATING.GOOD]:  this._project(card, RATING.GOOD).label,
      [RATING.EASY]:  this._project(card, RATING.EASY).label,
    };
  },
  _project(card, rating) {
    let { interval, repetition, easeFactor } = card;
    if (rating === RATING.AGAIN) {
      return { interval: 0, repetition: 0, easeFactor, minutes: 10, label: "<10m" };
    }
    const q = rating + 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    repetition += 1;
    if (repetition === 1) interval = rating === RATING.EASY ? 4 : 1;
    else if (repetition === 2) interval = rating === RATING.EASY ? 6 : (rating === RATING.HARD ? 3 : 6);
    else {
      const mult = rating === RATING.HARD ? 1.2 : (rating === RATING.EASY ? easeFactor * 1.3 : easeFactor);
      interval = Math.round(Math.max(1, card.interval) * mult);
    }
    return { interval, repetition, easeFactor, minutes: null, label: fmtInterval(interval) };
  },
  apply(card, rating) {
    const p = this._project(card, rating);
    card.easeFactor = p.easeFactor;
    card.repetition = p.repetition;
    card.interval = p.interval;
    const next = new Date();
    if (p.minutes) next.setMinutes(next.getMinutes() + p.minutes);
    else next.setDate(next.getDate() + p.interval);
    card.nextReviewDate = next.toISOString();
    card.lastReview = nowISO();
    card.reviews += 1;
    if (rating === RATING.AGAIN) card.lapses += 1;
  },
  stage(card) {
    if (card.reviews === 0) return "new";
    if (card.repetition === 0 || card.interval < 1) return "learning";
    if (card.interval >= 21 && card.repetition >= 3) return "mastered";
    return "review";
  },
  isDue(card, at = new Date()) { return new Date(card.nextReviewDate) <= at; },
};

function fmtInterval(days) {
  if (days < 1) return "<10m";
  if (days === 1) return "1d";
  if (days < 30) return days + "d";
  if (days < 365) return Math.round(days / 30) + "mo";
  return (days / 365).toFixed(1) + "y";
}

/* ---------------------------------------------------------
   4b. Levels — CEFR content progression (A1 → C1)
   New words are introduced only from the current level and below.
   The next level auto-unlocks once ~80% of the current level is
   learned; the user can also switch level manually.
   --------------------------------------------------------- */
const CEFR = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_THRESHOLD = 0.8;   // fraction of a level "learned" to auto-advance

const Levels = {
  rank(l) { return CEFR.indexOf(l); },
  current() { return Store.settings.level || "A1"; },
  set(level) { Store.settings.level = level; Store.save(); },

  // Distinct CEFR levels that actually exist in this deck, in order.
  present() {
    const have = new Set(Store.cards.map(c => c.level));
    return CEFR.filter(l => have.has(l));
  },
  next() {
    const pres = this.present();
    const i = pres.indexOf(this.current());
    return (i >= 0 && i < pres.length - 1) ? pres[i + 1] : null;
  },
  // A card counts as "learned" for progression once it's past the initial
  // learning phase (successfully recalled and scheduled out).
  isLearned(c) { const s = SRS.stage(c); return s === "review" || s === "mastered"; },
  levelCards(level = this.current()) { return Store.cards.filter(c => c.level === level); },
  progress(level = this.current()) {
    const cards = this.levelCards(level);
    const learned = cards.filter(c => this.isLearned(c)).length;
    return { learned, total: cards.length, pct: cards.length ? learned / cards.length : 0 };
  },
  isCurrentComplete() { const p = this.progress(); return p.total > 0 && p.pct >= LEVEL_THRESHOLD; },

  // New cards eligible to be introduced: current level and anything below.
  unlockedNew() {
    const r = this.rank(this.current());
    return Store.cards.filter(c => c.reviews === 0 && this.rank(c.level) <= r);
  },
  // Auto-advance one level if the current one is sufficiently learned.
  // Returns the newly-unlocked level, or null.
  maybeAutoLevelUp() {
    if (!this.isCurrentComplete()) return null;
    const nx = this.next();
    if (nx) { this.set(nx); return nx; }
    return null;
  },
};

/* ---------------------------------------------------------
   5. Audio — speechSynthesis, per-language voice
   --------------------------------------------------------- */
const Audio = {
  all: [],
  init() {
    if (!("speechSynthesis" in window)) return;
    const load = () => { this.all = speechSynthesis.getVoices(); Settings.populateVoices(); };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  voices() {
    const re = (Lang.pack() && Lang.pack().voiceMatch) || /.*/;
    return this.all.filter(v => re.test(v.lang));
  },
  currentVoice() {
    const uri = Store.settings.voiceURI;
    const list = this.voices();
    return list.find(v => v.voiceURI === uri) || list[0] || null;
  },
  speak(text, { slow = false } = {}) {
    if (!("speechSynthesis" in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (Lang.pack() && Lang.pack().voiceLang) || "fr-FR";
    const v = this.currentVoice();
    if (v) u.voice = v;
    u.rate = (slow || Store.settings.slowAudio) ? 0.75 : 1;
    speechSynthesis.speak(u);
  },
};

/* ---------------------------------------------------------
   6. Target-word matching (cloze / highlight)
   --------------------------------------------------------- */
function articleHtml(c) {
  if (!c.article) return "";
  const sep = c.article.endsWith("'") ? "" : " ";
  return `<span class="article">${escapeHtml(c.article)}${sep}</span>`;
}

// Locate the target's surface form via the shared matcher (js/match.js),
// passing the active pack so its stemmer is used.
function locateTarget(c) {
  return window.LeTrainer.match.locateTarget(c, Lang.pack());
}
function clozeSentence(c) {
  const hit = locateTarget(c);
  if (!hit) return escapeHtml(c.sentence);
  return escapeHtml(c.sentence.slice(0, hit.start))
    + `<span class="cloze">[…]</span>`
    + escapeHtml(c.sentence.slice(hit.end));
}
const LETTER = window.LeTrainer.match.LETTER;

// All example variations for a card: primary sentence first, then extras.
function cardExamples(c) {
  const list = [{ sentence: c.sentence, translation: c.translation }];
  (c.extraExamples || []).forEach(e => { if (e && e.sentence) list.push({ sentence: e.sentence, translation: e.translation || "" }); });
  return list.filter(e => e.sentence);
}

// Render a sentence with the target highlighted and (optionally) other words
// tappable for word-mining. Mining is offered only for space-delimited scripts.
function renderSentenceTokens(sentenceStr, card, mineable) {
  const probe = { word: card.word, inflection: card.inflection, sentence: sentenceStr };
  const hit = locateTarget(probe);
  const canMine = mineable && /\s/.test(sentenceStr);
  const seg = (t) => canMine ? mineTokens(t) : escapeHtml(t);
  if (!hit) return seg(sentenceStr);
  return seg(sentenceStr.slice(0, hit.start))
    + `<span class="highlight-word">${escapeHtml(sentenceStr.slice(hit.start, hit.end))}</span>`
    + seg(sentenceStr.slice(hit.end));
}

// Wrap word runs (2+ letters) in tappable "mine" spans; escape everything else.
function mineTokens(text) {
  const re = new RegExp("[" + LETTER + "]{2,}", "gi");
  let out = "", last = 0, m;
  while ((m = re.exec(text))) {
    out += escapeHtml(text.slice(last, m.index));
    const w = m[0];
    out += `<span class="mine" data-w="${escapeHtml(w)}" title="Add “${escapeHtml(w)}” to your deck">${escapeHtml(w)}</span>`;
    last = m.index + w.length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function sentenceHintSuffix(canMine) {
  return canMine ? ` — tap a word to add it` : "";
}

// When the sentence uses a different form from the headword (a conjugated verb,
// a plural, etc.), show the dictionary form → form-used-here mapping.
function formLine(c, sentenceStr) {
  if (!c.word) return "";
  const hit = window.LeTrainer.match.locateTarget({ word: c.word, inflection: c.inflection, sentence: sentenceStr }, Lang.pack());
  if (!hit) return "";
  const surface = sentenceStr.slice(hit.start, hit.end);
  if (surface.toLowerCase() === c.word.toLowerCase()) return "";   // same form — nothing to explain
  return `<div class="form-line"><b>${escapeHtml(c.word)}</b> → <span class="form-here">${escapeHtml(surface)}</span> <span class="form-note">form used here</span></div>`;
}

/* ---------------------------------------------------------
   7. Review controller
   --------------------------------------------------------- */
const LEVEL_TIP = "Difficulty (CEFR): A1 easiest / beginner → C1 advanced";
const IPA_TIP = "Pronunciation (IPA)";

const Review = {
  queue: [], current: null, flipped: false, mode: "test",
  exampleIdx: 0, shownSentence: null, shownTranslation: "",

  // Sentence to speak: the currently-shown example (back), else the primary.
  playText() {
    return this.shownSentence || (this.current && (this.current.sentence || this.current.word)) || "";
  },

  buildQueue() {
    const now = new Date();
    const due = Store.cards.filter(c => c.reviews > 0 && SRS.isDue(c, now));
    due.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
    const introducedToday = Store.state.log.filter(l => l.date === todayKey() && l.isNew).length;
    const budget = Math.max(0, (Store.settings.newPerDay || 0) - introducedToday);
    const fresh = Levels.unlockedNew().slice(0, budget);   // only unlocked levels
    this.queue = [...due, ...fresh];
  },
  start() { this.buildQueue(); this.next(); },
  next() {
    this.flipped = false;
    this.exampleIdx = 0;
    this.shownSentence = null;
    this.current = this.queue.shift() || null;
    if (!this.current) { this.renderDone(); }
    else if (this.current.reviews === 0) { this.mode = "learn"; this.renderLearn(); }
    else { this.mode = "test"; this.render(); }
    App.updateCounts();
  },
  // Study a specific card next, re-queuing the current one (used by word-mining).
  injectNext(card) {
    if (this.current && this.current.id !== card.id) this.queue.unshift(this.current);
    this.queue = this.queue.filter(c => c.id !== card.id);
    this.queue.unshift(card);
    this.next();
  },
  // Cycle to the next stored example variation and re-render just that block.
  cycleExample() {
    const list = cardExamples(this.current);
    if (list.length < 2) return;
    this.exampleIdx = (this.exampleIdx + 1) % list.length;
    const block = document.getElementById("exampleBlock");
    if (block) block.outerHTML = this.exampleHtml(this.current);
    if (Store.settings.autoPlay) Audio.speak(this.playText());
  },
  // The example block (target highlighted, words mineable, cycle button).
  exampleHtml(c) {
    const list = cardExamples(c);
    const idx = this.exampleIdx % list.length;
    const ex = list[idx];
    this.shownSentence = ex.sentence;
    this.shownTranslation = ex.translation || "";
    const canMine = /\s/.test(ex.sentence);
    const more = list.length > 1
      ? `<button class="btn example-cycle" data-cycle="1">↻ Another example (${idx + 1}/${list.length})</button>`
      : "";
    return `
      <div class="back-block" id="exampleBlock">
        <span class="lbl">Example${sentenceHintSuffix(canMine)}</span>
        <div class="fr-line">${renderSentenceTokens(ex.sentence, c, true)}</div>
        ${ex.translation ? `<div class="en-line">${escapeHtml(ex.translation)}</div>` : ""}
        ${formLine(c, ex.sentence)}
        ${more}
      </div>`;
  },

  // Learn-first: a brand-new word is introduced, not tested. Everything is
  // shown up front so a beginner isn't guessing at a word they've never seen.
  renderLearn() {
    const c = this.current;
    const ui = Lang.pack().ui;
    const stage = document.getElementById("cardStage");
    document.getElementById("sessionDone").classList.add("hidden");
    stage.classList.remove("hidden");
    stage.innerHTML = `
      <div class="flashcard learn-card" id="flashcard">
        <div class="card-tags">
          <span class="learn-badge">New word</span>
          <span class="tag tag-level" title="${LEVEL_TIP}">${c.level}</span>
          <span class="tag">${c.pos}</span>
          ${c.gender ? `<span class="tag tag-gender">[${c.gender}]</span>` : ""}
        </div>
        <div class="card-front-word">${articleHtml(c)}${escapeHtml(c.word)}</div>
        ${c.ipa ? `<div class="card-ipa" title="${IPA_TIP}">${escapeHtml(c.ipa)}</div>` : ""}
        <div class="audio-row">
          <button class="audio-btn" data-act="play">${ui.listen}</button>
          <button class="audio-btn" data-act="slow">${ui.slow}</button>
        </div>
        <div class="learn-meaning">= ${escapeHtml(c.meaning)}</div>
        ${this.exampleHtml(c)}
        ${c.notes ? `<div class="back-block"><span class="lbl">Notes</span>${escapeHtml(c.notes)}</div>` : ""}
        <div class="learn-actions">
          <button class="btn btn-accent learn-next" data-learn="${RATING.GOOD}">Got it — next →</button>
          <button class="btn learn-known" data-learn="${RATING.EASY}">I already knew this</button>
        </div>
        <div class="tap-hint">A new word — just learn it now. We'll quiz you on it in a later session.</div>
      </div>`;
    if (Store.settings.autoPlay) Audio.speak(this.playText());
    const card = document.getElementById("flashcard");
    card.querySelectorAll(".audio-btn").forEach(b => b.addEventListener("click", (e) => {
      e.stopPropagation();
      Audio.speak(this.playText(), { slow: b.dataset.act === "slow" });
    }));
    card.querySelectorAll("[data-learn]").forEach(b =>
      b.addEventListener("click", () => this.commit(parseInt(b.dataset.learn, 10), true)));
  },

  render() {
    const c = this.current;
    const ui = Lang.pack().ui;
    const stage = document.getElementById("cardStage");
    document.getElementById("sessionDone").classList.add("hidden");
    stage.classList.remove("hidden");

    const useCloze = Store.settings.cloze && !!locateTarget(c);
    const frontSentence = useCloze ? `<div class="card-sentence">${clozeSentence(c)}</div>` : "";
    const frontWord = useCloze ? "" :
      `<div class="card-front-word">${articleHtml(c)}${escapeHtml(c.word)}</div>`;

    stage.innerHTML = `
      <div class="flashcard" id="flashcard">
        <div class="card-tags">
          <span class="tag tag-level" title="${LEVEL_TIP}">${c.level}</span>
          <span class="tag">${c.pos}</span>
          ${c.gender ? `<span class="tag tag-gender">[${c.gender}]</span>` : ""}
        </div>
        ${frontWord}
        ${frontSentence}
        <div class="audio-row">
          <button class="audio-btn" data-act="play">${ui.listen}</button>
          <button class="audio-btn" data-act="slow">${ui.slow}</button>
        </div>
        <div id="cardBack"></div>
        <div class="tap-hint" id="tapHint">Tap card or press Space to flip</div>
      </div>`;

    if (Store.settings.autoPlay) Audio.speak(this.playText());
    this._bindCard();
  },
  _bindCard() {
    document.getElementById("flashcard").addEventListener("click", (e) => {
      const act = e.target.dataset.act;
      if (act === "play") { e.stopPropagation(); Audio.speak(this.playText()); return; }
      if (act === "slow") { e.stopPropagation(); Audio.speak(this.playText(), { slow: true }); return; }
      if (e.target.closest(".rate-row") || e.target.closest(".mine") || e.target.closest("[data-cycle]")) return;
      if (!this.flipped) this.flip();
    });
  },
  flip() {
    if (!this.current || this.mode !== "test" || this.flipped) return;
    this.flipped = true;
    const c = this.current;
    const p = SRS.preview(c);
    const hint = document.getElementById("tapHint");
    if (hint) hint.remove();
    document.getElementById("cardBack").innerHTML = `
      <div class="divider"></div>
      <div class="card-back">
        <div class="back-meaning">${escapeHtml(c.meaning)}</div>
        ${c.ipa ? `<div class="card-ipa" title="${IPA_TIP}">${escapeHtml(c.ipa)}</div>` : ""}
        ${this.exampleHtml(c)}
        ${c.notes ? `<div class="back-block"><span class="lbl">Notes</span>${escapeHtml(c.notes)}</div>` : ""}
        <div class="rate-row">
          ${rateBtn(RATING.AGAIN, "Again", "1", p[RATING.AGAIN], "rate-again", "no idea")}
          ${rateBtn(RATING.HARD, "Hard", "2", p[RATING.HARD], "rate-hard", "tough")}
          ${rateBtn(RATING.GOOD, "Good", "3", p[RATING.GOOD], "rate-good", "got it")}
          ${rateBtn(RATING.EASY, "Easy", "4", p[RATING.EASY], "rate-easy", "too easy")}
        </div>
      </div>`;
    document.querySelectorAll(".rate-btn").forEach(b => {
      b.addEventListener("click", (e) => { e.stopPropagation(); this.rate(parseInt(b.dataset.rating, 10)); });
    });
  },
  rate(rating) {
    if (!this.current || this.mode !== "test" || !this.flipped) return;
    this.commit(rating, false);
  },
  // Shared scheduling path for both the learn card and a rated review.
  commit(rating, wasLearn) {
    if (!this.current) return;
    const c = this.current;
    const wasNew = c.reviews === 0;
    SRS.apply(c, rating);
    const k = todayKey();
    Store.state.history[k] = (Store.state.history[k] || 0) + 1;
    Store.state.log.push({ date: k, correct: rating >= RATING.GOOD, isNew: wasNew });
    Store.save();
    const leveled = Levels.maybeAutoLevelUp();   // auto-unlock next level if earned
    this.next();
    if (leveled) Toast.show(`🎉 Level up! ${leveled} words unlocked`);
    else if (wasLearn) Toast.show("Learned ✓ — you'll be quizzed next time");
    else Toast.flashInterval(fmtInterval(c.interval), rating);
  },
  // Manual "study more" — pull in remaining new cards (within unlocked levels)
  // even past the daily cap, plus anything now due. Feedback if nothing's left.
  studyMore() {
    const now = new Date();
    const due = Store.cards.filter(c => c.reviews > 0 && SRS.isDue(c, now))
      .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
    this.queue = [...due, ...Levels.unlockedNew()];
    if (!this.queue.length) { Toast.show("All caught up — nothing left to study right now"); return; }
    this.next();
  },
  // The done-screen button: study remaining new, or unlock/jump to next level.
  doneAction() {
    if (Levels.unlockedNew().length === 0 && Levels.next()) {
      const nx = Levels.next();
      Levels.set(nx);
      Toast.show(`${nx} unlocked — new words added 🎉`);
    }
    this.studyMore();
  },
  renderDone() {
    document.getElementById("cardStage").classList.add("hidden");
    document.getElementById("sessionDone").classList.remove("hidden");
    const now = new Date();
    const remainingNew = Levels.unlockedNew().length;
    const dueLater = Store.cards.filter(c => c.reviews > 0 && !SRS.isDue(c, now)).length;
    const btn = document.getElementById("studyAgainBtn");
    const sub = document.getElementById("doneSub");
    const cur = Levels.current(), nx = Levels.next(), prog = Levels.progress();
    if (remainingNew > 0) {
      btn.classList.remove("hidden");
      btn.textContent = `Study ${remainingNew} more new word${remainingNew === 1 ? "" : "s"} →`;
      sub.textContent = `Nice work! ${remainingNew} more ${cur} word${remainingNew === 1 ? "" : "s"} ready whenever you are.`;
    } else if (nx) {
      btn.classList.remove("hidden");
      if (Levels.isCurrentComplete()) {
        btn.textContent = `🎉 Unlock ${nx} →`;
        sub.textContent = `You've learned your ${cur} words — time for ${nx}!`;
      } else {
        btn.textContent = `Jump ahead to ${nx} →`;
        sub.textContent = `You've met every ${cur} word (${prog.learned}/${prog.total} learned). Keep reviewing to master them — or jump ahead to ${nx}.`;
      }
    } else {
      btn.classList.add("hidden");
      sub.textContent = dueLater
        ? `You've reached the top level (${cur}) and learned every word. Come back as reviews come due.`
        : "You're all caught up. 🎉 Come back later or add your own words with + Add.";
    }
  },
};

function rateBtn(rating, label, key, interval, cls, hint) {
  return `<button class="rate-btn ${cls}" data-rating="${rating}">
    <span class="rate-label">${label}</span>
    <span class="rate-hint">${hint}</span>
    <span class="rate-int">${interval}</span>
    <span class="rate-key">[${key}]</span>
  </button>`;
}

/* ---------------------------------------------------------
   8. Deck Manager
   --------------------------------------------------------- */
const DeckManager = {
  render() {
    const q = document.getElementById("deckSearch").value.trim().toLowerCase();
    const lvl = document.getElementById("filterLevel").value;
    const st = document.getElementById("filterState").value;
    const rows = Store.cards.filter(c => {
      if (lvl && c.level !== lvl) return false;
      if (st && SRS.stage(c) !== st) return false;
      if (q) {
        const hay = (c.word + " " + c.meaning + " " + c.sentence).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const body = document.getElementById("deckBody");
    document.getElementById("deckCount").textContent = `${rows.length} / ${Store.cards.length} cards`;
    if (!rows.length) {
      body.innerHTML = `<tr class="empty-row"><td colspan="7">No cards match your filters.</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(c => {
      const stage = SRS.stage(c);
      const due = c.reviews === 0 ? "—" : shortDate(c.nextReviewDate);
      return `<tr data-id="${c.id}">
        <td class="word-cell">${articleHtml(c)}${escapeHtml(c.word)}
          ${c.gender ? `<small style="color:var(--muted)"> [${c.gender}]</small>` : ""}</td>
        <td>${escapeHtml(c.meaning)}</td>
        <td>${c.pos}</td>
        <td><span class="level-badge">${c.level}</span></td>
        <td><span class="state-badge state-${stage}">${cap(stage)}</span></td>
        <td>${due}</td>
        <td><div class="row-actions">
          <button class="icon-btn" data-edit="${c.id}" title="Edit">✎</button>
          <button class="icon-btn" data-del="${c.id}" title="Delete">🗑</button>
        </div></td>
      </tr>`;
    }).join("");
    body.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => Modal.openEdit(b.dataset.edit)));
    body.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => DeckManager.remove(b.dataset.del)));
  },
  remove(id) {
    const c = Store.cards.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`Delete "${c.word}"? This cannot be undone.`)) return;
    Store.state.cards = Store.cards.filter(x => x.id !== id);
    Store.save(); this.render(); App.updateCounts();
    Toast.show("Card deleted");
  },
};

/* ---------------------------------------------------------
   9. Stats
   --------------------------------------------------------- */
const Stats = {
  render() {
    const cards = Store.cards;
    const k = todayKey();
    document.getElementById("statToday").textContent = Store.state.history[k] || 0;
    document.getElementById("statTotal").textContent = cards.length;
    document.getElementById("statStreak").textContent = this.streak();
    const log = Store.state.log;
    const ret = log.length ? Math.round(100 * log.filter(l => l.correct).length / log.length) : null;
    document.getElementById("statRetention").textContent = ret === null ? "—" : ret + "%";

    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    cards.forEach(c => counts[SRS.stage(c)]++);
    const total = cards.length || 1;
    document.getElementById("breakdownBar").innerHTML = ["new","learning","review","mastered"].map(s =>
      `<div class="bd-${s}" style="width:${100*counts[s]/total}%" title="${cap(s)}: ${counts[s]}"></div>`
    ).join("");
    this.renderLevel();
    this.renderHeatmap();
  },
  renderLevel() {
    const el = document.getElementById("levelPanel");
    if (!el) return;
    const cur = Levels.current(), nx = Levels.next(), p = Levels.progress();
    const pct = Math.round(p.pct * 100);
    const need = Math.max(0, Math.ceil(LEVEL_THRESHOLD * p.total) - p.learned);
    let msg;
    if (!nx) msg = `You're at the top level available in this deck (<b>${cur}</b>).`;
    else if (p.pct >= LEVEL_THRESHOLD) msg = `You're ready for <b>${nx}</b> — it unlocks automatically, or switch now in Settings.`;
    else msg = `Learn ${need} more <b>${cur}</b> word${need === 1 ? "" : "s"} to unlock <b>${nx}</b>.`;
    el.innerHTML = `
      <div class="level-row">
        <span class="level-now">${cur}</span>
        <div class="level-bar"><div style="width:${pct}%"></div></div>
        <span class="level-frac">${p.learned}/${p.total} learned</span>
      </div>
      <p class="muted">${msg}</p>`;
  },
  streak() {
    const hist = Store.state.history;
    let streak = 0, d = new Date();
    if (!hist[todayKey(d)]) d.setDate(d.getDate() - 1);
    while (hist[todayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  },
  renderHeatmap() {
    const hm = document.getElementById("heatmap");
    const cells = 20 * 7, today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - (cells - 1));
    let html = "";
    for (let i = 0; i < cells; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const count = Store.state.history[todayKey(d)] || 0;
      const lvl = count === 0 ? 0 : count < 5 ? 1 : count < 12 ? 2 : count < 25 ? 3 : 4;
      html += `<div class="hm-cell ${lvl ? "hm-" + lvl : ""}" title="${todayKey(d)}: ${count} reviews"></div>`;
    }
    hm.innerHTML = html;
  },
};

/* ---------------------------------------------------------
   10. Settings
   --------------------------------------------------------- */
const Settings = {
  bind() {
    const $ = id => document.getElementById(id);
    this.syncControls();
    $("slowAudio").addEventListener("change", e => { Store.settings.slowAudio = e.target.checked; Store.save(); });
    $("autoPlay").addEventListener("change", e => { Store.settings.autoPlay = e.target.checked; Store.save(); });
    $("clozeMode").addEventListener("change", e => { Store.settings.cloze = e.target.checked; Store.save(); });
    $("newPerDay").addEventListener("change", e => { Store.settings.newPerDay = clampInt(e.target.value, 0, 100); Store.save(); });
    $("levelSelect").addEventListener("change", e => {
      Levels.set(e.target.value); App.refreshAll(); Toast.show(`Level set to ${e.target.value}`);
    });
    $("voiceSelect").addEventListener("change", e => { Store.settings.voiceURI = e.target.value; Store.save(); });
    $("testVoice").addEventListener("click", () => Audio.speak(Lang.pack().ui.testPhrase));
    $("exportBtn").addEventListener("click", () => Data.export());
    $("importBtn").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", e => Data.import(e.target.files[0]));
    $("resetBtn").addEventListener("click", () => Data.reset());
    this.updateStorageInfo();
  },
  syncControls() {
    const s = Store.settings;
    document.getElementById("slowAudio").checked = s.slowAudio;
    document.getElementById("autoPlay").checked = s.autoPlay;
    document.getElementById("clozeMode").checked = s.cloze;
    document.getElementById("newPerDay").value = s.newPerDay;
    this.populateLevel();
  },
  populateLevel() {
    const sel = document.getElementById("levelSelect");
    if (!sel) return;
    sel.innerHTML = Levels.present().map(l =>
      `<option value="${l}" ${l === Levels.current() ? "selected" : ""}>${l}</option>`
    ).join("");
  },
  populateVoices() {
    const sel = document.getElementById("voiceSelect");
    if (!sel) return;
    const list = Audio.voices();
    if (!list.length) {
      sel.innerHTML = `<option value="">No ${Lang.pack().name} voice installed</option>`;
      return;
    }
    sel.innerHTML = list.map(v =>
      `<option value="${v.voiceURI}" ${v.voiceURI === Store.settings.voiceURI ? "selected" : ""}>${v.name} (${v.lang})</option>`
    ).join("");
  },
  updateStorageInfo() {
    const bytes = new Blob([localStorage.getItem(Store.key()) || ""]).size;
    document.getElementById("storageInfo").textContent =
      `${Store.cards.length} cards · ${(bytes/1024).toFixed(1)} KB stored locally for ${Lang.pack().name} · nothing leaves your browser.`;
  },
};

/* ---------------------------------------------------------
   11. Data — import / export / reset (per language)
   --------------------------------------------------------- */
const Data = {
  export() {
    const blob = new Blob([JSON.stringify(Store.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `le-trainer-${Lang.code}-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    Toast.show("Deck exported ⬇");
  },
  import(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.cards || !Array.isArray(data.cards)) throw new Error("no cards array");
        data.cards = data.cards.map(c => Object.assign(newCard({}), c));
        Store.state = data;
        Store._migrate();
        Store.save();
        App.refreshAll();
        Toast.show(`Imported ${data.cards.length} cards ✓`);
      } catch (e) { Toast.show("⚠ Invalid JSON file"); }
    };
    reader.readAsText(file);
  },
  reset() {
    if (!confirm(`Reset ${Lang.pack().name} to the starter deck? Your custom cards and history for this language will be lost.`)) return;
    Store.state = Store._fresh();
    Store.save();
    App.refreshAll();
    Toast.show("Reset to starter deck");
  },
};

/* ---------------------------------------------------------
   12. Modal (add / edit)
   --------------------------------------------------------- */
const Modal = {
  el: null, studyNow: false,
  bind() {
    this.el = document.getElementById("modal");
    document.getElementById("quickAddBtn").addEventListener("click", () => this.openAdd());
    document.getElementById("modalClose").addEventListener("click", () => this.close());
    document.getElementById("cancelForm").addEventListener("click", () => this.close());
    document.getElementById("addExample").addEventListener("click", () => this.addExampleRow());
    document.getElementById("saveStudy").addEventListener("click", () => {
      this.studyNow = true;
      document.getElementById("cardForm").requestSubmit();   // runs validation → save()
    });
    this.el.addEventListener("click", e => { if (e.target === this.el) this.close(); });
    document.getElementById("cardForm").addEventListener("submit", e => { e.preventDefault(); this.save(); });
  },
  // Rebuild the article/gender <select> for the active language.
  populateGenders() {
    const sel = document.getElementById("f_gender");
    sel.innerHTML = Lang.pack().genders.map(g => `<option value="${g.v}">${g.t}</option>`).join("");
  },
  note(msg) { document.getElementById("modalNote").textContent = msg || ""; },
  clearExamples() { document.getElementById("extraExamples").innerHTML = ""; },
  addExampleRow(sentence = "", translation = "") {
    const row = document.createElement("div");
    row.className = "ex-row";
    row.innerHTML = `
      <input class="input ex-sent" placeholder="Another example sentence" />
      <input class="input ex-tr" placeholder="Its translation (optional)" />
      <button type="button" class="icon-btn ex-del" title="Remove">✕</button>`;
    row.querySelector(".ex-sent").value = sentence;
    row.querySelector(".ex-tr").value = translation;
    row.querySelector(".ex-del").addEventListener("click", () => row.remove());
    document.getElementById("extraExamples").appendChild(row);
    return row;
  },
  collectExamples() {
    return [...document.querySelectorAll("#extraExamples .ex-row")]
      .map(r => ({ sentence: r.querySelector(".ex-sent").value.trim(), translation: r.querySelector(".ex-tr").value.trim() }))
      .filter(e => e.sentence);
  },

  openAdd() {
    document.getElementById("modalTitle").textContent = `Add a ${Lang.pack().name} card`;
    document.getElementById("cardForm").reset();
    document.getElementById("f_id").value = "";
    this.clearExamples();
    this.note("");
    this.studyNow = false;
    this.el.classList.remove("hidden");
    document.getElementById("f_word").focus();
  },
  openEdit(id) {
    const c = Store.cards.find(x => x.id === id);
    if (!c) return;
    document.getElementById("cardForm").reset();
    document.getElementById("modalTitle").textContent = "Edit card";
    const g = c.article ? `${c.article}|${c.gender}` : "";
    setVal("f_id", c.id); setVal("f_word", c.word); setVal("f_gender", g);
    setVal("f_pos", c.pos); setVal("f_level", c.level); setVal("f_ipa", c.ipa);
    setVal("f_meaning", c.meaning); setVal("f_sentence", c.sentence);
    setVal("f_translation", c.translation); setVal("f_notes", c.notes);
    setVal("f_inflection", c.inflection);
    this.clearExamples();
    (c.extraExamples || []).forEach(e => this.addExampleRow(e.sentence, e.translation || ""));
    this.note("");
    this.studyNow = false;
    this.el.classList.remove("hidden");
  },
  // Word-mining entry point: capture a word tapped in a sentence.
  openMine(word, sentence, translation) {
    const w = (word || "").trim();
    if (!w) return;
    const existing = Store.cards.find(c => c.word.toLowerCase() === w.toLowerCase());
    if (existing) {
      this.openEdit(existing.id);
      document.getElementById("modalTitle").textContent = `Edit “${w}”`;
      const already = existing.sentence === sentence || (existing.extraExamples || []).some(e => e.sentence === sentence);
      if (sentence && !already) {
        this.addExampleRow(sentence, translation || "");
        this.note(`You already have “${w}” — added this sentence as another example. Save to keep it.`);
      } else {
        this.note(`You already have “${w}” in your deck.`);
      }
    } else {
      this.openAdd();
      document.getElementById("modalTitle").textContent = `Add “${w}”`;
      setVal("f_word", w);
      setVal("f_sentence", sentence || "");
      setVal("f_translation", translation || "");
      this.note("Mined from your sentence — just add the meaning and save.");
      document.getElementById("f_meaning").focus();
    }
  },
  save() {
    const id = getVal("f_id");
    const study = this.studyNow; this.studyNow = false;
    const [article, gender] = (getVal("f_gender") || "|").split("|");
    const fields = {
      word: getVal("f_word").trim(), article, gender,
      pos: getVal("f_pos"), level: getVal("f_level"),
      ipa: getVal("f_ipa").trim(), meaning: getVal("f_meaning").trim(),
      sentence: getVal("f_sentence").trim(), translation: getVal("f_translation").trim(),
      notes: getVal("f_notes").trim(), inflection: getVal("f_inflection").trim(),
      extraExamples: this.collectExamples(),
    };
    let card;
    if (id) { card = Store.cards.find(x => x.id === id); Object.assign(card, fields); Toast.show("Card updated ✓"); }
    else { card = newCard(fields); Store.cards.push(card); Toast.show("Card added ✓"); }
    Store.save();
    this.close();
    if (study) { App.updateCounts(); App.go("review"); Review.injectNext(card); }
    else { App.refreshAll(); }
  },
  close() { this.el.classList.add("hidden"); this.studyNow = false; },
};

/* ---------------------------------------------------------
   13. Toast
   --------------------------------------------------------- */
const Toast = {
  el: null, timer: null,
  show(msg) {
    this.el = this.el || document.getElementById("toast");
    this.el.textContent = msg;
    this.el.classList.remove("hidden");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.add("hidden"), 1800);
  },
  flashInterval(label, rating) {
    const names = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
    this.show(`${names[rating]} · next in ${label}`);
  },
};

/* ---------------------------------------------------------
   13b. Onboarding (first-run welcome) + Help overlay
   --------------------------------------------------------- */
const Onboarding = {
  KEY: "leTrainer.onboarded",
  maybeShow() {
    if (localStorage.getItem(this.KEY)) return;
    const sel = document.getElementById("welcomeLang");
    sel.innerHTML = Lang.all().map(p =>
      `<option value="${p.code}" ${p.code === Lang.code ? "selected" : ""}>${p.name}</option>`
    ).join("");
    document.getElementById("welcome").classList.remove("hidden");
    document.getElementById("welcomeStart").addEventListener("click", () => this.finish());
  },
  finish() {
    const code = document.getElementById("welcomeLang").value;
    localStorage.setItem(this.KEY, "1");
    document.getElementById("welcome").classList.add("hidden");
    if (code && code !== Lang.code) Lang.switch(code);   // Lang.switch restarts the session
    else Review.start();
  },
};

const Help = {
  bind() {
    document.getElementById("helpBtn").addEventListener("click", () => this.open());
    document.getElementById("helpClose").addEventListener("click", () => this.close());
    document.getElementById("help").addEventListener("click", e => { if (e.target.id === "help") this.close(); });
  },
  open() { document.getElementById("help").classList.remove("hidden"); },
  close() { document.getElementById("help").classList.add("hidden"); },
};

/* ---------------------------------------------------------
   14. App — router, chrome, keyboard, wiring
   --------------------------------------------------------- */
const App = {
  view: "review",
  init() {
    if (!Object.keys(registry()).length) {
      document.getElementById("cardStage").innerHTML = `<p class="muted">No language packs loaded.</p>`;
      return;
    }
    Lang.resolveInitial();
    Store.load(Lang.code);
    Audio.init();
    Modal.bind();
    Settings.bind();
    Help.bind();
    this.buildLangSwitcher();
    this.applyChrome();
    this.bindTabs();
    this.bindKeyboard();
    document.getElementById("deckSearch").addEventListener("input", () => DeckManager.render());
    document.getElementById("filterLevel").addEventListener("change", () => DeckManager.render());
    document.getElementById("filterState").addEventListener("change", () => DeckManager.render());
    document.getElementById("studyAgainBtn").addEventListener("click", () => Review.doneAction());
    // Delegated on the persistent card stage: word-mining + example cycling.
    document.getElementById("cardStage").addEventListener("click", e => {
      const mine = e.target.closest(".mine");
      if (mine) { e.stopPropagation(); Modal.openMine(mine.dataset.w, Review.shownSentence, Review.shownTranslation); return; }
      if (e.target.closest("[data-cycle]")) { e.stopPropagation(); Review.cycleExample(); }
    });
    Review.start();
    this.updateCounts();
    Onboarding.maybeShow();   // shows only on first ever visit
  },

  buildLangSwitcher() {
    const sel = document.getElementById("langSelect");
    sel.innerHTML = Lang.all().map(p =>
      `<option value="${p.code}" ${p.code === Lang.code ? "selected" : ""}>${p.name}</option>`
    ).join("");
    sel.addEventListener("change", e => Lang.switch(e.target.value));
  },

  // Apply language-specific chrome: flag, tagline, done text, labels, voices.
  applyChrome() {
    const pack = Lang.pack();
    const stripes = document.querySelectorAll(".flag i");
    pack.flag.forEach((col, i) => { if (stripes[i]) stripes[i].style.background = col; });
    document.querySelector(".tagline").textContent = pack.tagline;
    document.getElementById("doneTitle").textContent = pack.ui.doneTitle;
    document.getElementById("doneSub").textContent = pack.ui.doneSub;
    document.getElementById("langSelect").value = pack.code;
    // Labels that name the active language.
    document.getElementById("voiceLabel").textContent = `${pack.name} voice`;
    document.getElementById("wordLabel").textContent = `${pack.name} word / phrase`;
    document.getElementById("sentenceLabel").textContent = `Example sentence (${pack.name})`;
    Modal.populateGenders();
    Settings.populateVoices();
  },

  bindTabs() {
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => this.go(t.dataset.view)));
  },
  go(view) {
    this.view = view;
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.view === view));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
    document.getElementById("view-" + view).classList.add("is-active");
    if (view === "decks") DeckManager.render();
    if (view === "stats") Stats.render();
    if (view === "settings") Settings.updateStorageInfo();
    if (view === "review" && !Review.current) Review.start();
  },
  updateCounts() {
    const now = new Date(), cards = Store.cards;
    document.getElementById("cntNew").textContent = cards.filter(c => c.reviews === 0).length;
    document.getElementById("cntLearning").textContent = cards.filter(c => SRS.stage(c) === "learning").length;
    document.getElementById("cntDue").textContent = cards.filter(c => c.reviews > 0 && SRS.isDue(c, now)).length;
    const pill = document.getElementById("levelPill");
    if (pill) { const p = Levels.progress(); pill.innerHTML = `Lv ${Levels.current()} <span>${p.learned}/${p.total}</span>`; }
  },
  refreshAll() {
    Settings.populateVoices();
    Settings.syncControls();
    Settings.updateStorageInfo();
    this.updateCounts();
    if (this.view === "decks") DeckManager.render();
    if (this.view === "stats") Stats.render();
    if (this.view === "review") Review.start();
  },
  bindKeyboard() {
    const isOpen = id => !document.getElementById(id).classList.contains("hidden");
    document.addEventListener("keydown", e => {
      if (e.target.matches("input, textarea, select")) return;
      // Overlays capture keys first.
      if (isOpen("welcome")) return;                       // must choose a language to proceed
      if (isOpen("help")) { if (e.key === "Escape") Help.close(); return; }
      if (isOpen("modal")) { if (e.key === "Escape") Modal.close(); return; }

      if (this.view !== "review" || !Review.current) return;
      if (Review.mode === "learn") {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); Review.commit(RATING.GOOD, true); }
        else if (e.key === "r" || e.key === "R") { Audio.speak(Review.playText()); }
        return;
      }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); Review.flip(); }
      else if (e.key === "r" || e.key === "R") { Audio.speak(Review.playText()); }
      else if (["1","2","3","4"].includes(e.key) && Review.flipped) { Review.rate(parseInt(e.key, 10)); }
    });
  },
};

/* ---------------------------------------------------------
   15. Utilities
   --------------------------------------------------------- */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function setVal(id, v) { document.getElementById(id).value = v ?? ""; }
function getVal(id) { return document.getElementById(id).value; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function clampInt(v, lo, hi) { v = parseInt(v, 10) || 0; return Math.min(hi, Math.max(lo, v)); }
function shortDate(iso) {
  const d = new Date(iso), now = new Date();
  const days = Math.round((d - now) / DAY_MS);
  if (days <= 0) return "now";
  if (days === 1) return "tomorrow";
  if (days < 30) return days + "d";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

document.addEventListener("DOMContentLoaded", () => App.init());
})();
