// Start, letters, puzzles and the finale.

/* ============================ FLOW ============================ */
let introCam = true;
$("#start").onclick = () => {
  initAudio(); if (actx) actx.resume(); if (musicOn) playSong();
  $("#title").classList.add("off"); introCam = false; playing = true;
  camYaw = C.heading + Math.PI; initEngine();
  setTimeout(()=>{ $("#hud").classList.remove("off"); tagBox.classList.remove("off"); }, 900);
  $("#help").textContent = isTouch ? "Push the joystick where you want to go · tap the ground to go there · ⚡ turbo · 🚶 walk together" : "WASD / arrows to drive · Shift turbo · F get out & walk · E or click to use things · M map · P Polaroid · drag to look";
  setTimeout(()=>$("#help").classList.add("off"), 9000);
  refresh();
  setTimeout(()=> say(solved.length ? `Welcome back, <b>${GAME.herName}</b>! Let’s keep looking — follow the golden light.` :
    `Hi <b>${GAME.herName}</b>! I’m ${GAME.fairyName} ✨ Someone hid five letters on this island just for you… and <b>${GAME.himName}</b> is riding with you. Follow the golden light!`, 6500), 1400);
  setTimeout(()=> say(isTouch ? "Want to stroll together? Tap 🚶 to get out and walk side by side 💗" : "Want to stroll together? Press <b>F</b> (or 🚶) to get out and walk 💗", 6000), 34000);
  setTimeout(()=> say("This island is big! Follow the roads, or tap 🗺 at the top to see everything and jump anywhere ✨", 5500), 10500);
  setTimeout(()=> say(`There’s a gallery of our moments 🖼️, a music corner 🎵, a map of our trips 📍… and ${HEARTS_N} floating hearts to find 💗`, 6500), 18000);
  setTimeout(()=> say("Out past the ring road: a starry hill ⭐, a moon lagoon 🌙, a waterfall 💧, a fairy village 🏡, a forest full of fireflies 🌲 and a pier with a Ferris wheel 🎡", 7500), 26000);
};
$("#reset").onclick = () => { if(confirm("Start the whole search again?")){ solved=[]; save(); refresh(); C.pos.set(START.x,0,START.z); C.vel.set(0,0,0); C.heading=Math.PI; props.forEach(respawn); say("A fresh start! Follow the golden light ✨"); } };

/* ---------- sheets ---------- */
const sheet = $("#sheet");
function openScene(html){
  const sce=$("#scene"); sce.classList.remove("desk","folding"); const dk=$("#deck"); if (dk) dk.remove();
  sheet.innerHTML = `<button class="close" type="button" aria-label="Back to the island">×</button>` + html;
  sheet.querySelector(".close").onclick = closeScene;
  $("#scene").classList.remove("off"); sheet.scrollTop = 0; frozen = true; tagBox.classList.add("off");
}
function closeScene(){
  // on a wide screen the letter folds itself away first
  const sce=$("#scene");
  if (sce.classList.contains("folding")) return;
  if (sce.classList.contains("desk")){ sce.classList.add("folding"); chime(523);
    setTimeout(()=>{ sce.classList.remove("folding","desk"); const dk=$("#deck"); if (dk) dk.remove(); closeScene(); }, 400); return; }
  $("#scene").classList.add("off"); frozen = false; tagBox.classList.remove("off"); refresh(); current = null;
  if (justWon !== null){ const n=nextIdx();
    say(n<total ? `You found the word <b>“${GAME.chapters[justWon].word}”</b>! Next: <b>${GAME.chapters[n].place}</b> ✨` : `All five words! The <b>Last Door</b> in the middle of the island is glowing… 💗`, 6000);
    justWon = null; }
}
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !$("#scene").classList.contains("off") && !finaleOn) closeScene();
  if (panelKind){ if (e.key==="Escape") closePanel(); if (panelKind==="gallery"){ if (e.key==="ArrowRight"){ e.preventDefault(); galNav(1); } if (e.key==="ArrowLeft"){ e.preventDefault(); galNav(-1); } } } });
let justWon = null;

