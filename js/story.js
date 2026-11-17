// Vaishali's story: every personal text, photo and setting lives here.

/* =====================================================================
   ✏️  ALL THE PERSONAL CONTENT LIVES HERE: Vaishali's story.
   Lines marked TODO still need a real answer from you.
   ===================================================================== */
const GAME = {
  herName: "Vaishali",
  himName: "Prateek",                    // your character, riding beside her in the car
  yourName: "Babe, I really love you. You are the best thing that ever happened to me. 💗",   // the sign-off under the final letter
  lede: "Somewhere on a little fairy island, five letters are hidden. Roorkee and Chennai are 1,881 km apart, but on this island there is no distance at all. A tiny fairy named Lumi will guide you. Find every letter, and the last door will open… and someone will be waiting.",
  fairyName: "Lumi",

  chapters: [
    {
      place: "The Techfest Night", prompt: "Open the diary from that night",
      story: "IIT Patna’s techfest, the ghats of Banaras… and then the long way back to RJIT. That night, back at the hostel in Gwalior, a phone rang. The diary from that night is locked.",
      puzzle: { type: "code", clue: "The lock wants the night everything changed: the day and month you called me.\n(DD / MM)", answer: "2310",
        hint: "The night we got back from the IIT Patna techfest. October 2024…" },
      letter: { title: "Letter one · The call", photo: "photos/photo-20.jpg",
        text: "23 October 2024. We had just come back from Patna, I was tired and half asleep… and then your name lit up my phone.\nYou called, you said it, and I said yes before my brain even caught up.\nBest call I ever picked up. I’m still smiling about it." },
      word: "Sab"
    },
    {
      place: "The Ghats of Banaras", prompt: "Follow the flowers",
      story: "Even before that call, our story had quietly started somewhere holy, beside a big river, with way too many people around. Where was it?",
      puzzle: { type: "text", clue: "In which city did our bond really begin, on its ghats?",
        answers: ["banaras", "benaras", "banaras ghat", "banaras ghats", "varanasi", "kashi"], hint: "Ganga, ghats, and a seat beside you in someone else’s vehicle…" },
      letter: { title: "Letter two · Banaras", photo: "photos/photo-18.jpg",
        text: "Banaras. I still don’t know how I ended up sitting beside you in someone else’s vehicle.\nNot complaining, just saying… the universe clearly had a plan.\nThose ghats were the start of us, even before we knew it." },
      word: "thik"
    },
    {
      place: "The First Date", prompt: "Remember our first date",
      story: "Every love story has a first date. Ours had cheese, a very good offer, and two slightly nervous people. Where did we go?",
      puzzle: { type: "choice", clue: "Where was our very first date?",
        options: ["La Pino’z: buy 1 get 1 🍕", "Domino’s, the usual", "A fancy café in Gwalior", "The chai stall near college"],
        correct: 0, wrong: "Nope! Kya hua, bhool gayi? 😄 Think cheese… and a deal." },
      letter: { title: "Letter three · Buy 1 get 1", photo: "photos/photo-19.jpg",
        text: "Our first date: La Pino’z, buy 1 get 1.\nYou got a pizza and I got the best deal of my life. 😌\nAnd yes, bhukk lg rhi hai again just writing this." },
      word: "ho"
    },
    {
      place: "The Rishikesh Viewpoint", prompt: "Gather the scattered photo",
      story: "The mountain wind scattered our favourite view. Put Rishikesh back together, piece by piece.",
      puzzle: { type: "tiles", clue: "Tap two pieces to swap them until the picture is whole.", photo: "photos/photo-03.jpg" },
      letter: { title: "Letter four · Rishikesh", photo: "photos/photo-01.jpg",
        text: "Rishikesh: the café, the viewpoint, the river far below us.\nYou had your arm around me on that wall and I didn’t want the evening to end.\nOur first trip together. I’d go back tomorrow: same wall, same view, same you." },
      word: "jayega"
    },
    {
      place: "The Two Lighthouses", prompt: "Light the lighthouse",
      story: "Two lighthouses stand on far-apart shores, like Roorkee and Chennai, 1,881 km apart. Each one holds half of a secret password. You have one half. The other half is with me.",
      // she has to call Prateek to get the missing word ("mar"), so keep your phone with you
      puzzle: { type: "call", given: "chill", answer: "chill mar",
        clue: "Your lighthouse says: “chill ___”\nCall me to get the missing word. 😄" },
      letter: { title: "Letter five · Mumbai", photo: "photos/photo-15.jpg",
        text: "Thank you for calling. You know I just wanted to hear your voice for a minute.\nJuhu beach, the Taj lights, that Mumbai sea breeze… whenever we’re far apart, I think about that night by the sea.\nOne more door left." },
      word: "Vaishali"
    }
  ],

  // little romantic things to find around the island
  wishes: ["I wish for one city with both our names on the door. Not Roorkee, not Chennai: ours.",
    "I wish every end-sem ended with you waiting outside the exam hall.",
    "I wish for a hundred more buy-1-get-1 dates.",
    "I wish to go back to that Rishikesh wall. Same view, same us.",
    "I wish you’d stop pointing (toy) guns at me. Actually no, never stop. 😄"],
  swingMemory: "Remember when you secretly clicked me asleep on my notebook, with a flower in my hair? I only sleep that peacefully when you’re around.",
  fairyRing: "You stepped into a fairy ring! Legend says whoever stands here is loved more than all the stars above… and in your case, that’s simply true.",

  // ---- Our Moments gallery ----   (dates left empty where we don't know them yet)
  gallery: [
    { title:"Banaras, by accident", date:"Oct 2024", place:"Banaras", caption:"Somehow I ended up sitting right beside you, in someone else’s vehicle. Best accident ever.", photo:"photos/photo-18.jpg" },
    { title:"Our first date", date:"", place:"La Pino’z", caption:"Buy 1 get 1 pizza. Turns out I got the best deal of my life.", photo:"photos/photo-19.jpg" },
    { title:"Workshop partners", date:"", place:"RJIT, Gwalior", caption:"We conducted a workshop together, and I spent half of it looking at you instead of the slides.", photo:"photos/photo-20.jpg" },
    { title:"Team Robolution", date:"", place:"RJIT, Gwalior", caption:"Robots, wires, deadlines… and you, making all of it fun.", photo:"photos/photo-14.jpg" },
    { title:"Morning jog", date:"", place:"Around college", caption:"You, me, an empty road and red flowers. Best way to start a day.", photo:"photos/photo-13.jpg" },
    { title:"My secret picture", date:"", place:"The lab", caption:"You clicked me sleeping with a flower in my hair and thought I’d never find out.", photo:"photos/photo-11.jpg" },
    { title:"Smelling your hair", date:"", place:"Somewhere happy", caption:"Not even sorry. It’s my favourite smell.", photo:"photos/photo-09.jpg" },
    { title:"Happy us", date:"", place:"Just us", caption:"No reason, no occasion. Just us being happy.", photo:"photos/photo-08.jpg" },
    { title:"Piche wali pahadi", date:"", place:"The hill behind college", caption:"Sunset, dry trees, your smile and my best pout.", photo:"photos/photo-05.jpg" },
    { title:"Hands up!", date:"", place:"Somewhere very dangerous", caption:"You pointed a gun at me. I surrendered my heart a long time ago anyway.", photo:"photos/photo-06.jpg" },
    { title:"She wants to kill me", date:"", place:"The lab", caption:"Still alive. Still yours. 😄", photo:"photos/photo-10.jpg" },
    { title:"Delhi Metro", date:"", place:"Delhi", caption:"Roses for you, a thumbs up from me.", photo:"photos/photo-07.jpg" },
    { title:"Movie date", date:"", place:"The cinema", caption:"I don’t remember the movie. I remember your head on my shoulder.", photo:"photos/photo-12.jpg" },
    { title:"Rishikesh café", date:"", place:"Rishikesh", caption:"Your tongue out, my best smile. Our kind of photo.", photo:"photos/photo-01.jpg" },
    { title:"That look", date:"", place:"Rishikesh café", caption:"That look you give me right before you start laughing.", photo:"photos/photo-02.jpg" },
    { title:"The viewpoint", date:"", place:"Rishikesh", caption:"The whole valley in front of us, and I was still looking at you.", photo:"photos/photo-03.jpg" },
    { title:"Our first trip together", date:"", place:"Rishikesh", caption:"That laugh, with your eyes closed, is my favourite sound in the world.", photo:"photos/photo-04.jpg" },
    { title:"Juhu beach", date:"", place:"Mumbai", caption:"Waves behind us, the widest smiles in front.", photo:"photos/photo-17.jpg" },
    { title:"In front of the Taj", date:"", place:"Mumbai", caption:"Mumbai lights, sea breeze and your head on my shoulder.", photo:"photos/photo-15.jpg" },
  ],

  // ---- The Map of Us: places we've been together ----
  places: [
    { name:"Where it quietly began", city:"Banaras", lat:25.31, lon:83.01, date:"Oct 2024", note:"The ghats, the crowd, and me somehow sitting beside you in someone else’s vehicle.", photo:"photos/photo-18.jpg" },
    { name:"The techfest", city:"IIT Patna", lat:25.54, lon:84.85, date:"Oct 2024", note:"Good conversations, better interactions… and a few days later, you called.", photo:"" },
    { name:"Our college", city:"RJIT, Gwalior", lat:26.01, lon:78.25, date:"", note:"The hostel call, our first date, the workshop, Team Robolution, morning jogs and the hill behind college.", photo:"photos/photo-20.jpg" },
    { name:"Roses in the metro", city:"Delhi", lat:28.61, lon:77.21, date:"", note:"You with roses, me with a thumbs up.", photo:"photos/photo-07.jpg" },
    { name:"Our first trip", city:"Rishikesh", lat:30.09, lon:78.27, date:"", note:"The café, the viewpoint above the river, and the whole valley in front of us.", photo:"photos/photo-03.jpg" },
    { name:"Mumbai nights", city:"Mumbai", lat:19.01, lon:72.83, date:"", note:"Juhu beach after dark with the waves behind us… and the Taj, where I got down on one knee.", photo:"photos/photo-15.jpg" },
  ],

  // ---- little messages hidden in the new, outer parts of the island ----
  world: {
    lookout: "Up here it feels like that viewpoint in Rishikesh: the whole valley in front of us, and I was still looking at you.",
    lagoon: "The moon looks at its reflection in this lagoon every night. I do the same with your photos. Kya karu, aadat ho gayi hai.",
    cafe: "Table for two, one buy-1-get-1 pizza, extra cheese. Bhukk lg rhi hai… chalo, our usual? 🍕",
    pier: "Juhu beach at night: the waves behind us and the widest smiles in front. Let’s go back there someday.",
    ferris: "If I could stop this wheel at the very top, I’d keep us there forever. No exams, no distance, just us.",
    lanterns: "Every lantern carries one wish. Mine are all the same: you, me, and no more distance between Roorkee and Chennai.",
    dance: "Dance with me like nobody’s watching. (Lumi is. She’s smiling.)",
    lanternBench: "Sit with me. Let’s count the lanterns until we run out of numbers.",
    fireworksText: "I LOVE U",   // written in fireworks at the end of the grand show (keep it short)
    telescope: "Out of all the stars up there, you’re still the one I look for first.",
    falls: "Sit with me for a minute and listen to the water. Whatever is going on… chill mar, sab thik ho jayega.",
  },

  // ---- ⛏️ "Our Block World": a little Minecraft-style corner, because she loves Minecraft ----
  blockworld: {
    name: "Our Block World",
    sign: ["Our World", "V ♥ P", "Seed: 23-10-2024"],          // the wooden sign (the seed = the day we first talked)
    welcome: "Welcome to <b>our little block world</b> ⛏️ Mine the ore pile, craft something at the table, and say hi to the Creeper. He’s friendly… mostly.",
    notes: [                                                     // what she finds when she mines a block
      "You mined: 1× La Pino’z slice. Buy one, get one — just like us. 🍕",
      "You mined: “Kya hua?” — two words that always make everything okay.",
      "You mined: 1× Banaras memory. Rare drop. Never despawns. 🛕",
      "You mined: “Sab thik ho jayega.” Durability: forever.",
      "You mined: 1× “Bhukk lg rhi hai”. Please craft food immediately. 🍜",
      "You mined: 1× techfest pass, IIT Patna. Where our quest began. 🎟️",
      "You mined: 1× Rishikesh sunrise. Stacks up to 64. ☀️",
      "You mined: gold! Still not as golden as your laugh. ✨",
      "You mined: 1× late-night call. Effect: Regeneration II. 📞",
      "You mined: 1× “chill mar”. It works every time. Somehow. 😌",
      "You mined: 1× Juhu beach wave. 🌊",
    ],
    diamond: "💎 DIAMONDS! …and still not as rare as you. You’re my diamond, Vaishali.",
    creeper: "💥💗 Sssss… POP! That’s exactly what my heart does every time you call.",
    sheep: "🐑💗 A pink sheep! Only about 1 in 600 sheep is pink. Even rarer: a girl like you.",
    bed: "🛏️ Respawn point set. Wherever you are, I’ll always find my way back to you.",
    crafted: "💗 You crafted: a heart. It was always yours anyway.",
    craftedDiamond: "💎💗 You crafted: a Diamond Heart! Unbreakable, enchanted, and only for you.",
    joined: "Prateek joined the game",                             // shown when he walks out of the Last Door
  },

  // love coupons hidden in the gift boxes in the meadow (one per box she opens)
  gifts: [
    { icon:"🤗", text:"One hug that lasts as long as you want. No time limit." },
    { icon:"🍕", text:"One buy-1-get-1 pizza date, and this time I pay for both." },
    { icon:"📞", text:"One call where I don’t say “chill mar” even once. (I’ll try.)" },
    { icon:"🎬", text:"One movie date. You pick the movie, I won’t complain." },
    { icon:"🌸", text:"One flower for your hair, picked by me." },
    { icon:"💆", text:"One long head massage. Hair-smelling included. 😄" },
  ],

  // hidden notes on the back of the Polaroids she takes (📸 / P), used in turn
  snapNotes: [
    "Kya hua? Smile kar, you look perfect 😄",
    "Add this one to the wall in our future home, okay?",
    "Chill mar, this picture is already my favourite.",
    "Roorkee to Chennai is 1,881 km. This photo makes it feel like zero.",
    "One day we’ll take this exact picture together, for real.",
    "Proof that you make everything glow.",
    "Keep this one. I’m keeping you.",
    "Wish you were here? I wish I was there.",
  ],

  // ---- your own music ----
  // Put MP3 (or M4A) files in the "music" folder and list them here. They play in this order when the
  // game starts, and the jukebox skips to the next one. The built-in tunes play after them.
  music: [
    // { title: "Our song", file: "music/our-song.mp3" },
    // { title: "The song from our first date", file: "music/first-date.mp3" },
  ],
  finaleSong: "",   // e.g. "music/our-song.mp3": starts playing when the Last Door opens (leave "" for none)

  door: { place: "The Last Door" },
  finale: {
    title: "Happy 2nd anniversary",
    revealLabel: "Next time I’ll be standing right in front of you:",
    revealDate: "End-sem exams 🤞",
    photo: "photos/photo-16.jpg",
    text: "Two years since that call on the 23rd of October. You asked me first, on the phone, and I said yes. Then in Mumbai, in front of the Taj, it was my turn to ask you, on one knee.\n\nRoorkee and Chennai are 1,881 km apart, and you still never feel far. Whenever things get hard, remember what I always say: chill mar, sab thik ho jayega.\n\nI love you, Vaishali. Always.",
  }
};
/* ===================================================================== */
