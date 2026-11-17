// Gift coupons, desk letters, the glowing cursor and Polaroids.

/* ============================ KEEPSAKES: gifts, desk letters, glowing cursor, Polaroids ============================ */
// 🎁 the gift boxes in the meadow: each one opened (or bumped by the car) reveals the next love coupon
let giftIdx = 0, giftCool = 0;
function openGift(){
  if (frozen || finaleOn || !playing) return; achieve("gift");
  const g = GAME.gifts[giftIdx % GAME.gifts.length], n = giftIdx % GAME.gifts.length + 1; giftIdx++;
  props.filter(p=>p.group==="box").forEach(p=>{ if (!p.awake){ p.vel.set(rnd(-1.5,1.5), rnd(3,5), rnd(-1.5,1.5)); p.ang.set(rnd(-3,3),rnd(-1,1),rnd(-3,3)); wake(p); } });
  burst(BOXES.clone().add(new THREE.Vector3(0,1.4,0)), 28, "#ff9ec0", true, 1.2); burst(BOXES.clone().add(new THREE.Vector3(0,1.4,0)), 18, "#ffe39a", false, 1.4);
  chime(784); chime(988,.12); chime(1319,.26);
  setTimeout(()=>{
    openScene(`<div class="gift">
      <p class="chapter">A little gift for you · ${n} of ${GAME.gifts.length}</p>
      <div class="coupon"><span class="gicon">${g.icon}</span><p class="gtext hand">${esc(g.text)}</p>
        <p class="gvalid">Valid forever · signed with love, ${esc(GAME.himName)} 💗</p></div>
      <div class="row" style="justify-content:center"><button class="btn" id="giftOk" type="button">${n<GAME.gifts.length ? "Keep it 💗" : "Keep it… that was the last one 💗"}</button></div>
    </div>`);
    $("#giftOk").onclick=closeScene; hearts(14);
    setTimeout(()=>{ props.filter(p=>p.group==="box").forEach(respawn); }, 1500);
  }, 650);
}
function giftKnock(){ const t=clock.elapsedTime; if (t < giftCool) return; giftCool = t + 8; openGift(); }

// wide computer screens: the letter slides in on the left, a stack of Polaroids waits on the right
const deskMode = () => !isTouch && innerWidth >= 1000 && innerWidth/innerHeight >= 1.25;
function photoDeck(i){
  const L=GAME.chapters[i].letter, n=GAME.gallery.length, cards=[];
  for(let k=0;k<6;k++){ const g=(i*2+k)%n; cards.push({ src:galPhotos[g].url, cap:GAME.gallery[g].title }); }
  if (L.photo) cards.push({ src:L.photo, cap:GAME.chapters[i].place });          // the letter's own photo ends up on top
  const deck=document.createElement("div"); deck.className="deck"; deck.id="deck";
  cards.forEach((c,k)=>{ const el=document.createElement("div"); el.className="pcard"; el.innerHTML=`<img src="${c.src}" alt=""><p>${esc(c.cap)}</p>`;
    el.dataset.x=rnd(-10,10); el.dataset.y=rnd(-8,8); el.dataset.r=rnd(-7,7); placeCard(el); deck.appendChild(el); });
  const hint=document.createElement("p"); hint.className="dhint"; hint.textContent="click a photo for the next one · drag them around the desk"; deck.appendChild(hint);
  $("#scene").appendChild(deck); $("#scene").classList.add("desk");
  let drag=null;
  deck.addEventListener("pointerdown", e=>{ const el=e.target.closest(".pcard"); if (!el) return; e.preventDefault();
    deck.insertBefore(el, hint); el.setPointerCapture(e.pointerId); drag={ el, x0:e.clientX, y0:e.clientY, bx:+el.dataset.x, by:+el.dataset.y, moved:0 }; });
  deck.addEventListener("pointermove", e=>{ if (!drag) return; const dx=e.clientX-drag.x0, dy=e.clientY-drag.y0; drag.moved=Math.max(drag.moved, Math.hypot(dx,dy));
    if (drag.moved>5){ drag.el.classList.add("dragging"); drag.el.dataset.x=drag.bx+dx; drag.el.dataset.y=drag.by+dy; placeCard(drag.el); } });
  const up=()=>{ if (!drag) return; const el=drag.el; el.classList.remove("dragging");
    if (drag.moved<=5){ // a click: this photo slides off and tucks in at the back of the stack
      el.style.transform=`translate(${+el.dataset.x+260}px,${+el.dataset.y-40}px) rotate(${+el.dataset.r+14}deg)`; chime(1047);
      setTimeout(()=>{ deck.insertBefore(el, deck.firstChild); el.dataset.x=rnd(-10,10); el.dataset.y=rnd(-8,8); el.dataset.r=rnd(-7,7); placeCard(el); }, 280); }
    drag=null; };
  deck.addEventListener("pointerup", up); deck.addEventListener("pointercancel", up);
}
function placeCard(el){ el.style.transform=`translate(${el.dataset.x}px,${el.dataset.y}px) rotate(${el.dataset.r}deg)`; }

