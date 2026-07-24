/* =========================================================
   Language pack: Italian (it)
   Registered on the shared window.LeTrainer.langs registry.
   Deck rows: [word, "article|gender", pos, level, ipa,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Light Italian stemmer — strips -are/-ere/-ire infinitives, a trailing
  // noun/adjective vowel (o/a/e/i), and elision. Conservative; irregular
  // surface forms (vorrei, amo, bel) are pinned via the inflection field.
  function stem(word) {
    let w = String(word || "").toLowerCase().trim();
    w = w.replace(/^[a-zà-ÿ]+['’]/i, "");                          // drop elision (l', un', dell'…)
    if (w.length > 3 && /(are|ere|ire)$/.test(w)) return w.slice(0, -3); // infinitives
    if (w.length > 4 && /[oaei]$/.test(w)) return w.slice(0, -1);         // noun/adj final vowel
    return w;
  }

  ns.langs.it = {
    code: "it",
    name: "Italiano",
    tagline: "Italian · Spaced Repetition",
    flag: ["#008C45", "#F4F5F0", "#CD212A"],
    voiceLang: "it-IT",
    voiceMatch: /^it/i,
    ui: {
      listen: "🔊 Ascolta",
      slow: "🐢 Lento",
      doneTitle: "Sessione completata !",
      doneSub: "No more cards due right now. Ottimo lavoro.",
      testPhrase: "Buongiorno! Parlo italiano.",
    },
    genders: [
      { v: "", t: "— none —" },
      { v: "il|m", t: "il (m)" },
      { v: "lo|m", t: "lo (m)" },
      { v: "la|f", t: "la (f)" },
      { v: "l'|m", t: "l' (m)" },
      { v: "l'|f", t: "l' (f)" },
      { v: "i|p", t: "i (m pl)" },
      { v: "gli|p", t: "gli (m pl)" },
      { v: "le|p", t: "le (f pl)" },
      { v: "un|m", t: "un (m)" },
      { v: "uno|m", t: "uno (m)" },
      { v: "una|f", t: "una (f)" },
      { v: "un'|f", t: "un' (f)" },
    ],
    stem,
    deck: [
      ["acqua","la|f","Noun","A1","/ˈak.kwa/","water","Bevo dell'acqua fresca.","I drink fresh water.","partitivo: dell'acqua",""],
      ["abitare","","Verb","A1","/a.biˈta.re/","to live (reside)","Abito a Roma da due anni.","I have lived in Rome for two years.","-are verb, regular",""],
      ["sempre","","Adverb","A1","/ˈsɛm.pre/","always","Arriva sempre in ritardo.","He always arrives late.","",""],
      ["speranza","la|f","Noun","B1","/speˈran.tsa/","hope","Non ha perso la speranza.","She hasn't lost hope.","",""],
      ["diventare","","Verb","B1","/di.venˈta.re/","to become","Vuole diventare medico.","He wants to become a doctor.","aux. essere in passato prossimo",""],
      ["casa","la|f","Noun","A1","/ˈka.za/","house / home","Torniamo a casa.","We are going back home.","a casa = home",""],
      ["mangiare","","Verb","A1","/manˈdʒa.re/","to eat","Ci piace mangiare insieme.","We like to eat together.","noi mangiamo",""],
      ["bello","","Adjective","A1","/ˈbɛl.lo/","beautiful","Che bel paesaggio!","What a beautiful landscape!","bel/bello/bella before nouns","bel"],
      ["tempo","il|m","Noun","A2","/ˈtɛm.po/","time / weather","Non ho tempo oggi.","I don't have time today.","also 'weather'",""],
      ["parlare","","Verb","A1","/parˈla.re/","to speak / talk","Puoi parlare più lentamente?","Can you speak more slowly?","parlare con qualcuno",""],
      ["amico","l'|m","Noun","A1","/aˈmi.ko/","friend","È il mio migliore amico.","He is my best friend.","amica f.; pl. amici",""],
      ["lavoro","il|m","Noun","A2","/laˈvo.ro/","work / job","Adora il suo lavoro.","She loves her job.","",""],
      ["volere","","Verb","A2","/voˈle.re/","to want","Vorrei un caffè, per favore.","I would like a coffee, please.","vorrei = polite conditional","vorrei"],
      ["città","la|f","Noun","A1","/tʃitˈta/","city / town","Milano è una bella città.","Milan is a beautiful city.","invariable plural",""],
      ["pensare","","Verb","A2","/penˈsa.re/","to think","Penso che tu abbia ragione.","I think you are right.","pensare a / pensare che",""],
      ["bambino","il|m","Noun","A1","/bamˈbi.no/","child","I bambini giocano nel parco.","The children play in the park.","bambina f.; pl. bambini",""],
      ["felice","","Adjective","A2","/feˈli.tʃe/","happy","Sono molto felice di vederti.","I am very happy to see you.","same m/f; pl. felici",""],
      ["capire","","Verb","A2","/kaˈpi.re/","to understand","Non capisco la domanda.","I don't understand the question.","-isc- verb: capisco",""],
      ["giorno","il|m","Noun","A1","/ˈdʒor.no/","day","Ogni giorno è una nuova occasione.","Every day is a new chance.","cf. giornata",""],
      ["amare","","Verb","A1","/aˈma.re/","to love","Amo molto la musica italiana.","I really love Italian music.","io amo","amo"],
      ["mondo","il|m","Noun","A2","/ˈmon.do/","world","Voglio viaggiare per il mondo.","I want to travel the world.","",""],
      ["cercare","","Verb","A2","/tʃerˈka.re/","to look for","Cerco le mie chiavi.","I'm looking for my keys.","cercare qualcosa",""],
      ["vita","la|f","Noun","A2","/ˈvi.ta/","life","Così è la vita!","That's life!","",""],
      ["spesso","","Adverb","A2","/ˈspes.so/","often","Ci vediamo spesso nel weekend.","We see each other often on weekends.","",""],
      ["conoscere","","Verb","B1","/koˈnoʃ.ʃe.re/","to know (be familiar)","Conosco bene questo quartiere.","I know this neighbourhood well.","vs 'sapere'",""],
      ["macchina","la|f","Noun","A1","/ˈmak.ki.na/","car","La mia macchina è rotta.","My car has broken down.","also 'machine'",""],
      ["nuovo","","Adjective","A2","/ˈnwɔ.vo/","new","Ecco il mio nuovo telefono.","Here is my new phone.","nuova f.",""],
      ["bisognare","","Verb","B1","/bi.zoɲˈɲa.re/","to be necessary","Bisogna partire adesso.","We must leave now.","impersonal: bisogna",""],
      ["cuore","il|m","Noun","B1","/ˈkwɔ.re/","heart","Ha un grande cuore.","He has a big heart.","a memoria = by heart",""],
      ["lingua","la|f","Noun","A2","/ˈlin.ɡwa/","language / tongue","L'italiano è una bella lingua.","Italian is a beautiful language.","also means 'tongue'",""],
    ],
  };
})();
