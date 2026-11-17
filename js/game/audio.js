// Generated music, songs, engine sound and sound effects.

/* ============================ AUDIO ============================ */
let actx=null, master=null, musicOn=true, musicTimer=null;
function initAudio(){
  if (actx) return; try { actx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){ return; }
  master = actx.createGain(); master.gain.value = .5;
  const delay = actx.createDelay(); delay.delayTime.value = .33; const fb = actx.createGain(); fb.gain.value = .32;
  delay.connect(fb); fb.connect(delay); master.connect(actx.destination); master.connect(delay); delay.connect(actx.destination);
}
function note(freq, when=0, dur=1.6, vol=.12, type="sine", dest=master){
  if (!actx) return; const t=actx.currentTime+when;
  const o=actx.createOscillator(), g=actx.createGain(); o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+.05);
  const o2=actx.createOscillator(), g2=actx.createGain(); o2.frequency.value=freq*2; g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(vol*.25,t+.01); g2.gain.exponentialRampToValueAtTime(.0005,t+dur*.6);
  o2.connect(g2); g2.connect(dest); o2.start(t); o2.stop(t+dur);
}
// Each built-in song plays through its own volume channel, so it can be silenced instantly
// (its notes are queued ~10 s ahead). Sound effects like chimes don't use it.
let songBus = null;
function stopMusic(){
  clearTimeout(musicTimer); songT0 = 0; audioEl.pause();
  if (songBus && actx){ const b=songBus; b.gain.setTargetAtTime(0, actx.currentTime, .06); setTimeout(()=>b.disconnect(), 400); }
  songBus = null;
}
function chime(f, when=0){ note(f, when, 1.2, .1, "triangle"); }
let eng = null;
function initEngine(){ if(!actx || eng) return; try {
  const o=actx.createOscillator(), o2=actx.createOscillator(), fl=actx.createBiquadFilter(), g=actx.createGain();
  o.type="sawtooth"; o2.type="triangle"; fl.type="lowpass"; fl.frequency.value=260; g.gain.value=0;
  o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(actx.destination); o.start(); o2.start(); eng={o,o2,fl,g}; } catch(e){} }
function updateEngine(){ if(!eng) return; const n=actx.currentTime, sp=Math.abs(C.vF);
  eng.o.frequency.setTargetAtTime(48+sp*7+Math.abs(C.throttle)*8, n, .08); eng.o2.frequency.setTargetAtTime(96+sp*14, n, .08);
  eng.fl.frequency.setTargetAtTime(220+sp*55, n, .1);
  eng.g.gain.setTargetAtTime((!playing||frozen||!driving||document.hidden)?0:(.018+Math.min(1,sp/13)*.035+Math.abs(C.throttle)*.012), n, .12); }
function thud(k){ if(!actx) return; try { const len=Math.floor(.2*actx.sampleRate), b=actx.createBuffer(1,len,actx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
  const s=actx.createBufferSource(); s.buffer=b; const fl=actx.createBiquadFilter(); fl.type="lowpass"; fl.frequency.value=300+k*90;
  const g=actx.createGain(); g.gain.value=Math.min(.45,.06+k*.05); s.connect(fl); fl.connect(g); g.connect(actx.destination); s.start(); } catch(e){} }
// ---- songs (original melodies, generated live) ----
function songLullaby(){ const ev=[]; [[72,0],[76,.5],[79,1],[84,1.5],[79,2],[76,2.5],[77,3],[81,3.5],[84,4],[81,4.5],[79,5],[76,5.5],[74,6],[77,6.5],[79,7],[71,7.5],
  [72,8],[76,8.5],[79,9],[84,9.5],[86,10],[84,10.5],[81,11],[79,11.5],[77,12],[76,12.5],[74,13],[71,13.5],[72,14]].forEach(([m,b])=>ev.push([m,b,1.8,.07,"sine"]));
  [[48,0],[45,4],[41,6],[43,7],[48,8],[45,10],[41,12],[43,13],[48,14]].forEach(([m,b])=>ev.push([m,b,3,.05,"triangle"])); return ev; }
function songPop(){ const ev=[], prog=[[55,59,62],[50,54,57],[52,55,59],[48,52,55]], mel=[74,76,79,76,74,71,74,76, 79,81,79,76,74,76,74,71];
  prog.forEach((ch,c)=>{ for(let k=0;k<8;k++) ev.push([ch[k%3]+12*(k%4===3?1:0), c*4+k*.5, .45, .045, "triangle"]); ev.push([ch[0]-12, c*4, 1.6, .07, "sine"]); ev.push([ch[0]-12, c*4+2, 1.6, .06, "sine"]); });
  mel.forEach((m,k)=>ev.push([m, k, .8, .06, "sine"])); return ev; }
function songLofi(){ const ev=[], prog=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]];
  prog.forEach((ch,c)=>{ ch.forEach((m,k)=>ev.push([m, c*4+k*.08, 3.6, .028, "sine"])); ev.push([ch[0]-12, c*4, 1.2, .08, "sine"]); ev.push([ch[0]-12, c*4+2.5, .8, .06, "sine"]);
    ev.push([33, c*4, .25, .12, "sine"]); ev.push([33, c*4+2, .25, .1, "sine"]); });
  [[76,1],[74,2.5],[72,5],[71,6.5],[74,9],[72,10.5],[69,13],[67,14.5]].forEach(([m,b])=>ev.push([m,b,1.4,.05,"triangle"])); return ev; }
