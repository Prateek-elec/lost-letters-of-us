// Interactable places, labels, the interact button and what each place does.

/* ============================ GAME STATE ============================ */
let playing = false, frozen = false, current = null, finaleOn = false;
const isOpen = i => i===total ? solved.length===total : (i===0 || solved.includes(i-1));
const isDone = i => i<total && solved.includes(i);
const nextIdx = () => { for(let i=0;i<total;i++) if(!solved.includes(i)) return i; return total; };

const interactables = [
  ...GAME.chapters.map((c,i)=>({ kind:"chapter", i, pos: landmarks[i].pos, r: 4.2, name:c.place })),
  { kind:"door", i:total, pos: new THREE.Vector3(DOOR.x, 0, DOOR.z+4.3), r: 3.4, name: GAME.door.place },
  { kind:"well", pos: WELL, r: 3.2, name: "Wishing Well" },
  { kind:"swing", pos: SWINGSPOT, r: 3, name: "The Swing" },
  { kind:"label", pos: new THREE.Vector3(RAMP.x,0,RAMP.z), r: 0, name: "Love Leap" },
  { kind:"gifts", pos: BOXES, r: 3.6, name: "Gift boxes 🎁" },
  { kind:"gallery", pos: new THREE.Vector3(0,0,4.2).applyAxisAngle(UP, galG.rotation.y).add(galG.position), r: 4.4, name: "Our Moments 🖼️", tagPos: galG.position, tagH: 6.3 },
  { kind:"jukebox", pos: new THREE.Vector3(0,0,1.4).applyAxisAngle(UP, jukeG.rotation.y).add(jukeG.position), r: 2.4, name: "Music Corner 🎵", tagPos: jukeG.position, tagH: 3.6 },
  { kind:"dance", pos: DANCE, r: 2.7, name: "Dance floor 💃", tagH: 2.3 },
  { kind:"map", pos: new THREE.Vector3(0,0,3.6).applyAxisAngle(UP, mapG.rotation.y).add(mapG.position), r: 3.6, name: "The Map of Us 📍", tagPos: mapG.position, tagH: 3.2 },
  { kind:"fireworks", pos: FW, r: 3.4, name: "Fireworks button 🎆" },
  { kind:"label", pos: hoops[0].position, r: 0, name: "Love Lap 🏁", tagH: 2.7 },
  // the outer areas
  { kind:"lookout", pos: LOOK, r: 4.2, name: "Stargazer Hill ⭐", tagH: 4.9 },
  { kind:"lagoon", pos: new THREE.Vector3(LAGOON.x, 0, LAGOON.z), r: 3.4, name: "Moon Lagoon 🌙", tagY: BRIDGE_TOP + 2.6 },
  { kind:"cafe", pos: CAFE_SPOT, r: 3.4, name: "Café Us ☕", tagPos: new THREE.Vector3(cafeHouse.x, 0, cafeHouse.z), tagH: 4.9 },
  { kind:"label", pos: new THREE.Vector3(VILLAGE.x, 0, VILLAGE.z), r: 0, name: "Fairy Village 🏡", tagH: 3.6 },
  { kind:"label", pos: new THREE.Vector3(FOREST.x, 0, FOREST.z), r: 0, name: "Firefly Forest 🌲", tagH: 3.2 },
  { kind:"pier", pos: PIER_END, r: 3.4, name: "Starlight Pier 🌊", tagY: PIER.h + 5 },
  { kind:"ferris", pos: new THREE.Vector3(FER.x, 0, FER.z), r: 9, name: "Ferris wheel 🎡", tagH: 17.2 },   // anywhere around the wheel
  { kind:"lanterns", pos: LANT_SPOT, r: 4, name: "Lantern Meadow 🏮", tagPos: new THREE.Vector3(LANT.x, 0, LANT.z), tagH: 3.4 },
  ...[BENCH_HILL, BENCH_LAGOON, BENCH_LANT].map(i=>{ const b=BENCHES[i]; return { kind:"bench", i, pos:new THREE.Vector3(b.x+Math.sin(b.yaw)*1.5, 0, b.z+Math.cos(b.yaw)*1.5), r:2.6, name:"🪑 " + b.name, tagPos:new THREE.Vector3(b.x,0,b.z), tagH:1.9 }; }),
  { kind:"label", pos: BW_SPOT, r: 0, name: GAME.blockworld.name + " ⛏️", tagH: 3.4 },
  { kind:"mine", pos: BW_PILE_W, r: 3.2, name: "Ore pile ⛏️", tagPos: bwWorld(BW_PILE.x, BW_PILE.z), tagH: 2.6 },
  { kind:"craft", pos: BW_TABLE, r: 2.2, name: "Crafting table 🛠️", tagPos: bwWorld(-4, 2), tagH: 1.7 },
  { kind:"bed", pos: BW_DOOR, r: 2, name: "Our block house 🏠", tagPos: bwWorld(-4, -4), tagH: 5.6 },
  { kind:"falls", pos: FALLS_SPOT, r: 4.2, name: "Whispering Falls 💧", tagPos: new THREE.Vector3(FALLS.x, 0, FALLS.z), tagY: LIP_Y + 1.6 },
];