// a soft glowing cursor that drifts after the mouse and is drawn to things she can use
const cur=$("#cur"), curDot=cur.querySelector(".dot"), curRw=cur.querySelector(".rw");
const mouse={ x:innerWidth/2, y:innerHeight/2, in:false }, ringPos={ x:innerWidth/2, y:innerHeight/2 };
let hover=null, hoverScan=0, shimmerT=0;
if (!isTouch){
  document.body.classList.add("fancy");
  addEventListener("mousemove", e=>{ mouse.x=e.clientX; mouse.y=e.clientY;
    document.body.classList.toggle("near-top", e.clientY < innerHeight*.14); document.body.classList.toggle("near-bottom", e.clientY > innerHeight*.84); });
  canvas.addEventListener("pointerenter", e=>{ if (e.pointerType==="mouse") mouse.in=true; });
  canvas.addEventListener("pointerleave", ()=>{ mouse.in=false; });
}
const _hp=new THREE.Vector3();
function screenOf(v){ _hp.copy(v).project(camera); if (_hp.z>1) return null; return { x:(_hp.x*.5+.5)*innerWidth, y:(-_hp.y*.5+.5)*innerHeight }; }
// the nearest usable thing within 80px of the mouse (or directly under it)
function findHover(){
  if (!playing || frozen || pointers.size) return null;
  ndc.set(mouse.x/innerWidth*2-1, -(mouse.y/innerHeight)*2+1); ray.setFromCamera(ndc, camera);
  const c=ray.intersectObjects(clickables, false)[0];
  if (c && c.distance<40) return { pos:c.object.getWorldPosition(new THREE.Vector3()), click:c.object, ready:true };
  let best=null, bd=80;
  interactables.forEach(it=>{ if (!it.r) return; const tp=it.tagPos||it.pos, w=new THREE.Vector3(tp.x, (it.tagY!==undefined ? it.tagY-1.5 : groundH(tp.x,tp.z)+1.4), tp.z);
    if (w.distanceTo(camera.position) > 45) return; const s=screenOf(w); if (!s) return; const d=Math.hypot(s.x-mouse.x, s.y-mouse.y);
    if (d<bd){ bd=d; best={ pos:w, spot:it, ready: it===current }; } });
  clickables.forEach(m=>{ const w=m.getWorldPosition(new THREE.Vector3()); if (w.distanceTo(camera.position) > 40) return; const s=screenOf(w); if (!s) return;
    const d=Math.hypot(s.x-mouse.x, s.y-mouse.y); if (d<bd){ bd=d; best={ pos:w, click:m, ready:true }; } });
  return best;
}
function updateCursor(dt){
  if (isTouch) return;
  const show = mouse.in && playing && !snapOpen; cur.classList.toggle("on", show); if (!show){ hover=null; return; }
  if ((hoverScan -= dt) < 0){ hoverScan = .1; hover = findHover(); }
  let tx=mouse.x, ty=mouse.y;
  if (hover){ const s=screenOf(hover.pos); if (s){ tx = mouse.x + (s.x-mouse.x)*.55; ty = mouse.y + (s.y-mouse.y)*.55; } }   // gently pulled towards it
  const k=1-Math.exp(-dt*12); ringPos.x += (tx-ringPos.x)*k; ringPos.y += (ty-ringPos.y)*k;
  curDot.style.transform=`translate(${mouse.x}px,${mouse.y}px)`; curRw.style.transform=`translate(${ringPos.x}px,${ringPos.y}px)`;
  cur.classList.toggle("hot", !!hover && hover.ready); cur.classList.toggle("far", !!hover && !hover.ready);
  // a little golden shimmer (and the odd heart) on the thing under the cursor
  if (hover && (shimmerT -= dt) < 0){ shimmerT = hover.ready ? .16 : .35;
    const p=hover.pos.clone().add(new THREE.Vector3(rnd(-.8,.8), rnd(-.3,1), rnd(-.8,.8)));
    burst(p, 1, hover.ready ? "#ffe39a" : "#ff9ec0", false, .25); if (hover.ready && Math.random()<.25) petalAt(p.x, p.y+.4, p.z); }
}

// 📸 Polaroids: a real photo of the moment, which develops in the corner and has a note on the back
const SNAP_KEY = "lost-letters-snaps";
let snaps = []; try { snaps = JSON.parse(localStorage.getItem(SNAP_KEY) || "[]"); } catch(e){}
let snapReq = false, snapOpen = false, snapIdx = 0, snapCount = snaps.length;
function takeSnapshot(){
  if (!playing || snapOpen || panelKind || !$("#scene").classList.contains("off")) return;
  snapReq = true;
}
function snapPlace(){
  if (scopeOpen) return "Through the telescope · " + SKY[sc.idx].name;
  if (fwShow.on) return "Our firework show";
  let best="Our island", bd=1e9; MAP_SPOTS().forEach(s=>{ const q=s.dot||s.p, d=Math.hypot(q.x-her.position.x, q.z-her.position.z); if (d<bd){ bd=d; best=s.name; } });
  return bd < 18 ? (best==="Start" ? "Heart Meadow" : best) : "Somewhere on our island";
}
function shutter(){ if (!actx) return; try { const len=Math.floor(.12*actx.sampleRate), b=actx.createBuffer(1,len,actx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,4)*(i<len*.35||i>len*.55?1:.2);
  const s=actx.createBufferSource(); s.buffer=b; const g=actx.createGain(); g.gain.value=.35; s.connect(g); g.connect(actx.destination); s.start(); } catch(e){} }
