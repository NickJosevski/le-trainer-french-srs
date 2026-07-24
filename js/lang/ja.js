/* =========================================================
   Language pack: Japanese (ja)
   Registered on the shared window.LeTrainer.langs registry.
   Notes on Japanese vs. the European packs:
     • No grammatical gender / articles — the gender field is empty.
     • No spaces, so cloze matching relies on exact substring (the engine's
       boundary rules treat every CJK char as a word boundary already).
     • Verbs conjugate irregularly, so each verb pins its sentence surface
       form via the `inflection` field. The stemmer only exposes a kanji
       stem as a weak fallback for user-added cards.
     • The `ipa` field carries the reading (kana + rōmaji).
     • Levels map JLPT → CEFR-ish so the level filter still works:
       N5≈A1, N4≈A2, N3≈B1.
   Deck rows: [word, "article|gender", pos, level, reading,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Expose the kanji stem of a kanji+okurigana word (食べる → 食). Weak
  // fallback only; deck verbs are matched via their inflection field.
  function stem(word) {
    const w = String(word || "").trim();
    const m = w.match(/^([一-鿿]+)[぀-ゟ]+$/);
    return m ? m[1] : w;
  }

  ns.langs.ja = {
    code: "ja",
    name: "日本語",
    tagline: "Japanese · Spaced Repetition",
    flag: ["#ffffff", "#bc002d", "#ffffff"],
    voiceLang: "ja-JP",
    voiceMatch: /^ja/i,
    ui: {
      listen: "🔊 聞く",
      slow: "🐢 ゆっくり",
      doneTitle: "セッション完了！",
      doneSub: "No more cards due right now. お疲れさまでした！",
      testPhrase: "こんにちは。日本語を話します。",
    },
    genders: [{ v: "", t: "— none —" }],
    stem,
    deck: [
      ["水","","Noun","A1","みず (mizu)","water","冷たい水を飲みます。","I drink cold water.","",""],
      ["住む","","Verb","A1","すむ (sumu)","to live (reside)","東京に住んでいます。","I live in Tokyo.","-mu verb → 住んで","住んで"],
      ["いつも","","Adverb","A1","itsumo","always","彼はいつも遅れます。","He is always late.","",""],
      ["希望","","Noun","B1","きぼう (kibō)","hope","彼女は希望を失っていません。","She hasn't lost hope.","",""],
      ["なる","","Verb","B1","naru","to become","医者になりたいです。","I want to become a doctor.","〜になる","なり"],
      ["家","","Noun","A1","いえ (ie)","house / home","家に帰ります。","I'm going home.","",""],
      ["食べる","","Verb","A1","たべる (taberu)","to eat","一緒に食べるのが好きです。","I like eating together.","ru-verb","食べる"],
      ["美しい","","Adjective","A1","うつくしい (utsukushii)","beautiful","なんて美しい景色でしょう。","What a beautiful landscape!","i-adjective",""],
      ["時間","","Noun","A2","じかん (jikan)","time","今日は時間がありません。","I don't have time today.","",""],
      ["話す","","Verb","A1","はなす (hanasu)","to speak / talk","もっとゆっくり話せますか。","Can you speak more slowly?","potential: 話せる","話せ"],
      ["友達","","Noun","A1","ともだち (tomodachi)","friend","彼は私の友達です。","He is my friend.","",""],
      ["仕事","","Noun","A2","しごと (shigoto)","work / job","彼女は仕事が大好きです。","She loves her job.","",""],
      ["欲しい","","Adjective","A2","ほしい (hoshii)","to want (desire)","コーヒーが欲しいです。","I want a coffee.","i-adjective of desire",""],
      ["町","","Noun","A1","まち (machi)","town","京都は美しい町です。","Kyoto is a beautiful town.","",""],
      ["思う","","Verb","A2","おもう (omou)","to think","あなたは正しいと思います。","I think you are right.","〜と思う","思い"],
      ["子供","","Noun","A1","こども (kodomo)","child","子供が公園で遊んでいます。","The child is playing in the park.","",""],
      ["幸せ","","Adjective","A2","しあわせ (shiawase)","happy","会えてとても幸せです。","I am very happy to see you.","na-adjective",""],
      ["分かる","","Verb","A2","わかる (wakaru)","to understand","質問が分かりません。","I don't understand the question.","〜が分かる","分かり"],
      ["毎日","","Noun","A1","まいにち (mainichi)","every day","毎日日本語を勉強します。","I study Japanese every day.","adverbial noun",""],
      ["愛する","","Verb","B1","あいする (aisuru)","to love","日本の音楽を愛しています。","I love Japanese music.","suru-verb","愛し"],
      ["世界","","Noun","A2","せかい (sekai)","world","世界を旅行したいです。","I want to travel the world.","",""],
      ["探す","","Verb","A2","さがす (sagasu)","to look for","鍵を探しています。","I'm looking for my keys.","〜を探す","探し"],
      ["人生","","Noun","A2","じんせい (jinsei)","life","それが人生です。","That's life.","",""],
      ["よく","","Adverb","A2","yoku","often","週末によく会います。","We often meet on weekends.","also means 'well'",""],
      ["知る","","Verb","B1","しる (shiru)","to know","この町をよく知っています。","I know this town well.","知っている = to know","知って"],
      ["車","","Noun","A1","くるま (kuruma)","car","私の車は故障しています。","My car has broken down.","故障 = breakdown",""],
      ["新しい","","Adjective","A2","あたらしい (atarashii)","new","これは私の新しい電話です。","This is my new phone.","i-adjective",""],
      ["必要","","Adjective","B1","ひつよう (hitsuyō)","necessary / need","今、助けが必要です。","I need help now.","na-adj: 〜が必要",""],
      ["心","","Noun","B1","こころ (kokoro)","heart / mind","彼は心が広いです。","He is big-hearted.","心が広い = generous",""],
      ["言語","","Noun","A2","げんご (gengo)","language","日本語は美しい言語です。","Japanese is a beautiful language.","",""],
    ],
  };
})();
