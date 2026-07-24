/* =========================================================
   Le Trainer — French Vocabulary SRS
   Vanilla JS · localStorage · SM-2 · speechSynthesis
   Organised into modules: Store, SRS, Deck, Audio,
   Review, DeckManager, Stats, Settings, Modal, App
   ========================================================= */
(() => {
"use strict";

/* ---------------------------------------------------------
   0. Constants
   --------------------------------------------------------- */
const LS_KEY = "leTrainer.v1";
const DAY_MS = 86400000;
const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };

/* ---------------------------------------------------------
   1. Starter deck — 30 high-frequency words (A1–B1)
   article/gender encoded as "le|m" etc.
   --------------------------------------------------------- */
const STARTER = [
  ["eau","la|f","Noun","A1","/o/","water","Je bois de l'eau fraîche.","I drink fresh water.","partitive: de l'eau"],
  ["habiter","","Verb","A1","/a.bi.te/","to live (reside)","J'habite à Paris depuis deux ans.","I have lived in Paris for two years.","-er verb, regular"],
  ["toujours","","Adverb","A1","/tu.ʒuʁ/","always / still","Il arrive toujours en retard.","He always arrives late.","also means 'still'"],
  ["espoir","l'|m","Noun","B1","/ɛs.pwaʁ/","hope","Elle n'a pas perdu l'espoir.","She hasn't lost hope.","masc. despite l'"],
  ["devenir","","Verb","B1","/dəv.niʁ/","to become","Il veut devenir médecin.","He wants to become a doctor.","conjugates like 'venir', être in passé composé"],
  ["maison","la|f","Noun","A1","/mɛ.zɔ̃/","house / home","Nous rentrons à la maison.","We are going back home.","à la maison = home"],
  ["manger","","Verb","A1","/mɑ̃.ʒe/","to eat","Nous aimons manger ensemble.","We like to eat together.","nous mangeons (keep the e)"],
  ["beau","","Adjective","A1","/bo/","beautiful / handsome","Quel beau paysage !","What a beautiful landscape!","bel before vowel, belle f."],
  ["temps","le|m","Noun","A2","/tɑ̃/","time / weather","Je n'ai pas le temps aujourd'hui.","I don't have time today.","also 'weather'"],
  ["parler","","Verb","A1","/paʁ.le/","to speak / talk","Peux-tu parler plus lentement ?","Can you speak more slowly?","parler à qqn"],
  ["ami","l'|m","Noun","A1","/a.mi/","friend","C'est mon meilleur ami.","He is my best friend.","amie for female"],
  ["travail","le|m","Noun","A2","/tʁa.vaj/","work / job","Elle adore son travail.","She loves her job.","pl. travaux"],
  ["vouloir","","Verb","A2","/vu.lwaʁ/","to want","Je voudrais un café, s'il vous plaît.","I would like a coffee, please.","je voudrais = polite","voudrais"],
  ["ville","la|f","Noun","A1","/vil/","city / town","Lyon est une belle ville.","Lyon is a beautiful city.",""],
  ["penser","","Verb","A2","/pɑ̃.se/","to think","Je pense que tu as raison.","I think you are right.","penser à / penser que"],
  ["enfant","l'|m","Noun","A1","/ɑ̃.fɑ̃/","child","Les enfants jouent dans le parc.","The children play in the park.","same form m/f"],
  ["heureux","","Adjective","A2","/ø.ʁø/","happy","Je suis très heureux de te voir.","I am very happy to see you.","heureuse f."],
  ["comprendre","","Verb","A2","/kɔ̃.pʁɑ̃dʁ/","to understand","Je ne comprends pas la question.","I don't understand the question.","like 'prendre'"],
  ["jour","le|m","Noun","A1","/ʒuʁ/","day","Chaque jour est une nouvelle chance.","Every day is a new chance.","cf. journée"],
  ["aimer","","Verb","A1","/e.me/","to like / love","J'aime beaucoup la musique française.","I really like French music.","aimer bien = to like"],
  ["monde","le|m","Noun","A2","/mɔ̃d/","world / people","Il y a beaucoup de monde ici.","There are a lot of people here.","du monde = crowds"],
  ["chercher","","Verb","A2","/ʃɛʁ.ʃe/","to look for","Je cherche mes clés.","I'm looking for my keys.","no preposition needed"],
  ["vie","la|f","Noun","A2","/vi/","life","C'est la vie !","That's life!",""],
  ["souvent","","Adverb","A2","/su.vɑ̃/","often","On se voit souvent le week-end.","We see each other often on weekends.",""],
  ["connaître","","Verb","B1","/kɔ.nɛtʁ/","to know (be familiar)","Je connais bien ce quartier.","I know this neighbourhood well.","î before t; vs 'savoir'","connais"],
  ["voiture","la|f","Noun","A1","/vwa.tyʁ/","car","Ma voiture est en panne.","My car has broken down.","en panne = broken down"],
  ["nouveau","","Adjective","A2","/nu.vo/","new","Voici mon nouveau téléphone.","Here is my new phone.","nouvel before vowel, nouvelle f."],
  ["falloir","il|m","Verb","B1","/fa.lwaʁ/","to be necessary","Il faut partir maintenant.","We must leave now.","impersonal: il faut","faut"],
  ["cœur","le|m","Noun","B1","/kœʁ/","heart","Il a un grand cœur.","He has a big heart.","par cœur = by heart"],
  ["langue","la|f","Noun","A2","/lɑ̃ɡ/","language / tongue","Le français est une belle langue.","French is a beautiful language.","also means 'tongue'"],
];

function buildStarterDeck() {
  return STARTER.map((r, i) => {
    const [gender, g] = r[1] ? r[1].split("|") : ["", ""];
    return newCard({
      id: "s" + i,
      word: r[0], article: gender, gender: g,
      pos: r[2], level: r[3], ipa: r[4],
      meaning: r[5], sentence: r[6], translation: r[7], notes: r[8],
      inflection: r[9] || "",
    });
  });
}

/* ---------------------------------------------------------
   2. Card factory + SM-2 defaults
   --------------------------------------------------------- */
function newCard(fields) {
  return Object.assign({
    id: uid(),
    word: "", article: "", gender: "", pos: "Noun", level: "A1",
    ipa: "", meaning: "", sentence: "", translation: "", notes: "", inflection: "",
    // SRS state
    interval: 0, repetition: 0, easeFactor: 2.5,
    nextReviewDate: new Date(0).toISOString(),
    lastReview: null, reviews: 0, lapses: 0,
    created: nowISO(),
  }, fields);
}

function uid() {
  return "c" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}
function nowISO() { return new Date().toISOString(); }
function todayKey(d = new Date()) { return d.toISOString().slice(0, 10); }

/* ---------------------------------------------------------
   3. Store — localStorage persistence
   --------------------------------------------------------- */
const Store = {
  state: null,
  load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { this.state = JSON.parse(raw); this._migrate(); return; }
    } catch (e) { console.warn("Load failed", e); }
    this.state = this._fresh();
    this.save();
  },
  _fresh() {
    return {
      cards: buildStarterDeck(),
      history: {},          // { "YYYY-MM-DD": reviewCount }
      log: [],              // { date, correct } for retention
      settings: {
        voiceURI: "", slowAudio: false, autoPlay: true,
        cloze: true, newPerDay: 15,
      },
      meta: { created: nowISO() },
    };
  },
  _migrate() {
    const s = this.state;
    s.cards = s.cards || [];
    s.history = s.history || {};
    s.log = s.log || [];
    s.settings = Object.assign(
      { voiceURI: "", slowAudio: false, autoPlay: true, cloze: true, newPerDay: 15 },
      s.settings || {}
    );
    s.meta = s.meta || { created: nowISO() };
  },
  save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.state)); }
    catch (e) { Toast.show("⚠ Could not save (storage full?)"); }
  },
  get cards() { return this.state.cards; },
  get settings() { return this.state.settings; },
};

