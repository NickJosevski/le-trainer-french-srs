/* =========================================================
   Deck integrity test — run in CI before every deploy.
   Loads the real shared matcher (js/match.js) and every
   language pack exactly as the browser does, then asserts:
     • each pack has the required shape,
     • every card has word / meaning / sentence,
     • every card's target is locatable in its sentence
       (i.e. cloze deletion & highlighting will work).
   Exits non-zero on any failure so the Pages deploy is blocked.
   ========================================================= */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Mirror the browser: window === globalThis, load scripts in <script> order.
globalThis.window = globalThis;
globalThis.LeTrainer = { langs: {} };
const SCRIPTS = [
  "js/match.js",
  "js/lang/fr.js", "js/lang/it.js", "js/lang/es.js", "js/lang/ja.js",
];
for (const rel of SCRIPTS) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  new Function("window", code)(globalThis);   // window param + globalThis are the same object
}

const { locateTarget } = globalThis.LeTrainer.match;
const langs = globalThis.LeTrainer.langs;

const REQUIRED = ["code", "name", "tagline", "flag", "voiceLang", "voiceMatch", "ui", "genders", "stem", "deck"];
let failures = 0, total = 0;

if (!Object.keys(langs).length) { console.error("✗ no language packs registered"); process.exit(1); }

for (const [code, pack] of Object.entries(langs)) {
  for (const k of REQUIRED) {
    if (pack[k] === undefined) { console.error(`✗ [${code}] pack missing field: ${k}`); failures++; }
  }
  if (typeof pack.stem !== "function") { console.error(`✗ [${code}] stem is not a function`); failures++; }
  if (!Array.isArray(pack.deck)) { console.error(`✗ [${code}] deck is not an array`); failures++; continue; }

  let ok = 0;
  pack.deck.forEach((r, i) => {
    total++;
    const [word, , , , , meaning, sentence] = r;
    if (!word || !meaning || !sentence) {
      console.error(`✗ [${code}] card #${i} (${word || "?"}) missing word/meaning/sentence`);
      failures++; return;
    }
    const card = { word, sentence, inflection: r[9] || "" };
    const hit = locateTarget(card, pack);
    if (!hit || hit.start >= hit.end) {
      console.error(`✗ [${code}] "${word}" — target not found in sentence: ${sentence}`);
      failures++; return;
    }
    ok++;
  });
  console.log(`${ok === pack.deck.length ? "✓" : "✗"} ${pack.name} (${code}): ${ok}/${pack.deck.length} cards cloze-match`);
}

console.log(`\n${total} cards checked across ${Object.keys(langs).length} language(s)`);
if (failures) { console.error(`\n❌ ${failures} failure(s) — fix before deploying`); process.exit(1); }
console.log("\n✅ All deck cards cloze-match their example sentence");