// tags
const tagBox = $("#tags"), tags = [];
[...interactables].forEach(it=>{ const d=document.createElement("div"); d.className="tag"; tagBox.appendChild(d); tags.push(d); });
const fairyBubble = document.createElement("div"); fairyBubble.className="bubble"; tagBox.appendChild(fairyBubble);

let sayTimer = null;
function say(html, ms=4200){ fairyBubble.innerHTML = html; fairyBubble.classList.add("show"); clearTimeout(sayTimer); sayTimer = setTimeout(()=>fairyBubble.classList.remove("show"), ms); }
let toastTimer=null;
function toast(text, ms=4200){ const t=$("#toast"); t.textContent=text; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),ms); }

function refresh(){
  interactables.forEach((it,k)=>{
    const d = tags[k];
    if (it.kind==="chapter" || it.kind==="door"){
      const open=isOpen(it.i), done=isDone(it.i);
      d.className = "tag" + (open ? "" : " locked") + (done ? " done" : "");
      d.textContent = open ? it.name : "? ? ?";
    } else { d.className="tag"; d.textContent = it.name; }
  });
  landmarks.forEach(l=>{ const open=isOpen(l.idx), done=isDone(l.idx);
    l.marker.material.color.set(done?"#f4cd84":open?"#ff9ec0":"#5d5690"); l.marker.material.emissive.set(done?"#f4cd84":open?"#ff9ec0":"#2a2552"); });
  const p=$("#pieces"); p.innerHTML="";
  GAME.chapters.forEach((c,i)=>{ const s=document.createElement("span"); s.className="piece"+(isDone(i)?" got":""); s.textContent=isDone(i)?c.word:"?"; p.appendChild(s); });
  doorGlow.material.opacity = isOpen(total) && !finaleOn ? .35 : doorGlow.material.opacity;
}

function updateInteract(){
  const btn = $("#interact");
  if (!playing || frozen){ btn.classList.remove("show"); current=null; return; }
  let best=null, bd=1e9;
  interactables.forEach(it=>{ const d=Math.hypot(her.position.x-it.pos.x, her.position.z-it.pos.z); if(d<it.r && d<bd){ bd=d; best=it; } });
  if (best !== current){
    current = best;
    if (!best){ btn.classList.remove("show"); return; }
    btn.classList.remove("locked");
    if (best.kind==="chapter"){
      if (isDone(best.i)) btn.textContent = "✉ Read the letter again";
      else if (isOpen(best.i)) btn.textContent = "✨ " + GAME.chapters[best.i].prompt;
      else { btn.textContent = "🔒 Not yet…"; btn.classList.add("locked"); }
    } else if (best.kind==="door"){
      if (isOpen(total)) btn.textContent = "💗 Open the Last Door"; else { btn.textContent = "🔒 The door is sealed"; btn.classList.add("locked"); }
    } else if (best.kind==="well") btn.textContent = "🏮 Make a wish";
    else if (best.kind==="swing") btn.textContent = "🌸 Sit on the swing";
    else if (best.kind==="gallery") btn.textContent = "🖼️ Open our gallery";
    else if (best.kind==="jukebox") btn.textContent = "🎵 Play / change song";
    else if (best.kind==="dance") btn.textContent = "💃 Dance together";
    else if (best.kind==="map") btn.textContent = "📍 Open the Map of Us";
    else if (best.kind==="lookout") btn.textContent = "🔭 Look through the telescope";
    else if (best.kind==="lagoon") btn.textContent = "🏮 Float a lantern";
    else if (best.kind==="cafe") btn.textContent = "☕ Order a hot chocolate";
    else if (best.kind==="pier") btn.textContent = "🌊 Sit together at the end of the pier";
    else if (best.kind==="ferris") btn.textContent = "🎡 Ride the wheel together";
    else if (best.kind==="lanterns") btn.textContent = "🏮 Release lanterns together";
    else if (best.kind==="bench") btn.textContent = "🪑 Sit together";
    else if (best.kind==="falls") btn.textContent = "💧 Sit together by the falls";
    else if (best.kind==="fireworks") btn.textContent = "🎆 Start the grand show";
    else if (best.kind==="gifts") btn.textContent = "🎁 Open a gift";
    else if (best.kind==="mine") btn.textContent = "⛏️ Mine a block";
    else if (best.kind==="craft") btn.textContent = "🛠️ Craft something";
    else if (best.kind==="bed") btn.textContent = "🛏️ Set our respawn point";
    btn.classList.add("show");
  }
}
$("#interact").onclick = () => doInteract();
$("#honk").onclick = () => { if (playing && !frozen && driving) honk(); };
$("#fwSkip").onclick = () => endShow();
$("#islmap").onclick = () => { if (playing && !finaleOn && $("#scene").classList.contains("off")) { if (panelKind) closePanel(); else openIslandMap(); } };