/* ---------------------------------------------------------
   4. SRS — SM-2 algorithm
   --------------------------------------------------------- */
const SRS = {
  // Return preview intervals (in ms/label) for the 4 buttons without mutating.
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
      repetition = 0;
      interval = 0;              // relearn — under 10 minutes
      return { interval, repetition, easeFactor, minutes: 10, label: "<10m" };
    }
    // Update ease factor (SM-2 quality mapping: 2→3, 3→4, 4→5)
    const q = rating + 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    repetition += 1;
    if (repetition === 1) interval = rating === RATING.EASY ? 4 : 1;
    else if (repetition === 2) interval = rating === RATING.EASY ? 6 : (rating === RATING.HARD ? 3 : 6);
    else {
      const mult = rating === RATING.HARD ? 1.2 : (rating === RATING.EASY ? easeFactor * 1.3 : easeFactor);
      interval = Math.round(Math.max(1, card.interval) * mult);
    }
    if (rating === RATING.HARD && repetition >= 2) interval = Math.max(1, Math.round(interval));
    return { interval, repetition, easeFactor, minutes: null, label: fmtInterval(interval) };
  },

  // Apply a rating: mutate card SRS fields & schedule.
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

  // Memory stage classification
  stage(card) {
    if (card.reviews === 0) return "new";
    if (card.repetition === 0 || card.interval < 1) return "learning";
    if (card.interval >= 21 && card.repetition >= 3) return "mastered";
    return "review";
  },

  isDue(card, at = new Date()) {
    return new Date(card.nextReviewDate) <= at;
  },
};

