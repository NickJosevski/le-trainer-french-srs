/* =========================================================
   Language pack: German (de)
   Registered on the shared window.LeTrainer.langs registry.
   Deck rows: [word, "article|gender", pos, level, ipa,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Light German stemmer — strips the -en/-n infinitive ending and a trailing
  // -e (declension/plural). Matching is case-insensitive, so capitalised nouns
  // are fine. Strong/irregular forms (will, wird…) are pinned via inflection.
  function stem(word) {
    let w = String(word || "").toLowerCase().trim();
    if (w.length > 4 && /en$/.test(w)) return w.slice(0, -2);   // infinitive -en
    if (w.length > 4 && /n$/.test(w)) return w.slice(0, -1);    // -n (wandern, etc.)
    if (w.length > 4 && /e$/.test(w)) return w.slice(0, -1);    // trailing -e
    return w;
  }

  ns.langs.de = {
    code: "de",
    name: "Deutsch",
    tagline: "German · Spaced Repetition",
    flag: ["#000000", "#DD0000", "#FFCE00"],
    voiceLang: "de-DE",
    voiceMatch: /^de/i,
    ui: {
      listen: "🔊 Hören",
      slow: "🐢 Langsam",
      doneTitle: "Sitzung beendet!",
      doneSub: "No more cards due right now. Gut gemacht!",
      testPhrase: "Hallo! Ich spreche Deutsch.",
    },
    genders: [
      { v: "", t: "— none —" },
      { v: "der|m", t: "der (m)" },
      { v: "die|f", t: "die (f)" },
      { v: "das|n", t: "das (n)" },
      { v: "die|p", t: "die (pl)" },
      { v: "ein|m", t: "ein (m)" },
      { v: "eine|f", t: "eine (f)" },
      { v: "ein|n", t: "ein (n)" },
    ],
    stem,
    deck: [
      ["Wasser","das|n","Noun","A1","/ˈvasɐ/","water","Ich trinke kaltes Wasser.","I drink cold water.","",""],
      ["wohnen","","Verb","A1","/ˈvoːnən/","to live (reside)","Ich wohne seit zwei Jahren in Berlin.","I have lived in Berlin for two years.","regular verb",""],
      ["immer","","Adverb","A1","/ˈɪmɐ/","always","Er kommt immer zu spät.","He is always late.","",""],
      ["Hoffnung","die|f","Noun","B1","/ˈhɔfnʊŋ/","hope","Sie hat die Hoffnung nicht verloren.","She hasn't lost hope.","",""],
      ["werden","","Verb","B1","/ˈveːɐ̯dn̩/","to become","Ich möchte Arzt werden.","I want to become a doctor.","also aux. for future/passive",""],
      ["Haus","das|n","Noun","A1","/haʊs/","house / home","Mein Haus ist klein.","My house is small.","nach Hause = (going) home",""],
      ["essen","","Verb","A1","/ˈɛsn̩/","to eat","Wir essen gern zusammen.","We like to eat together.","strong: er isst",""],
      ["schön","","Adjective","A1","/ʃøːn/","beautiful / nice","Was für eine schöne Landschaft!","What a beautiful landscape!","declines: schöne",""],
      ["Zeit","die|f","Noun","A2","/tsaɪt/","time","Ich habe heute keine Zeit.","I don't have time today.","",""],
      ["sprechen","","Verb","A1","/ˈʃpʁɛçn̩/","to speak / talk","Kannst du langsamer sprechen?","Can you speak more slowly?","strong: er spricht",""],
      ["Freund","der|m","Noun","A1","/fʁɔɪnt/","friend","Er ist mein bester Freund.","He is my best friend.","Freundin f.",""],
      ["Arbeit","die|f","Noun","A2","/ˈaʁbaɪt/","work / job","Sie liebt ihre Arbeit.","She loves her work.","",""],
      ["wollen","","Verb","A2","/ˈvɔlən/","to want","Ich will einen Kaffee, bitte.","I want a coffee, please.","modal: ich will","will"],
      ["Stadt","die|f","Noun","A1","/ʃtat/","city","Berlin ist eine schöne Stadt.","Berlin is a beautiful city.","pl. Städte",""],
      ["denken","","Verb","A2","/ˈdɛŋkn̩/","to think","Ich denke, du hast recht.","I think you are right.","denken an",""],
      ["Kind","das|n","Noun","A1","/kɪnt/","child","Das Kind spielt im Park.","The child plays in the park.","pl. Kinder",""],
      ["glücklich","","Adjective","A2","/ˈɡlʏklɪç/","happy","Ich bin sehr glücklich, dich zu sehen.","I am very happy to see you.","",""],
      ["verstehen","","Verb","A2","/fɛɐ̯ˈʃteːən/","to understand","Ich verstehe die Frage nicht.","I don't understand the question.","",""],
      ["Tag","der|m","Noun","A1","/taːk/","day","Jeder Tag ist eine neue Chance.","Every day is a new chance.","",""],
      ["lieben","","Verb","A1","/ˈliːbn̩/","to love","Ich liebe deutsche Musik.","I love German music.","",""],
      ["Welt","die|f","Noun","A2","/vɛlt/","world","Ich will die Welt bereisen.","I want to travel the world.","",""],
      ["suchen","","Verb","A2","/ˈzuːxn̩/","to look for","Ich suche meine Schlüssel.","I'm looking for my keys.","suchen nach",""],
      ["Leben","das|n","Noun","A2","/ˈleːbn̩/","life","So ist das Leben!","That's life!","",""],
      ["oft","","Adverb","A2","/ɔft/","often","Wir sehen uns oft am Wochenende.","We often see each other on weekends.","",""],
      ["kennen","","Verb","B1","/ˈkɛnən/","to know (be familiar)","Ich kenne dieses Viertel gut.","I know this neighbourhood well.","vs 'wissen'",""],
      ["Auto","das|n","Noun","A1","/ˈaʊto/","car","Mein Auto ist kaputt.","My car is broken.","kaputt = broken",""],
      ["neu","","Adjective","A2","/nɔɪ/","new","Das ist mein neues Telefon.","This is my new phone.","declines: neues",""],
      ["brauchen","","Verb","B1","/ˈbʁaʊxn̩/","to need","Ich brauche jetzt Hilfe.","I need help now.","",""],
      ["Herz","das|n","Noun","B1","/hɛʁts/","heart","Er hat ein großes Herz.","He has a big heart.","",""],
      ["Sprache","die|f","Noun","A2","/ˈʃpʁaːxə/","language","Deutsch ist eine schöne Sprache.","German is a beautiful language.","",""],
    ],
  };
})();