function doInteract(){
  const it = current; if (!it) return;
  if (it.kind==="chapter"){
    if (!isOpen(it.i)){ say(`That place is still asleep. Let’s find <b>${GAME.chapters[nextIdx()].place}</b> first — follow the golden light!`); chime(300); return; }
    chime(660); frozen = true; C.vel.set(0,0,0); $("#interact").classList.remove("show"); current=null;
    setTimeout(()=> openChapter(it.i), 350);
  } else if (it.kind==="door"){
    if (!isOpen(total)){ say(`The door only opens when all five words are found. You have <b>${solved.length}</b>.`); chime(300); return; }
    startFinale();
  } else if (it.kind==="well"){
    const w = GAME.wishes[wishCount++ % GAME.wishes.length];
    const p = new THREE.Vector3(WELL.x, groundH(WELL.x,WELL.z)+1.2, WELL.z);
    lantern(p.x, p.y, p.z, true); burst(p, 16, "#7ef0ff", false, .8); chime(880); chime(1320, .15);
    toast("🏮 " + w, 5200);
  } else if (it.kind==="gallery"){ chime(880); renderGallery();
  } else if (it.kind==="jukebox"){ changeSong();
  } else if (it.kind==="dance"){ startDance();
  } else if (it.kind==="map"){ chime(880); openMap();
  } else if (it.kind==="lookout"){
    toast("⭐ " + GAME.world.lookout, 5000); openTelescope();
  } else if (it.kind==="lagoon"){
    const p = new THREE.Vector3(LAGOON.x, BRIDGE_TOP+.8, LAGOON.z);
    lantern(p.x, p.y, p.z, true); burst(p, 18, "#7ef0ff", false, .9); chime(659); chime(988,.15); toast("🌙 " + GAME.world.lagoon, 5500);
  } else if (it.kind==="cafe"){
    burst(new THREE.Vector3(cafeHouse.x, cafeHouse.y+2.6, cafeHouse.z), 20, "#ffb8cc", true, .8); chime(988); chime(1175,.12); toast("☕ " + GAME.world.cafe, 5500);
  } else if (it.kind==="pier"){
    sitBench(BENCH_PIER); setTimeout(()=>{ if (sitting) launchFireworks(5); }, 2500);
  } else if (it.kind==="ferris"){ startRide();
  } else if (it.kind==="lanterns"){ releaseLanterns();
  } else if (it.kind==="bench"){ sitBench(it.i);
  } else if (it.kind==="fireworks"){ grandShow();
  } else if (it.kind==="gifts"){ giftCool = clock.elapsedTime + 8; openGift();
  } else if (it.kind==="mine"){ const b = mineTarget(); if (b) mineHit(b); else say("You mined everything! The ore grows back while you’re away ⛏️", 3500);
  } else if (it.kind==="craft"){ openCrafting();
  } else if (it.kind==="bed"){ setRespawn();
  } else if (it.kind==="falls"){
    sitBench(BENCH_FALLS); rainbowT = 12; burst(new THREE.Vector3(FALLS.x, 1.2, FALLS.z), 22, "#bfeaff", false, 1.4); chime(1175,.4);
    setTimeout(()=>{ if (sitting) toast(`Look, a rainbow over the water 🌈 ${isTouch ? "Tap 📸" : "Press P"} to keep it!`, 4500); }, 6500);
  } else if (it.kind==="swing"){
    swingT = 4; chime(523); chime(784,.2); swingWasDriving = driving; driving = false; wasSwinging = true; C.vel.set(0,0,0); her.quaternion.identity();
    her.position.set(SWINGSPOT.x, groundH(SWINGSPOT.x,SWINGSPOT.z), SWINGSPOT.z);
    toast(GAME.swingMemory, 6000); burst(new THREE.Vector3(SWINGSPOT.x, groundH(SWINGSPOT.x,SWINGSPOT.z)+1.2, SWINGSPOT.z), 14);
  }
}
let swingT = 0, ringCooldown = 0, wasSwinging = false, swingWasDriving = true;