function fmtInterval(days) {
  if (days < 1) return "<10m";
  if (days === 1) return "1d";
  if (days < 30) return days + "d";
  if (days < 365) return Math.round(days / 30) + "mo";
  return (days / 365).toFixed(1) + "y";
}

/* ---------------------------------------------------------
   5. Audio — speechSynthesis (fr-FR)
   --------------------------------------------------------- */
const Audio = {
  voices: [],
  init() {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => /fr/i.test(v.lang));
      Settings.populateVoices();
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  currentVoice() {
    const uri = Store.settings.voiceURI;
    return this.voices.find(v => v.voiceURI === uri) || this.voices[0] || null;
  },
  speak(text, { slow = false } = {}) {
    if (!("speechSynthesis" in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    const v = this.currentVoice();
    if (v) u.voice = v;
    u.rate = (slow || Store.settings.slowAudio) ? 0.75 : 1;
    speechSynthesis.speak(u);
  },
};

/* ---------------------------------------------------------
   6. Review controller
   --------------------------------------------------------- */
const Review = {
  queue: [], current: null, flipped: false,

  buildQueue() {
    const now = new Date();
    const due = Store.cards.filter(c => c.reviews > 0 && SRS.isDue(c, now));
    // sort due by date
    due.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
    // introduce new cards up to newPerDay (minus those already introduced today)
    const introducedToday = Store.state.log.filter(l => l.date === todayKey() && l.isNew).length;
    const budget = Math.max(0, (Store.settings.newPerDay || 0) - introducedToday);
    const fresh = Store.cards.filter(c => c.reviews === 0).slice(0, budget);
    this.queue = [...due, ...fresh];
  },

  start() {
    this.buildQueue();
    this.next();
  },

  next() {
    this.flipped = false;
    this.current = this.queue.shift() || null;
    if (!this.current) { this.renderDone(); }
    else { this.render(); }
    App.updateCounts();
  },

  render() {
    const c = this.current;
    const stage = document.getElementById("cardStage");
    document.getElementById("sessionDone").classList.add("hidden");
    stage.classList.remove("hidden");

    const useCloze = Store.settings.cloze && !!locateTarget(c);

    const frontSentence = useCloze
      ? `<div class="card-sentence">${clozeSentence(c)}</div>`
      : "";
    const frontWord = useCloze ? "" :
      `<div class="card-front-word">${articleHtml(c)}${escapeHtml(c.word)}</div>`;

    stage.innerHTML = `
      <div class="flashcard" id="flashcard">
        <div class="card-tags">
          <span class="tag tag-level">${c.level}</span>
          <span class="tag">${c.pos}</span>
          ${c.gender ? `<span class="tag tag-gender">[${c.gender}]</span>` : ""}
        </div>
        ${frontWord}
        ${frontSentence}
        <div class="audio-row">
          <button class="audio-btn" data-act="play">🔊 Écouter</button>
          <button class="audio-btn" data-act="slow">🐢 Lent</button>
        </div>
        <div id="cardBack"></div>
        <div class="tap-hint" id="tapHint">Tap card or press Space to flip</div>
      </div>`;

    // auto play
    if (Store.settings.autoPlay) Audio.speak(c.sentence || c.word);
    this._bindCard();
  },

  _bindCard() {
    const card = document.getElementById("flashcard");
    card.addEventListener("click", (e) => {
      const act = e.target.dataset.act;
      if (act === "play") { e.stopPropagation(); Audio.speak(this.current.sentence || this.current.word); return; }
      if (act === "slow") { e.stopPropagation(); Audio.speak(this.current.sentence || this.current.word, { slow: true }); return; }
      if (e.target.closest(".rate-row")) return;
      if (!this.flipped) this.flip();
    });
  },

  flip() {
    if (!this.current || this.flipped) return;
    this.flipped = true;
    const c = this.current;
    const p = SRS.preview(c);
    document.getElementById("tapHint").remove();
    document.getElementById("cardBack").innerHTML = `
      <div class="divider"></div>
      <div class="card-back">
        <div class="back-meaning">${escapeHtml(c.meaning)}</div>
        ${c.ipa ? `<div class="card-ipa">${escapeHtml(c.ipa)}</div>` : ""}
        <div class="back-block">
          <span class="lbl">Example</span>
          <div class="fr-line">${highlightWord(c)}</div>
          ${c.translation ? `<div class="en-line">${escapeHtml(c.translation)}</div>` : ""}
        </div>
        ${c.notes ? `<div class="back-block"><span class="lbl">Notes</span>${escapeHtml(c.notes)}</div>` : ""}
        <div class="rate-row">
          ${rateBtn(RATING.AGAIN, "Again", "1", p[RATING.AGAIN], "rate-again")}
          ${rateBtn(RATING.HARD, "Hard", "2", p[RATING.HARD], "rate-hard")}
          ${rateBtn(RATING.GOOD, "Good", "3", p[RATING.GOOD], "rate-good")}
          ${rateBtn(RATING.EASY, "Easy", "4", p[RATING.EASY], "rate-easy")}
        </div>
      </div>`;
    document.querySelectorAll(".rate-btn").forEach(b => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        this.rate(parseInt(b.dataset.rating, 10));
      });
    });
  },

  rate(rating) {
    if (!this.current || !this.flipped) return;
    const c = this.current;
    const wasNew = c.reviews === 0;
    SRS.apply(c, rating);
    // log activity
    const k = todayKey();
    Store.state.history[k] = (Store.state.history[k] || 0) + 1;
    Store.state.log.push({ date: k, correct: rating >= RATING.GOOD, isNew: wasNew });
    Store.save();
    this.next();
    Toast.flashInterval(fmtInterval(c.interval), rating);
  },

  renderDone() {
    document.getElementById("cardStage").classList.add("hidden");
    document.getElementById("sessionDone").classList.remove("hidden");
  },
};

