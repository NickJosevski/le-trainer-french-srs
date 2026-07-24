/* =========================================================
   Language pack: French (fr)
   Registered on the shared window.LeTrainer.langs registry.
   Deck rows: [word, "article|gender", pos, level, ipa,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Light French stemmer — strips infinitive endings / plurals / elision
  // to a stem the surface form in the sentence should share. Conservative.
  function stem(word) {
    let w = String(word || "").toLowerCase().trim();
    w = w.replace(/^(l|d|j|n|m|t|s|c|qu)['’]/, "");     // drop elision (j', l', qu'…)
    if (w.length > 4 && /er$/.test(w)) return w.slice(0, -2);        // -er verbs
    if (w.length > 4 && /(ir|re)$/.test(w)) return w.slice(0, -2);   // -ir / -re verbs
    if (w.length > 4 && /s$/.test(w)) return w.slice(0, -1);         // plural
    if (w.length > 4 && /[ea]u$/.test(w)) return w.slice(0, -1);     // beau/eau family
    return w;
  }

  ns.langs.fr = {
    code: "fr",
    name: "Français",
    tagline: "French · Spaced Repetition",
    flag: ["#2947d8", "#f4f4f4", "#d81f2a"],
    voiceLang: "fr-FR",
    voiceMatch: /^fr/i,
    ui: {
      listen: "🔊 Écouter",
      slow: "🐢 Lent",
      doneTitle: "Séance terminée !",
      doneSub: "No more cards due right now. Great work.",
      testPhrase: "Bonjour ! Je parle français.",
    },
    genders: [
      { v: "", t: "— none —" },
      { v: "le|m", t: "le (m)" },
      { v: "la|f", t: "la (f)" },
      { v: "l'|m", t: "l' (m)" },
      { v: "l'|f", t: "l' (f)" },
      { v: "les|p", t: "les (pl)" },
      { v: "un|m", t: "un (m)" },
      { v: "une|f", t: "une (f)" },
    ],
    stem,
    deck: [
      ["eau","la|f","Noun","A1","/o/","water","Je bois de l'eau fraîche.","I drink fresh water.","partitive: de l'eau",""],
      ["habiter","","Verb","A1","/a.bi.te/","to live (reside)","J'habite à Paris depuis deux ans.","I have lived in Paris for two years.","-er verb, regular",""],
      ["toujours","","Adverb","A1","/tu.ʒuʁ/","always / still","Il arrive toujours en retard.","He always arrives late.","also means 'still'",""],
      ["espoir","l'|m","Noun","B1","/ɛs.pwaʁ/","hope","Elle n'a pas perdu l'espoir.","She hasn't lost hope.","masc. despite l'",""],
      ["devenir","","Verb","B1","/dəv.niʁ/","to become","Il veut devenir médecin.","He wants to become a doctor.","conjugates like 'venir', être in passé composé",""],
      ["maison","la|f","Noun","A1","/mɛ.zɔ̃/","house / home","Nous rentrons à la maison.","We are going back home.","à la maison = home",""],
      ["manger","","Verb","A1","/mɑ̃.ʒe/","to eat","Nous aimons manger ensemble.","We like to eat together.","nous mangeons (keep the e)",""],
      ["beau","","Adjective","A1","/bo/","beautiful / handsome","Quel beau paysage !","What a beautiful landscape!","bel before vowel, belle f.",""],
      ["temps","le|m","Noun","A2","/tɑ̃/","time / weather","Je n'ai pas le temps aujourd'hui.","I don't have time today.","also 'weather'",""],
      ["parler","","Verb","A1","/paʁ.le/","to speak / talk","Peux-tu parler plus lentement ?","Can you speak more slowly?","parler à qqn",""],
      ["ami","l'|m","Noun","A1","/a.mi/","friend","C'est mon meilleur ami.","He is my best friend.","amie for female",""],
      ["travail","le|m","Noun","A2","/tʁa.vaj/","work / job","Elle adore son travail.","She loves her job.","pl. travaux",""],
      ["vouloir","","Verb","A2","/vu.lwaʁ/","to want","Je voudrais un café, s'il vous plaît.","I would like a coffee, please.","je voudrais = polite","voudrais"],
      ["ville","la|f","Noun","A1","/vil/","city / town","Lyon est une belle ville.","Lyon is a beautiful city.","",""],
      ["penser","","Verb","A2","/pɑ̃.se/","to think","Je pense que tu as raison.","I think you are right.","penser à / penser que",""],
      ["enfant","l'|m","Noun","A1","/ɑ̃.fɑ̃/","child","Les enfants jouent dans le parc.","The children play in the park.","same form m/f",""],
      ["heureux","","Adjective","A2","/ø.ʁø/","happy","Je suis très heureux de te voir.","I am very happy to see you.","heureuse f.",""],
      ["comprendre","","Verb","A2","/kɔ̃.pʁɑ̃dʁ/","to understand","Je ne comprends pas la question.","I don't understand the question.","like 'prendre'",""],
      ["jour","le|m","Noun","A1","/ʒuʁ/","day","Chaque jour est une nouvelle chance.","Every day is a new chance.","cf. journée",""],
      ["aimer","","Verb","A1","/e.me/","to like / love","J'aime beaucoup la musique française.","I really like French music.","aimer bien = to like",""],
      ["monde","le|m","Noun","A2","/mɔ̃d/","world / people","Il y a beaucoup de monde ici.","There are a lot of people here.","du monde = crowds",""],
      ["chercher","","Verb","A2","/ʃɛʁ.ʃe/","to look for","Je cherche mes clés.","I'm looking for my keys.","no preposition needed",""],
      ["vie","la|f","Noun","A2","/vi/","life","C'est la vie !","That's life!","",""],
      ["souvent","","Adverb","A2","/su.vɑ̃/","often","On se voit souvent le week-end.","We see each other often on weekends.","",""],
      ["connaître","","Verb","B1","/kɔ.nɛtʁ/","to know (be familiar)","Je connais bien ce quartier.","I know this neighbourhood well.","î before t; vs 'savoir'","connais"],
      ["voiture","la|f","Noun","A1","/vwa.tyʁ/","car","Ma voiture est en panne.","My car has broken down.","en panne = broken down",""],
      ["nouveau","","Adjective","A2","/nu.vo/","new","Voici mon nouveau téléphone.","Here is my new phone.","nouvel before vowel, nouvelle f.",""],
      ["falloir","il|m","Verb","B1","/fa.lwaʁ/","to be necessary","Il faut partir maintenant.","We must leave now.","impersonal: il faut","faut"],
      ["cœur","le|m","Noun","B1","/kœʁ/","heart","Il a un grand cœur.","He has a big heart.","par cœur = by heart",""],
      ["langue","la|f","Noun","A2","/lɑ̃ɡ/","language / tongue","Le français est une belle langue.","French is a beautiful language.","also means 'tongue'",""],
    ],
  };
})();
