/* =========================================================
   Language pack: Mandarin Chinese (zh)
   Registered on the shared window.LeTrainer.langs registry.
   Notes:
     • No grammatical gender / articles.
     • No spaces; cloze relies on CJK substring matching (every CJK char
       is a word boundary to the matcher).
     • Verbs do NOT conjugate, so the dictionary word appears verbatim in
       the sentence — no inflection field is ever needed.
     • The `ipa` field carries pinyin (with tone marks).
     • Levels map HSK → CEFR-ish so the level filter works: HSK1≈A1,
       HSK2≈A2, HSK3≈B1.
   Deck rows: [word, "article|gender", pos, level, reading,
               meaning, sentence, translation, notes, inflection]
   ========================================================= */
(() => {
  const ns = (window.LeTrainer = window.LeTrainer || { langs: {} });

  // Chinese is uninflected — identity stem. Exact substring matching does
  // all the work (CJK chars are treated as boundaries by the matcher).
  function stem(word) { return String(word || "").trim(); }

  ns.langs.zh = {
    code: "zh",
    name: "中文",
    tagline: "Mandarin · Spaced Repetition",
    flag: ["#DE2910", "#FFDE00", "#DE2910"],
    voiceLang: "zh-CN",
    voiceMatch: /^zh/i,
    ui: {
      listen: "🔊 听",
      slow: "🐢 慢速",
      doneTitle: "本节完成！",
      doneSub: "No more cards due right now. 做得好！",
      testPhrase: "你好。我说中文。",
    },
    genders: [{ v: "", t: "— none —" }],
    stem,
    deck: [
      ["水","","Noun","A1","shuǐ","water","我每天喝水。","I drink water every day.","",""],
      ["住","","Verb","A1","zhù","to live (reside)","我住在北京。","I live in Beijing.","住在 = to live in",""],
      ["总是","","Adverb","A1","zǒngshì","always","他总是迟到。","He is always late.","",""],
      ["希望","","Noun","B1","xīwàng","hope","她没有失去希望。","She hasn't lost hope.","also a verb: to hope",""],
      ["成为","","Verb","B1","chéngwéi","to become","我想成为医生。","I want to become a doctor.","",""],
      ["家","","Noun","A1","jiā","home / family","我回家了。","I went home.","了 = completed action",""],
      ["吃","","Verb","A1","chī","to eat","我喜欢吃中国菜。","I like to eat Chinese food.","吃饭 = to eat (a meal)",""],
      ["美丽","","Adjective","A2","měilì","beautiful","多么美丽的风景啊！","What a beautiful landscape!","",""],
      ["时间","","Noun","A2","shíjiān","time","我今天没有时间。","I don't have time today.","",""],
      ["说","","Verb","A1","shuō","to speak / say","你能说慢一点吗？","Can you speak more slowly?","",""],
      ["朋友","","Noun","A1","péngyǒu","friend","他是我最好的朋友。","He is my best friend.","",""],
      ["工作","","Noun","A2","gōngzuò","work / job","她热爱她的工作。","She loves her work.","also a verb: to work",""],
      ["想","","Verb","A2","xiǎng","to want / think","我想要一杯咖啡。","I want a cup of coffee.","想要 = would like",""],
      ["城市","","Noun","A1","chéngshì","city","上海是一个美丽的城市。","Shanghai is a beautiful city.","",""],
      ["认为","","Verb","A2","rènwéi","to think (believe)","我认为你是对的。","I think you are right.","",""],
      ["孩子","","Noun","A1","háizi","child","孩子在公园里玩。","The child plays in the park.","",""],
      ["高兴","","Adjective","A2","gāoxìng","happy","见到你我很高兴。","I am very happy to see you.","",""],
      ["明白","","Verb","A2","míngbái","to understand","我不明白这个问题。","I don't understand this question.","",""],
      ["天","","Noun","A1","tiān","day","每天都是新的机会。","Every day is a new chance.","每天 = every day",""],
      ["爱","","Verb","A1","ài","to love","我爱中国音乐。","I love Chinese music.","",""],
      ["世界","","Noun","A2","shìjiè","world","我想环游世界。","I want to travel the world.","",""],
      ["找","","Verb","A2","zhǎo","to look for","我在找我的钥匙。","I'm looking for my keys.","",""],
      ["生活","","Noun","A2","shēnghuó","life","这就是生活！","That's life!","also a verb: to live",""],
      ["经常","","Adverb","A2","jīngcháng","often","我们周末经常见面。","We often meet on weekends.","",""],
      ["认识","","Verb","B1","rènshi","to know (a person)","我认识他很多年了。","I have known him for many years.","认识 people; 知道 facts",""],
      ["车","","Noun","A1","chē","car","我的车坏了。","My car is broken.","坏了 = broken",""],
      ["新","","Adjective","A2","xīn","new","这是我的新手机。","This is my new phone.","",""],
      ["需要","","Verb","B1","xūyào","to need","我现在需要帮助。","I need help now.","",""],
      ["心","","Noun","B1","xīn","heart","他有一颗善良的心。","He has a kind heart.","一颗心 (measure word 颗)",""],
      ["语言","","Noun","A2","yǔyán","language","中文是一门美丽的语言。","Chinese is a beautiful language.","一门语言 (measure word 门)",""],
    ],
  };
})();
