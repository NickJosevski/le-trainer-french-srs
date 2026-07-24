/* =========================================================
   Le Trainer — target-word matcher (shared)
   The single source of truth for locating a card's target
   surface form inside its example sentence, used for cloze
   deletion and back-side highlighting.

   Loaded two ways with no duplication:
     • browser  — plain <script>, attaches to window.LeTrainer.match
     • Node/CI  — require()/import, so the deck test exercises the
                  exact same logic the app runs.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;   // Node / CI
  root.LeTrainer = root.LeTrainer || { langs: {} };
  root.LeTrainer.match = api;                                               // browser global
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Latin letters + accents/ligatures shared across supported languages.
  // Every non-listed character (incl. all CJK) counts as a word boundary,
  // which is what makes exact matching work for space-free Japanese.
  const LETTER = "a-zàâäáãéèêëíìîïóòôöõúùûüçñœæß";

  function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Whole-word (accent-aware) match of an exact surface form.
  function matchForm(sent, form) {
    if (!form) return null;
    const re = new RegExp("(^|[^" + LETTER + "])(" + escapeRegex(form) + ")(?![" + LETTER + "])", "i");
    const m = re.exec(sent);
    if (m) { const start = m.index + m[1].length; return { start, end: start + m[2].length }; }
    return null;
  }

  // Locate the target word's surface form in its sentence.
  // Priority: explicit inflection(s) → exact word → language stemmer.
  // Returns {start, end} indices into card.sentence, or null.
  function locateTarget(card, pack) {
    const sent = (card && card.sentence) || "";
    if (!sent) return null;

    const forms = [];
    if (card.inflection) card.inflection.split(/[,|/]/).forEach(f => { f = f.trim(); if (f) forms.push(f); });
    if (card.word) forms.push(card.word);
    forms.sort((a, b) => b.length - a.length);   // longest first
    for (const f of forms) { const hit = matchForm(sent, f); if (hit) return hit; }

    const stem = pack && pack.stem ? pack.stem(card.word) : card.word;
    if (stem && stem.length >= 3) {
      const re = new RegExp("(^|[^" + LETTER + "])(" + escapeRegex(stem) + "[" + LETTER + "]*)", "i");
      const m = re.exec(sent);
      if (m) { const start = m.index + m[1].length; return { start, end: start + m[2].length }; }
    }
    return null;
  }

  return { LETTER, escapeRegex, matchForm, locateTarget };
});