function songWaltz(){ const ev=[], prog=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]], mel=[[76,0],[79,1],[77,2],[76,3],[72,4],[74,5],[72,6],[69,7],[72,8],[77,9],[76,10],[74,11]];
  prog.forEach((ch,c)=>{ ev.push([ch[0]-12, c*3, 1.2, .07, "sine"]); [1,2].forEach(b=>ch.forEach(m=>ev.push([m+12, c*3+b, .5, .025, "triangle"]))); });
  mel.forEach(([m,b])=>ev.push([m,b,1,.065,"sine"])); return ev; }
const SONGS = [
  { name:"Music-box lullaby", beat:.62, len:16, ev:songLullaby() },
  { name:"Our first call", beat:.54, len:16, ev:songPop() },
  { name:"Late-night lo-fi", beat:.78, len:16, ev:songLofi() },
  { name:"Waltz for two", beat:.55, len:12, ev:songWaltz() },
];
// ---- the playlist: YOUR songs from story.js (GAME.music) first, then the built-in ones ----
const PLAYLIST = [ ...(GAME.music || []).filter(s => s && s.file).map(s => ({ name:s.title || s.file, file:s.file })), ...SONGS ];
let songIdx = 0, songT0 = 0;
const mtof = m => 440*Math.pow(2,(m-69)/12);
const audioEl = new Audio(); audioEl.preload = "auto";
let musicGain = null, analyser = null, fbins = null, missing = new Set();
function hookAudioEl(){   // your songs go through an analyser so the dance floor can follow the real beat
  if (musicGain || !actx) return;
  try { const src = actx.createMediaElementSource(audioEl); analyser = actx.createAnalyser(); analyser.fftSize = 256; fbins = new Uint8Array(analyser.frequencyBinCount);
    musicGain = actx.createGain(); musicGain.gain.value = .85; src.connect(analyser); analyser.connect(musicGain); musicGain.connect(actx.destination); } catch(e){}
}
audioEl.addEventListener("ended", () => { if (musicOn) nextSong(false); });
audioEl.addEventListener("error", () => { const S=PLAYLIST[songIdx]; if (S && S.file && !missing.has(S.file)){ missing.add(S.file);
  console.warn("Couldn't play " + S.file + " — check the file name in js/story.js"); if (musicOn) nextSong(false); } });
function playSong(){
  if (!actx || !musicOn) return; clearTimeout(musicTimer);
  if (PLAYLIST.every(s => s.file && missing.has(s.file))) return;
  const S = PLAYLIST[songIdx];
  if (S.file){ if (missing.has(S.file)) { nextSong(false); return; }
    hookAudioEl(); if (!audioEl.src.endsWith(S.file)) audioEl.src = S.file; audioEl.play().catch(()=>{}); return; }
  audioEl.pause(); songT0 = actx.currentTime;
  if (!songBus){ songBus = actx.createGain(); songBus.connect(master); }
  S.ev.forEach(([m,b,d,v,w])=> note(mtof(m), b*S.beat, d*S.beat*1.4, v, w, songBus));
  musicTimer = setTimeout(playSong, S.len*S.beat*1000);
}
function nextSong(announce){
  songIdx = (songIdx+1) % PLAYLIST.length; stopMusic(); audioEl.removeAttribute("src");
  setTimeout(playSong, 120); if (announce) toast("🎵 Now playing: " + PLAYLIST[songIdx].name, 3200);
}
function changeSong(){
  initAudio(); if (actx) actx.resume(); musicOn = true; $("#music").style.opacity = 1;
  nextSong(true); burst(jukeG.position.clone().add(new THREE.Vector3(0,2.6,0)), 16, "#ff9ec0", true, .8);
}
// play one particular song file now (used for the finale song)
function playSongFile(file){
  if (!file) return; initAudio(); if (actx) actx.resume(); musicOn = true; $("#music").style.opacity = 1;
  let i = PLAYLIST.findIndex(s => s.file === file); if (i < 0){ PLAYLIST.unshift({ name:file, file }); i = 0; }
  songIdx = i; stopMusic(); audioEl.removeAttribute("src"); playSong();
}
// [beat number, how far into the beat 0..1] for the dance floor, or null when nothing is playing
const beat = { idx:0, last:0, avg:0 };
function musicBeat(){
  if (!actx || !musicOn) return null;
  const S = PLAYLIST[songIdx];
  if (S.file){ if (!analyser || audioEl.paused) return null;
    analyser.getByteFrequencyData(fbins); let e=0; for (let i=1;i<7;i++) e+=fbins[i]; e/=6;
    const now = actx.currentTime; beat.avg = beat.avg*.94 + e*.06;
    if (e > beat.avg*1.18 && e > 50 && now - beat.last > .3){ beat.idx++; beat.last = now; }
    return [beat.idx, Math.min(1, (now - beat.last)/.5)]; }
  if (songT0 > 0){ const bt=(actx.currentTime-songT0)/S.beat; return [Math.floor(bt), bt-Math.floor(bt)]; }
  return null;
}
$("#music").onclick = () => { initAudio(); musicOn=!musicOn; $("#music").style.opacity = musicOn?1:.45; stopMusic(); if(musicOn){ actx.resume(); playSong(); } };