function nl(s){ return s.replace(/\n/g,"<br>"); }
function esc(s){ return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function openChapter(i){
  const c = GAME.chapters[i];
  if (solved.includes(i)) { showLetter(i); return; }
  const p = c.puzzle;
  openScene(`
    <p class="chapter">Chapter ${i+1} of ${total}</p>
    <h3>${esc(c.place)}</h3>
    <p class="story">${esc(c.story)}</p>
    <p class="clue">${nl(esc(p.clue))}</p>
    <div id="pz"></div>
    <p class="feedback" id="fb" aria-live="polite"></p>
    ${p.hint ? `<button class="btn ghost" id="hintBtn" type="button">Show a hint</button><p class="hint" id="hintTxt" hidden>${esc(p.hint)}</p>` : ""}
  `);
  if (p.hint) $("#hintBtn").onclick = () => { $("#hintTxt").hidden=false; $("#hintBtn").remove(); };
  ({code:pzCode, text:pzText, choice:pzChoice, tiles:pzTiles, call:pzCall})[p.type](p, () => win(i));
}

function wrong(msg){
  const fb=$("#fb"); fb.textContent = msg; sheet.classList.remove("shake"); void sheet.offsetWidth; sheet.classList.add("shake");
}

function pzCode(p, ok){
  const digits=[0,0,0,0];
  $("#pz").innerHTML = `<div class="lock">${digits.map((d,k)=>`${k===2?'<span class="gap">/</span>':''}
    <div class="dial"><button type="button" data-k="${k}" data-d="1" aria-label="Digit ${k+1} up">▲</button>
    <output id="dg${k}">0</output><button type="button" data-k="${k}" data-d="-1" aria-label="Digit ${k+1} down">▼</button></div>`).join("")}</div>
    <div class="row" style="justify-content:center"><button class="btn" id="tryCode" type="button">Open the diary</button></div>`;
  $("#pz").querySelectorAll(".dial button").forEach(b=>b.onclick=()=>{
    const k=+b.dataset.k; digits[k]=(digits[k]+ +b.dataset.d+10)%10; $("#dg"+k).textContent=digits[k]; $("#fb").textContent=""; });
  $("#tryCode").onclick=()=> digits.join("")===p.answer ? ok() : wrong("The lock doesn’t budge. Think back to that night…");
}

function norm(s){ return s.toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim(); }
function pzText(p, ok){
  $("#pz").innerHTML = `<div class="row"><input class="answer" id="ans" autocomplete="off" aria-label="Your answer" placeholder="Type your answer">
    <button class="btn" id="tryTxt" type="button">Check</button></div>`;
  const go=()=> p.answers.map(norm).includes(norm($("#ans").value)) ? ok() : wrong("Not that one. The flowers are giggling at you.");
  $("#tryTxt").onclick=go; $("#ans").onkeydown=e=>{ if(e.key==="Enter") go(); };
  setTimeout(()=>$("#ans").focus(),300);
}

function pzChoice(p, ok){
  $("#pz").innerHTML = `<div class="choices">${p.options.map((o,k)=>`<button type="button" data-k="${k}">${esc(o)}</button>`).join("")}</div>`;
  $("#pz").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    if(+b.dataset.k===p.correct) ok(); else { b.classList.add("no"); b.disabled=true; wrong(p.wrong); } });
}