function rateBtn(rating, label, key, interval, cls) {
  return `<button class="rate-btn ${cls}" data-rating="${rating}">
    <span class="rate-label">${label}</span>
    <span class="rate-int">${interval}</span>
    <span class="rate-key">[${key}]</span>
  </button>`;
}

/* word rendering helpers */
function articleHtml(c) {
  if (!c.article) return "";
  const sep = c.article.endsWith("'") ? "" : " ";
  return `<span class="article">${escapeHtml(c.article)}${sep}</span>`;
}

// French letters (incl. accents/ligatures/apostrophes) for building boundaries.
const FR_LETTER = "a-zàâäéèêëîïôöùûüÿçœæ";
const FR_WORD_CHARS = new RegExp("[" + FR_LETTER + "]", "i");

/* Light French stemmer: strip infinitive endings / plurals / elision to a stem
   the surface form in the sentence should share. Deliberately conservative. */
function frenchStem(word) {
  let w = String(word || "").toLowerCase().trim();
  w = w.replace(/^(l|d|j|n|m|t|s|c|qu)['’]/, "");   // drop elision (j', l', qu'…)
  if (w.length > 4 && /er$/.test(w)) return w.slice(0, -2);   // -er verbs
  if (w.length > 4 && /(ir|re)$/.test(w)) return w.slice(0, -2); // -ir / -re verbs
  if (w.length > 4 && /s$/.test(w)) return w.slice(0, -1);   // plural noun/adj
  if (w.length > 4 && /[ea]u$/.test(w)) return w.slice(0, -1); // beau→bea (matches belle? no — keep loose)
  return w;
}

/* Locate the target word's surface form inside its sentence.
   Priority: explicit inflection(s) → exact word → stemmed match.
   Returns {start, end} (indices into c.sentence) or null. */
function locateTarget(c) {
  const sent = c.sentence || "";
  if (!sent) return null;

  // 1 + 2: explicit inflected forms (comma/pipe/slash separated), then the word itself.
  const forms = [];
  if (c.inflection) c.inflection.split(/[,|/]/).forEach(f => { f = f.trim(); if (f) forms.push(f); });
  if (c.word) forms.push(c.word);
  // longest first so "voudrais" wins over a stray "vouloir" substring
  forms.sort((a, b) => b.length - a.length);
  for (const f of forms) {
    const hit = matchForm(sent, f);
    if (hit) return hit;
  }

  // 3: light stemming fallback (catches habite←habiter, pense←penser, comprends←comprendre…)
  const stem = frenchStem(c.word);
  if (stem && stem.length >= 3) {
    const re = new RegExp("(^|[^" + FR_LETTER + "])(" + escapeRegex(stem) + "[" + FR_LETTER + "]*)", "i");
    const m = re.exec(sent);
    if (m) { const start = m.index + m[1].length; return { start, end: start + m[2].length }; }
  }
  return null;
}

// Whole-word (accent-aware) match of an exact surface form.
function matchForm(sent, form) {
  if (!form) return null;
  const re = new RegExp("(^|[^" + FR_LETTER + "])(" + escapeRegex(form) + ")(?![" + FR_LETTER + "])", "i");
  const m = re.exec(sent);
  if (m) { const start = m.index + m[1].length; return { start, end: start + m[2].length }; }
  return null;
}

function clozeSentence(c) {
  const hit = locateTarget(c);
  if (!hit) return escapeHtml(c.sentence);
  return escapeHtml(c.sentence.slice(0, hit.start))
    + `<span class="cloze">[…]</span>`
    + escapeHtml(c.sentence.slice(hit.end));
}

function highlightWord(c) {
  const hit = locateTarget(c);
  if (!hit) return escapeHtml(c.sentence);
  return escapeHtml(c.sentence.slice(0, hit.start))
    + `<span class="highlight-word">${escapeHtml(c.sentence.slice(hit.start, hit.end))}</span>`
    + escapeHtml(c.sentence.slice(hit.end));
}

/* ---------------------------------------------------------
   7. Deck Manager (table view)
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

    body.querySelectorAll("[data-edit]").forEach(b =>
      b.addEventListener("click", () => Modal.openEdit(b.dataset.edit)));
    body.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", () => DeckManager.remove(b.dataset.del)));
  },

  remove(id) {
    const c = Store.cards.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`Delete "${c.word}"? This cannot be undone.`)) return;
    Store.state.cards = Store.cards.filter(x => x.id !== id);
    Store.save();
    this.render();
    App.updateCounts();
    Toast.show("Card deleted");
  },
};

/* ---------------------------------------------------------
   8. Stats
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

    // breakdown
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    cards.forEach(c => counts[SRS.stage(c)]++);
    const total = cards.length || 1;
    const bar = document.getElementById("breakdownBar");
    bar.innerHTML = ["new","learning","review","mastered"].map(s =>
      `<div class="bd-${s}" style="width:${100*counts[s]/total}%" title="${cap(s)}: ${counts[s]}"></div>`
    ).join("");

    this.renderHeatmap();
  },

  streak() {
    const hist = Store.state.history;
    let streak = 0;
    let d = new Date();
    // if nothing today, streak can still count up to yesterday
    if (!hist[todayKey(d)]) d.setDate(d.getDate() - 1);
    while (hist[todayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  },

  renderHeatmap() {
    const hm = document.getElementById("heatmap");
    const weeks = 20, cells = weeks * 7;
    const today = new Date();
    // align so grid ends at today; start from (cells-1) days ago on a Monday-ish grid
    const start = new Date(today);
    start.setDate(start.getDate() - (cells - 1));
    let html = "";
    for (let i = 0; i < cells; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const count = Store.state.history[todayKey(d)] || 0;
      const lvl = count === 0 ? 0 : count < 5 ? 1 : count < 12 ? 2 : count < 25 ? 3 : 4;
      html += `<div class="hm-cell ${lvl ? "hm-" + lvl : ""}" title="${todayKey(d)}: ${count} reviews"></div>`;
    }
    hm.innerHTML = html;
  },
};

/* ---------------------------------------------------------
   9. Settings
   --------------------------------------------------------- */
const Settings = {
  bind() {
    const s = Store.settings;
    const $ = id => document.getElementById(id);
    $("slowAudio").checked = s.slowAudio;
    $("autoPlay").checked = s.autoPlay;
    $("clozeMode").checked = s.cloze;
    $("newPerDay").value = s.newPerDay;

    $("slowAudio").addEventListener("change", e => { s.slowAudio = e.target.checked; Store.save(); });
    $("autoPlay").addEventListener("change", e => { s.autoPlay = e.target.checked; Store.save(); });
    $("clozeMode").addEventListener("change", e => { s.cloze = e.target.checked; Store.save(); });
    $("newPerDay").addEventListener("change", e => { s.newPerDay = clampInt(e.target.value, 0, 100); Store.save(); });
    $("voiceSelect").addEventListener("change", e => { s.voiceURI = e.target.value; Store.save(); });
    $("testVoice").addEventListener("click", () => Audio.speak("Bonjour ! Je parle français.", {}));

    $("exportBtn").addEventListener("click", () => Data.export());
    $("importBtn").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", e => Data.import(e.target.files[0]));
    $("resetBtn").addEventListener("click", () => Data.reset());

    this.updateStorageInfo();
  },
  populateVoices() {
    const sel = document.getElementById("voiceSelect");
    if (!sel) return;
    if (!Audio.voices.length) { sel.innerHTML = `<option value="">No French voice found</option>`; return; }
    sel.innerHTML = Audio.voices.map(v =>
      `<option value="${v.voiceURI}" ${v.voiceURI === Store.settings.voiceURI ? "selected" : ""}>${v.name} (${v.lang})</option>`
    ).join("");
  },
  updateStorageInfo() {
    const bytes = new Blob([localStorage.getItem(LS_KEY) || ""]).size;
    document.getElementById("storageInfo").textContent =
      `${Store.cards.length} cards · ${(bytes/1024).toFixed(1)} KB stored locally · nothing leaves your browser.`;
  },
};

/* ---------------------------------------------------------
   10. Data — import / export / reset
   --------------------------------------------------------- */
const Data = {
  export() {
    const blob = new Blob([JSON.stringify(Store.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `le-trainer-${todayKey()}.json`;
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
        // normalise cards so imported data always has SRS fields
        data.cards = data.cards.map(c => Object.assign(newCard({}), c));
        Store.state = data;
        Store._migrate();
        Store.save();
        App.refreshAll();
        Toast.show(`Imported ${data.cards.length} cards ✓`);
      } catch (e) {
        Toast.show("⚠ Invalid JSON file");
      }
    };
    reader.readAsText(file);
  },
  reset() {
    if (!confirm("Reset everything to the 30-word starter deck? Your custom cards and history will be lost.")) return;
    Store.state = Store._fresh();
    Store.save();
    App.refreshAll();
    Toast.show("Reset to starter deck");
  },
};

/* ---------------------------------------------------------
   11. Modal (add / edit)
   --------------------------------------------------------- */
const Modal = {
  el: null,
  bind() {
    this.el = document.getElementById("modal");
    document.getElementById("quickAddBtn").addEventListener("click", () => this.openAdd());
    document.getElementById("modalClose").addEventListener("click", () => this.close());
    document.getElementById("cancelForm").addEventListener("click", () => this.close());
    this.el.addEventListener("click", e => { if (e.target === this.el) this.close(); });
    document.getElementById("cardForm").addEventListener("submit", e => { e.preventDefault(); this.save(); });
  },
  openAdd() {
    document.getElementById("modalTitle").textContent = "Add a card";
    document.getElementById("cardForm").reset();
    document.getElementById("f_id").value = "";
    this.el.classList.remove("hidden");
    document.getElementById("f_word").focus();
  },
  openEdit(id) {
    const c = Store.cards.find(x => x.id === id);
    if (!c) return;
    document.getElementById("modalTitle").textContent = "Edit card";
    const g = c.article ? `${c.article}|${c.gender}` : "";
    setVal("f_id", c.id); setVal("f_word", c.word); setVal("f_gender", g);
    setVal("f_pos", c.pos); setVal("f_level", c.level); setVal("f_ipa", c.ipa);
    setVal("f_meaning", c.meaning); setVal("f_sentence", c.sentence);
    setVal("f_translation", c.translation); setVal("f_notes", c.notes);
    setVal("f_inflection", c.inflection);
    this.el.classList.remove("hidden");
  },
  save() {
    const id = getVal("f_id");
    const [article, gender] = (getVal("f_gender") || "|").split("|");
    const fields = {
      word: getVal("f_word").trim(),
      article, gender,
      pos: getVal("f_pos"), level: getVal("f_level"),
      ipa: getVal("f_ipa").trim(), meaning: getVal("f_meaning").trim(),
      sentence: getVal("f_sentence").trim(), translation: getVal("f_translation").trim(),
      notes: getVal("f_notes").trim(), inflection: getVal("f_inflection").trim(),
    };
    if (id) {
      const c = Store.cards.find(x => x.id === id);
      Object.assign(c, fields);
      Toast.show("Card updated ✓");
    } else {
      Store.cards.push(newCard(fields));
      Toast.show("Card added ✓");
    }
    Store.save();
    this.close();
    App.refreshAll();
  },
  close() { this.el.classList.add("hidden"); },
};

/* ---------------------------------------------------------
   12. Toast
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
   13. App — router, keyboard, wiring
   --------------------------------------------------------- */
const App = {
  view: "review",
  init() {
    Store.load();
    Audio.init();
    Modal.bind();
    Settings.bind();
    this.bindTabs();
    this.bindKeyboard();
    document.getElementById("deckSearch").addEventListener("input", () => DeckManager.render());
    document.getElementById("filterLevel").addEventListener("change", () => DeckManager.render());
    document.getElementById("filterState").addEventListener("change", () => DeckManager.render());
    document.getElementById("studyAgainBtn").addEventListener("click", () => Review.start());
    Review.start();
    this.updateCounts();
  },

  bindTabs() {
    document.querySelectorAll(".tab").forEach(t => {
      t.addEventListener("click", () => this.go(t.dataset.view));
    });
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
    const now = new Date();
    const cards = Store.cards;
    document.getElementById("cntNew").textContent = cards.filter(c => c.reviews === 0).length;
    document.getElementById("cntLearning").textContent = cards.filter(c => SRS.stage(c) === "learning").length;
    document.getElementById("cntDue").textContent = cards.filter(c => c.reviews > 0 && SRS.isDue(c, now)).length;
  },

  refreshAll() {
    Settings.bind && Settings.populateVoices();
    this.updateCounts();
    if (this.view === "decks") DeckManager.render();
    if (this.view === "stats") Stats.render();
    if (this.view === "review") Review.start();
    Settings.updateStorageInfo();
    // sync settings controls
    const s = Store.settings;
    document.getElementById("slowAudio").checked = s.slowAudio;
    document.getElementById("autoPlay").checked = s.autoPlay;
    document.getElementById("clozeMode").checked = s.cloze;
    document.getElementById("newPerDay").value = s.newPerDay;
  },

  bindKeyboard() {
    document.addEventListener("keydown", e => {
      // ignore when typing in a field or modal open
      if (e.target.matches("input, textarea, select")) return;
      if (!document.getElementById("modal").classList.contains("hidden")) {
        if (e.key === "Escape") Modal.close();
        return;
      }
      if (this.view !== "review" || !Review.current) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); Review.flip(); }
      else if (e.key === "r" || e.key === "R") { Audio.speak(Review.current.sentence || Review.current.word); }
      else if (["1","2","3","4"].includes(e.key) && Review.flipped) { Review.rate(parseInt(e.key, 10)); }
    });
  },
};

/* ---------------------------------------------------------
   14. Small utilities
   --------------------------------------------------------- */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
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

/* ---------------------------------------------------------
   Boot
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => App.init());

})();
