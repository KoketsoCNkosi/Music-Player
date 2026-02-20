const musicLibrary = [
  // ── DRAKE ──────────────────────────────────────────────────
  { id:1,  title:"God's Plan",         artist:"Drake",           album:"Scary Hours",           year:2018, genre:"rap",   duration:"3:19", color:"#1a1a2e", accent:"#e94560", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id:2,  title:"Knife Talk",         artist:"Drake",           album:"Certified Lover Boy",   year:2021, genre:"rap",   duration:"2:41", color:"#0d0d0d", accent:"#c9a84c", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id:3,  title:"Rich Flex",          artist:"Drake & 21 Savage",album:"Her Loss",             year:2022, genre:"rap",   duration:"3:57", color:"#111111", accent:"#ff6b35", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id:4,  title:"Search & Rescue",    artist:"Drake",           album:"For All The Dogs",      year:2023, genre:"rap",   duration:"3:35", color:"#0a0a1a", accent:"#7b61ff", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id:5,  title:"Calling My Name",    artist:"Drake",           album:"Certified Lover Boy",   year:2021, genre:"rap",   duration:"3:11", color:"#150010", accent:"#e94560", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },

  // ── GUNNA ──────────────────────────────────────────────────
  { id:6,  title:"pushin P",           artist:"Gunna",           album:"DS4EVER",               year:2022, genre:"trap",  duration:"2:30", color:"#0a1628", accent:"#00d4ff", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id:7,  title:"banking on me",      artist:"Gunna",           album:"Drip Season 4Ever",     year:2021, genre:"trap",  duration:"2:33", color:"#1a0a00", accent:"#ffd700", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id:8,  title:"fukumean",           artist:"Gunna",           album:"a Gift & a Curse",      year:2023, genre:"trap",  duration:"2:10", color:"#001a0a", accent:"#39ff14", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id:9,  title:"private island",     artist:"Gunna",           album:"a Gift & a Curse",      year:2023, genre:"trap",  duration:"2:52", color:"#0d0d20", accent:"#c9a84c", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { id:10, title:"livin wild",         artist:"Gunna",           album:"Wunna",                 year:2020, genre:"trap",  duration:"2:43", color:"#1a0010", accent:"#ff4f7b", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },

  // ── PARTYNEXTDOOR ──────────────────────────────────────────
  { id:11, title:"Come and See Me",    artist:"PARTYNEXTDOOR",   album:"PARTYMOBILE",           year:2020, genre:"rnb",   duration:"4:04", color:"#0a0a0a", accent:"#9b59b6", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
  { id:12, title:"Loyal",              artist:"PARTYNEXTDOOR",   album:"P3",                    year:2016, genre:"rnb",   duration:"4:30", color:"#050510", accent:"#3498db", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  { id:13, title:"Freak in You",       artist:"PARTYNEXTDOOR",   album:"PARTYMOBILE",           year:2020, genre:"rnb",   duration:"3:52", color:"#150508", accent:"#e74c3c", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id:14, title:"Wus Good / Curious", artist:"PARTYNEXTDOOR",   album:"P3",                    year:2016, genre:"rnb",   duration:"5:00", color:"#0a100a", accent:"#2ecc71", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },

  // ── YOUNG THUG ─────────────────────────────────────────────
  { id:15, title:"Hot",                artist:"Young Thug",      album:"So Much Fun",           year:2019, genre:"trap",  duration:"2:42", color:"#100a00", accent:"#f39c12", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id:16, title:"Tick Tock",          artist:"Young Thug",      album:"Punk",                  year:2021, genre:"trap",  duration:"2:29", color:"#0a0a1a", accent:"#1abc9c", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },

  // ── TRAVIS SCOTT ───────────────────────────────────────────
  { id:17, title:"SICKO MODE",         artist:"Travis Scott",    album:"ASTROWORLD",            year:2018, genre:"rap",   duration:"5:12", color:"#050510", accent:"#ff6b35", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id:18, title:"goosebumps",         artist:"Travis Scott",    album:"Birds in the Trap",     year:2016, genre:"rap",   duration:"4:04", color:"#100505", accent:"#c0392b", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id:19, title:"HIGHEST IN THE ROOM",artist:"Travis Scott",    album:"JACKBOYS",              year:2019, genre:"trap",  duration:"3:07", color:"#050015", accent:"#8e44ad", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },

  // ── LIL BABY ───────────────────────────────────────────────
  { id:20, title:"Drip Too Hard",      artist:"Lil Baby",        album:"Street Gossip",         year:2018, genre:"trap",  duration:"2:28", color:"#001010", accent:"#00d4ff", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id:21, title:"Sum 2 Prove",        artist:"Lil Baby",        album:"My Turn",               year:2020, genre:"trap",  duration:"3:08", color:"#0a0800", accent:"#e67e22", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },

  // ── 21 SAVAGE ──────────────────────────────────────────────
  { id:22, title:"a lot",              artist:"21 Savage",       album:"I Am > I Was",          year:2018, genre:"rap",   duration:"4:20", color:"#050505", accent:"#bdc3c7", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
  { id:23, title:"Ball w/o You",       artist:"21 Savage",       album:"Savage Mode II",        year:2020, genre:"rap",   duration:"2:37", color:"#0a0508", accent:"#e74c3c", url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
];

window.musicLibrary = musicLibrary;