function placeholderPicture(){
  const c=document.createElement("canvas"); c.width=c.height=600; const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,600,600); g.addColorStop(0,"#f7b7c3"); g.addColorStop(.55,"#c9b4ec"); g.addColorStop(1,"#7f74c4");
  x.fillStyle=g; x.fillRect(0,0,600,600);
  x.fillStyle="rgba(255,255,255,.85)"; x.beginPath(); x.arc(470,120,55,0,7); x.fill();
  x.fillStyle="#3e3878"; x.fillRect(0,430,600,170);
  x.strokeStyle="rgba(255,255,255,.5)"; x.lineWidth=5;
  for(let r=0;r<4;r++){ x.beginPath(); for(let i=0;i<=600;i+=10) x.lineTo(i,450+r*40+Math.sin(i/30+r)*8); x.stroke(); }
  x.fillStyle="#ef6f8a"; x.save(); x.translate(300,280); x.scale(4.5,4.5); x.beginPath();
  x.moveTo(0,11); x.bezierCurveTo(-14,1,-12,-11,-5,-11); x.bezierCurveTo(-2,-11,0,-8,0,-6); x.bezierCurveTo(0,-8,2,-11,5,-11); x.bezierCurveTo(12,-11,14,1,0,11); x.fill(); x.restore();
  x.fillStyle="#3b2f3f"; x.font="bold 46px Georgia"; x.textAlign="center"; x.fillText("Goa · our first trip",300,90);
  return c.toDataURL("image/jpeg",.85);
}
function pzTiles(p, ok){
  let img = p.photo || placeholderPicture();
  // a real photo is cropped to a square from its middle, so the pieces aren't stretched
  if (p.photo){ const im=new Image(); im.onload=()=>{ try { const s=Math.min(im.width,im.height), c=document.createElement("canvas"); c.width=c.height=600;
      c.getContext("2d").drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,600,600); img=c.toDataURL("image/jpeg",.88);
      // pieces that look the same (e.g. plain sky) count as interchangeable, so a picture that looks whole is whole
      const sm=document.createElement("canvas"); sm.width=sm.height=24; const sx=sm.getContext("2d"); sx.drawImage(c,0,0,24,24); const d=sx.getImageData(0,0,24,24).data;
      const tile=k=>{ const v=[]; for(let y=0;y<8;y++) for(let x=0;x<8;x++){ const i=(((Math.floor(k/3)*8+y)*24)+(k%3)*8+x)*4; v.push(d[i],d[i+1],d[i+2]); } return v; };
      const T=[...Array(9).keys()].map(tile); same=(a,b)=>{ let s2=0; for(let i=0;i<T[a].length;i++) s2+=Math.abs(T[a][i]-T[b][i]); return s2/T[a].length < 9; };
      render(); } catch(e){} }; im.src=p.photo; }
  let same=()=>false;
  const solvedNow=()=>order.every((v,k)=>v===k || same(v,k));
  let order=[...Array(9).keys()];
  do { order.sort(()=>Math.random()-.5); } while(order.every((v,k)=>v===k));
  let sel=null;
  const box=document.createElement("div"); box.className="tiles"; $("#pz").appendChild(box);
  function render(){
    box.innerHTML="";
    order.forEach((piece,pos)=>{
      const b=document.createElement("button"); b.type="button"; b.className="tile"+(sel===pos?" sel":"");
      b.setAttribute("aria-label","Piece "+(pos+1));
      b.style.backgroundImage=`url(${img})`;
      b.style.backgroundPosition=`${(piece%3)*50}% ${Math.floor(piece/3)*50}%`;
      b.onclick=()=>{ if(sel===null){sel=pos;} else { [order[sel],order[pos]]=[order[pos],order[sel]]; sel=null; }
        render(); if(solvedNow()) setTimeout(ok,500); };
      box.appendChild(b);
    });
  }
  render();
}

function pzCall(p, ok){
  $("#pz").innerHTML = `<div class="row"><input class="answer" id="ans" autocomplete="off" aria-label="The full password" value="${esc(p.given)} ">
    <button class="btn" id="tryTxt" type="button">Light the lighthouse</button></div>`;
  const go=()=> norm($("#ans").value)===norm(p.answer) ? ok() : wrong("The light stays dark. Did you call him yet?");
  $("#tryTxt").onclick=go; $("#ans").onkeydown=e=>{ if(e.key==="Enter") go(); };
}

function win(i){
  if(!solved.includes(i)) solved.push(i); save(); achieve("letter"); if (solved.length===total) achieve("words"); hearts(16); showLetter(i, true);
}

function showLetter(i, fresh){
  const c=GAME.chapters[i], L=c.letter;
  openScene(`<div class="letter">
    <p class="chapter">${esc(c.place)}</p>
    <h3>${esc(L.title)}</h3>
    <div class="polaroid"><div class="ph">${L.photo?`<img src="${L.photo}" alt="">`:"our photo goes here"}</div></div>
    <div class="body">${esc(L.text)}</div>
    <p class="found">${fresh?"You found a hidden word:":"The word hidden here:"} <b>${esc(c.word)}</b></p>
    <div class="row" style="justify-content:center"><button class="btn" id="back" type="button">${solved.length===total?"Go to the last door":"Back to the island"}</button></div>
  </div>`);
  $("#back").onclick=closeScene;
  if (deskMode()) photoDeck(i);
}
