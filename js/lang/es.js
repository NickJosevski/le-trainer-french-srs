/* =========================================================
   Language pack: Spanish (es)
   Registered on the shared window.LeTrainer.langs registry.
   Deck rows: [word, "article|gender", pos, level, ipa,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Light Spanish stemmer — strips -ar/-er/-ir infinitives and plurals.
  // Stem-changing verbs (quiero, pienso, entiendo…) are pinned via inflection.
  function stem(word) {
    let w = String(word || "").toLowerCase().trim();
    if (w.length > 3 && /(ar|er|ir)$/.test(w)) return w.slice(0, -2);   // infinitives
    if (w.length > 4 && /es$/.test(w)) return w.slice(0, -2);           // plural -es
    if (w.length > 4 && /s$/.test(w)) return w.slice(0, -1);            // plural -s
    return w;
  }

  ns.langs.es = {
    code: "es",
    name: "Español",
    tagline: "Spanish · Spaced Repetition",
    flag: ["#AA151B", "#F1BF00", "#AA151B"],
    voiceLang: "es-ES",
    voiceMatch: /^es/i,
    ui: {
      listen: "🔊 Escuchar",
      slow: "🐢 Lento",
      doneTitle: "¡Sesión completada!",
      doneSub: "No more cards due right now. ¡Buen trabajo!",
      testPhrase: "¡Hola! Hablo español.",
    },
    genders: [
      { v: "", t: "— none —" },
      { v: "el|m", t: "el (m)" },
      { v: "la|f", t: "la (f)" },
      { v: "el|f", t: "el (f — e.g. agua)" },
      { v: "los|p", t: "los (m pl)" },
      { v: "las|p", t: "las (f pl)" },
      { v: "un|m", t: "un (m)" },
      { v: "una|f", t: "una (f)" },
      { v: "unos|p", t: "unos (m pl)" },
      { v: "unas|p", t: "unas (f pl)" },
    ],
    stem,
    deck: [
      ["agua","el|f","Noun","A1","/ˈaɣwa/","water","Bebo agua fría.","I drink cold water.","'el agua' (fem., el for stressed a-)",""],
      ["vivir","","Verb","A1","/biˈβir/","to live (reside)","Vivo en Madrid desde hace dos años.","I have lived in Madrid for two years.","-ir verb, regular",""],
      ["siempre","","Adverb","A1","/ˈsjempre/","always","Siempre llega tarde.","He always arrives late.","",""],
      ["esperanza","la|f","Noun","B1","/espeˈɾanθa/","hope","No ha perdido la esperanza.","She hasn't lost hope.","",""],
      ["llegar","","Verb","A1","/ʎeˈɣaɾ/","to arrive","El tren llega a las ocho.","The train arrives at eight.","llegar a",""],
      ["casa","la|f","Noun","A1","/ˈkasa/","house / home","Volvemos a casa.","We are going back home.","a casa = home",""],
      ["comer","","Verb","A1","/koˈmeɾ/","to eat","Nos gusta comer juntos.","We like to eat together.","-er verb, regular",""],
      ["bonito","","Adjective","A1","/boˈnito/","pretty / nice","¡Qué paisaje tan bonito!","What a beautiful landscape!","bonita f.",""],
      ["tiempo","el|m","Noun","A2","/ˈtjempo/","time / weather","No tengo tiempo hoy.","I don't have time today.","also 'weather'",""],
      ["hablar","","Verb","A1","/aˈβlaɾ/","to speak / talk","¿Puedes hablar más despacio?","Can you speak more slowly?","hablar con alguien",""],
      ["amigo","el|m","Noun","A1","/aˈmiɣo/","friend","Es mi mejor amigo.","He is my best friend.","amiga f.",""],
      ["trabajo","el|m","Noun","A2","/tɾaˈβaxo/","work / job","Le encanta su trabajo.","She loves her job.","",""],
      ["querer","","Verb","A2","/keˈɾeɾ/","to want / love","Quiero un café, por favor.","I want a coffee, please.","e→ie: quiero","Quiero"],
      ["ciudad","la|f","Noun","A1","/θjuˈðað/","city","Barcelona es una ciudad preciosa.","Barcelona is a beautiful city.","",""],
      ["pensar","","Verb","A2","/penˈsaɾ/","to think","Pienso que tienes razón.","I think you are right.","e→ie: pienso","Pienso"],
      ["niño","el|m","Noun","A1","/ˈniɲo/","child / boy","El niño juega en el parque.","The child plays in the park.","niña f.",""],
      ["feliz","","Adjective","A2","/feˈliθ/","happy","Estoy muy feliz de verte.","I am very happy to see you.","pl. felices",""],
      ["entender","","Verb","A2","/entenˈdeɾ/","to understand","No entiendo la pregunta.","I don't understand the question.","e→ie: entiendo","entiendo"],
      ["día","el|m","Noun","A1","/ˈdi.a/","day","Cada día es una nueva oportunidad.","Every day is a new chance.","masc. despite -a",""],
      ["amar","","Verb","A2","/aˈmaɾ/","to love","Amo la música española.","I love Spanish music.","io amo","Amo"],
      ["mundo","el|m","Noun","A2","/ˈmundo/","world","Quiero viajar por el mundo.","I want to travel the world.","",""],
      ["buscar","","Verb","A2","/busˈkaɾ/","to look for","Busco mis llaves.","I'm looking for my keys.","buscar algo",""],
      ["vida","la|f","Noun","A2","/ˈbiða/","life","¡Así es la vida!","That's life!","",""],
      ["a menudo","","Adverb","A2","/a meˈnuðo/","often","Nos vemos a menudo.","We see each other often.","fixed phrase",""],
      ["conocer","","Verb","B1","/konoˈθeɾ/","to know (be familiar)","Conozco bien este barrio.","I know this neighbourhood well.","c→zc: conozco; vs 'saber'","Conozco"],
      ["coche","el|m","Noun","A1","/ˈkotʃe/","car","Mi coche está averiado.","My car has broken down.","averiado = broken down",""],
      ["nuevo","","Adjective","A2","/ˈnweβo/","new","Este es mi nuevo teléfono.","This is my new phone.","nueva f.",""],
      ["necesitar","","Verb","B1","/neθesiˈtaɾ/","to need","Necesito ayuda ahora.","I need help now.","-ar verb, regular",""],
      ["corazón","el|m","Noun","B1","/koɾaˈθon/","heart","Tiene un gran corazón.","He has a big heart.","de corazón = sincerely",""],
      ["lengua","la|f","Noun","A2","/ˈleŋɡwa/","language / tongue","El español es una lengua bonita.","Spanish is a beautiful language.","also means 'tongue'",""],
    ],
  };
})();