// called right after a frame is drawn, so the picture isn't blank
function captureSnapshot(src){
  const w=src.width, h=src.height, side=Math.min(w,h)*.92, out=document.createElement("canvas"); out.width=out.height=480; const x=out.getContext("2d");
  x.drawImage(src, (w-side)/2, (h-side)/2, side, side, 0, 0, 480, 480);
  x.fillStyle="rgba(255,190,160,.07)"; x.fillRect(0,0,480,480);                  // a touch of warm film colour
  const vg=x.createRadialGradient(240,240,170,240,240,340); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(20,10,30,.35)"); x.fillStyle=vg; x.fillRect(0,0,480,480);
  const snap={ img:out.toDataURL("image/jpeg",.82), where:snapPlace(), date:new Date().toLocaleDateString(undefined,{ day:"numeric", month:"short", year:"numeric" }),
    note:GAME.snapNotes[snapCount % GAME.snapNotes.length] };
  snapCount++; snaps.push(snap); while (snaps.length > 12) snaps.shift();
  try { localStorage.setItem(SNAP_KEY, JSON.stringify(snaps)); } catch(e){ try { snaps.shift(); localStorage.setItem(SNAP_KEY, JSON.stringify(snaps)); } catch(e2){} }
  // flash, then the photo floats down into the corner and develops
  const fl=$("#flash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go"); shutter(); chime(1319,.1);
  const fly=document.createElement("div"); fly.className="flyer"; fly.innerHTML=`<img class="dev" src="${snap.img}" alt="">`; $("#app").appendChild(fly);
  setTimeout(()=>{ const a=$("#album"); a.classList.add("has"); const r=a.getBoundingClientRect(), f=fly.getBoundingClientRect(), s=r.width/f.width;
    fly.style.transform=`translate(${r.left+r.width/2-innerWidth/2-f.width/2}px,${r.top+r.height/2-innerHeight/2-f.height/2}px) scale(${s}) rotate(8deg)`; }, 650);
  setTimeout(()=>{ fly.remove(); renderAlbum(true); }, 1850);
  if (snapCount===1) setTimeout(()=>toast("📸 Your Polaroid is developing in the corner. Click it to see the back!", 5000), 1900);
}
function renderAlbum(fresh){
  const a=$("#album"); a.classList.toggle("has", snaps.length>0); if (!snaps.length) return;
  const last=snaps.slice(-3);
  a.innerHTML=last.map((s,k)=>`<div class="mini" style="transform:rotate(${[-9,6,-3][k+3-last.length]}deg)"><img class="${fresh && k===last.length-1 ? "dev" : ""}" src="${s.img}" alt=""></div>`).join("")
    + `<span class="count">${snaps.length}</span>`;
}
function openSnap(i){
  if (!snaps.length) return; snapIdx=(i+snaps.length)%snaps.length; const s=snaps[snapIdx];
  $("#svImg").src=s.img; $("#svCap").textContent=s.where; $("#svNote").textContent=s.note; $("#svWhere").textContent=`${s.where} · ${s.date}`;
  $("#svSave").href=s.img; $("#svSave").download=`our-moment-${snapIdx+1}.jpg`; $("#svCard").classList.remove("flipped");
  ["#svPrev","#svNext"].forEach(id=>$(id).style.display = snaps.length>1 ? "" : "none");
  if (!snapOpen){ snapOpen=true; snapWasFrozen=frozen; frozen=true; C.vel.set(0,0,0); }
  $("#snapView").classList.remove("off"); chime(988);
}
let snapWasFrozen=false;
function closeSnap(){ if (!snapOpen) return; snapOpen=false; frozen=snapWasFrozen; $("#snapView").classList.add("off"); }
$("#album").onclick=()=>openSnap(snaps.length-1);
$("#svCard").onclick=()=>{ $("#svCard").classList.toggle("flipped"); chime(1175); };
$("#svFlip").onclick=$("#svCard").onclick;
$("#svPrev").onclick=()=>openSnap(snapIdx-1); $("#svNext").onclick=()=>openSnap(snapIdx+1); $("#svClose").onclick=closeSnap;
$("#snapView").addEventListener("click", e=>{ if (e.target.id==="snapView") closeSnap(); });
$("#snapBtn").onclick=()=>takeSnapshot(); $("#scSnap").onclick=()=>takeSnapshot();
addEventListener("keydown", e=>{ if (!snapOpen) return; if (e.key==="Escape") closeSnap(); else if (e.key==="ArrowLeft") openSnap(snapIdx-1); else if (e.key==="ArrowRight") openSnap(snapIdx+1); else if (e.key===" "||e.key==="f"){ e.preventDefault(); $("#svCard").classList.toggle("flipped"); } });
renderAlbum(false);
