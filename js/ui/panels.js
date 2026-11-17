// Gallery panel, Map of Us panel, island map + teleport.

/* ---------- panels: gallery, map, island map ---------- */
let panelKind = null;
function openPanel(kind, html){
  panelKind = kind; $("#pbox").innerHTML = `<button class="close" type="button" aria-label="Close">×</button>` + html;
  $("#pbox").querySelector(".close").onclick = closePanel; $("#panel").classList.remove("off"); $("#panel").dataset.kind = kind;
  frozen = true; C.vel.set(0,0,0); tagBox.classList.add("off");
}
function closePanel(){ $("#panel").classList.add("off"); panelKind=null; frozen=false; tagBox.classList.remove("off"); current=null; }
function renderGallery(){
  const g=GAME.gallery[galIdx];
  openPanel("gallery", `
    <p class="chapter">Our Moments · ${galIdx+1} of ${GAME.gallery.length}</p>
    <div class="gal">
      <button class="gnav" id="gprev" type="button" aria-label="Previous photo">‹</button>
      <img src="${galPhotos[galIdx].url}" alt="${esc(g.title)}">
      <button class="gnav" id="gnext" type="button" aria-label="Next photo">›</button>
    </div>
    <h3>${esc(g.title)}</h3>
    <p class="meta">${g.date ? `📅 ${esc(g.date)} &nbsp;·&nbsp; ` : ""}📍 ${esc(g.place)}</p>
    <p class="story">${esc(g.caption)}</p>
    <div class="thumbs">${GAME.gallery.map((x,i)=>`<button type="button" class="${i===galIdx?"on":""}" data-i="${i}" aria-label="${esc(x.title)}"><img src="${galPhotos[i].url}" alt=""></button>`).join("")}</div>`);
  $("#gprev").onclick=()=>galNav(-1); $("#gnext").onclick=()=>galNav(1);
  $("#pbox").querySelectorAll(".thumbs button").forEach(b=>b.onclick=()=>{ galNav(+b.dataset.i - galIdx); });
  const th=$("#pbox").querySelector(".thumbs"), on=th.querySelector(".on"); if (on) th.scrollLeft = on.offsetLeft - th.clientWidth/2 + on.clientWidth/2;
}
function openMap(sel=0){
  const P2=GAME.places; let total=0; for(let i=1;i<P2.length;i++) total+=hav(P2[i-1],P2[i]);
  const s=(i)=>{ const p=P2[i]; const prev=i?Math.round(hav(P2[i-1],p)):0;
    return `<img src="${placePhotos[i].url}" alt=""><p class="chapter">Stop ${i+1} of ${P2.length}</p><h3>${esc(p.name)}</h3>
      <p class="meta">📍 ${esc(p.city)}${p.date ? ` &nbsp;·&nbsp; 📅 ${esc(p.date)}` : ""}${i?` &nbsp;·&nbsp; 🚗 ${prev.toLocaleString()} km from ${esc(P2[i-1].city)}`:""}</p><p class="story">${esc(p.note)}</p>`; };
  const pins = P2.map((p,i)=>{ const [X,Y]=mproj(p.lat,p.lon); return `<g class="pin" data-i="${i}" tabindex="0" role="button" aria-label="${esc(p.name)}" transform="translate(${X.toFixed(1)},${Y.toFixed(1)})">
      <path d="M0,11 C-14,1 -12,-11 -5,-11 C-2,-11 0,-8 0,-6 C0,-8 2,-11 5,-11 C12,-11 14,1 0,11Z" transform="translate(0,-16) scale(1.5)"/><text y="-17">${i+1}</text><text class="lbl" y="${labelAbove(i) ? -40 : 20}">${esc(p.city)}</text></g>`; }).join("");
  let route=""; P2.forEach((p,i)=>{ const [X,Y]=mproj(p.lat,p.lon); if(!i) route+=`M${X},${Y}`; else { const [pX,pY]=mproj(P2[i-1].lat,P2[i-1].lon); route+=` Q${(pX+X)/2-(Y-pY)*.25},${(pY+Y)/2+(X-pX)*.25} ${X},${Y}`; } });
  openPanel("map", `
    <p class="chapter">Every place we’ve been, together</p><h3 style="margin-top:0">The Map of Us</h3>
    <div class="stats3"><span><b>${P2.length}</b> places</span><span><b>${Math.round(total).toLocaleString()}</b> km travelled</span>${(()=>{ const d=P2.map(p=>p.date).filter(Boolean); return d.length>1 && d[0]!==d[d.length-1] ? `<span><b>${esc(d[0])}</b> → <b>${esc(d[d.length-1])}</b></span>` : ""; })()}</div>
    <div class="mapwrap">
      <svg viewBox="-20 -30 600 680" class="lovemap" role="img" aria-label="Map of the places we visited">
        <defs><radialGradient id="parch" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#fbf1dc"/><stop offset="1" stop-color="#e9d2a8"/></radialGradient></defs>
        <rect x="-20" y="-30" width="600" height="680" rx="18" fill="url(#parch)"/>
        ${gridLons.map(l=>{ const [X]=mproj(latMin,l); return `<line x1="${X}" y1="-30" x2="${X}" y2="650" class="grid"/>`; }).join("")}
        ${gridLats.map(l=>{ const [,Y]=mproj(l,lonMin); return `<line x1="-20" y1="${Y}" x2="580" y2="${Y}" class="grid"/>`; }).join("")}
        <path d="${route}" class="route"/>
        ${pins}
        <g transform="translate(520,580)"><path d="M0,-30 L7,0 L0,30 L-7,0Z" fill="#b07a5a"/><text y="-36" class="n">N</text></g>
      </svg>
      <div class="detail" id="mdetail">${s(sel)}</div>
    </div>`);
  const pick=i=>{ $("#mdetail").innerHTML=s(i); $("#pbox").querySelectorAll(".pin").forEach(p=>p.classList.toggle("on", +p.dataset.i===i)); chime(880); };
  $("#pbox").querySelectorAll(".pin").forEach(p=>{ p.onclick=()=>pick(+p.dataset.i); p.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(+p.dataset.i); } }; });
  pick(sel);
}
const MAP_SPOTS = () => [
  { name:"Start", icon:"🚗", p:START },
  ...GAME.chapters.map((c,i)=>({ name:c.place, icon:solved.includes(i)?"💛":(i===0||solved.includes(i-1))?"✨":"🔒", p:landmarks[i].pos, locked:!(i===0||solved.includes(i-1)) })),
  { name:"Our Moments gallery", icon:"🖼️", p:interactables.find(i=>i.kind==="gallery").pos, face:galG.position, dot:ZONES.gallery },
  { name:"Music corner", icon:"🎵", p:DANCE, face:jukeG.position }, { name:"Map of Us", icon:"📍", p:interactables.find(i=>i.kind==="map").pos, face:mapG.position, dot:ZONES.map },
  { name:"Gift boxes", icon:"🎁", p:BOXES.clone().add(new THREE.Vector3(0,0,4)), face:BOXES },
  { name:"Love Lap", icon:"🏁", p:hoops[0].position.clone().add(new THREE.Vector3(-Math.cos(HOOP_A[0]),0,Math.sin(HOOP_A[0])).multiplyScalar(6)), face:hoops[0].position, dot:hoops[0].position },
  { name:"Fireworks button", icon:"🎆", p:FW }, { name:"Love Leap ramp", icon:"💗", p:new THREE.Vector3(RAMP.x-Math.sin(RAMP.a)*5,0,RAMP.z-Math.cos(RAMP.a)*5) },
  { name:"Wishing Well", icon:"🏮", p:WELL }, { name:"The Swing", icon:"🌸", p:SWINGSPOT }, { name:"The Last Door", icon:"🚪", p:new THREE.Vector3(DOOR.x,0,DOOR.z+4.6) },
  { name:"Stargazer Hill", icon:"⭐", p:new THREE.Vector3(HILL.x,0,HILL.z), face:LOOK, dot:LOOK },
  { name:"Moon Lagoon bridge", icon:"🌙", p:new THREE.Vector3(LAGOON.x-BRIDGE.dx*(BRIDGE.half+3), 0, LAGOON.z-BRIDGE.dz*(BRIDGE.half+3)), face:new THREE.Vector3(LAGOON.x,0,LAGOON.z), dot:new THREE.Vector3(LAGOON.x,0,LAGOON.z) },
  { name:"Firefly Forest", icon:"🌲", p:ring(3.3, FOREST.r-5), face:new THREE.Vector3(FOREST.x,0,FOREST.z), dot:new THREE.Vector3(FOREST.x,0,FOREST.z) },
  { name:"Fairy Village & Café Us", icon:"🏡", p:CAFE_SPOT, face:new THREE.Vector3(cafeHouse.x,0,cafeHouse.z), dot:new THREE.Vector3(VILLAGE.x,0,VILLAGE.z) },
  { name:"Starlight Pier", icon:"🌊", p:(()=>{ const q=pAt(PIER.u0-2,0); return new THREE.Vector3(q.x,0,q.z); })(), face:PIER_END, dot:PIER_END },
  { name:"Ferris wheel", icon:"🎡", p:FER_SPOT, face:new THREE.Vector3(FER.x,0,FER.z), dot:new THREE.Vector3(FER.x,0,FER.z) },
  { name:"Lantern Meadow", icon:"🏮", p:LANT_SPOT.clone().add(new THREE.Vector3(-Math.sin(lantOut)*3,0,-Math.cos(lantOut)*3)), face:new THREE.Vector3(LANT.x,0,LANT.z), dot:new THREE.Vector3(LANT.x,0,LANT.z) },
  { name:GAME.blockworld.name, icon:"⛏️", p:BW_SPOT, face:new THREE.Vector3(BW.x,0,BW.z), dot:new THREE.Vector3(BW.x,0,BW.z) },
  { name:"Whispering Falls", icon:"💧", p:(()=>{ const q=FL(0,8.6); return new THREE.Vector3(q.x,0,q.z); })(), face:new THREE.Vector3(FALLS.x,0,FALLS.z), dot:new THREE.Vector3(FALLS.x,0,FALLS.z) },
];
function openIslandMap(){
  const list = MAP_SPOTS();
  openPanel("island", `<p class="chapter">Tap a place to drive there instantly</p><h3 style="margin-top:0">The island</h3>
    <div class="isl"><canvas id="islc" width="520" height="520" aria-label="Island map"></canvas>
    <div class="islist">${list.map((s,i)=>`<button type="button" data-i="${i}">${s.icon} ${esc(s.name)}</button>`).join("")}</div></div>`);
  const cv=$("#islc"), x=cv.getContext("2d"), S=520/ (coastR(0)*2.6), toC=(px,pz)=>[260+px*S, 260+pz*S];
  x.fillStyle="#26337a"; x.fillRect(0,0,520,520);
  x.beginPath(); for(let k=0;k<=120;k++){ const a=k/120*Math.PI*2, r=coastR(a); const [X,Y]=toC(Math.sin(a)*r, Math.cos(a)*r); k?x.lineTo(X,Y):x.moveTo(X,Y); } x.fillStyle="#cdb79a"; x.fill();
  x.beginPath(); for(let k=0;k<=120;k++){ const a=k/120*Math.PI*2, r=coastR(a)*.86; const [X,Y]=toC(Math.sin(a)*r, Math.cos(a)*r); k?x.lineTo(X,Y):x.moveTo(X,Y); } x.fillStyle="#3f6f7a"; x.fill();
  // hill, forest, lagoon, village, pier, roads
  [[11,"#4f7f8c"],[7,"#6a8fa0"],[3.5,"#8aa6c0"]].forEach(([r,c])=>{ const [X,Y]=toC(HILL.x,HILL.z); x.fillStyle=c; x.beginPath(); x.arc(X,Y,r*S,0,7); x.fill(); });
  x.fillStyle="#2c5560"; for(let a=2.8;a<3.85;a+=.07) for(let k=0;k<4;k++){ const r=ringR(a)+5+k*3.4+((a*31)%2), [X,Y]=toC(Math.sin(a)*r, Math.cos(a)*r); x.beginPath(); x.arc(X,Y,2.6,0,7); x.fill(); }
  { const [X,Y]=toC(LAGOON.x,LAGOON.z); x.fillStyle="#26337a"; x.beginPath(); x.arc(X,Y,(LAGOON.r+.8)*S,0,7); x.fill(); }
  { const [X,Y]=toC(VILLAGE.x,VILLAGE.z); x.fillStyle="#8a78b0"; x.beginPath(); x.arc(X,Y,6.6*S,0,7); x.fill(); }
  { const [X,Y]=toC(BW.x,BW.z); x.save(); x.translate(X,Y); x.rotate(-BW.a); x.fillStyle="#5f9a45"; x.fillRect(-6.5*S,-6.5*S,13*S,13*S); x.restore(); }
  { const [X,Y]=toC(FALLS_ROCK.x,FALLS_ROCK.z); x.fillStyle="#5d5a86"; x.beginPath(); x.arc(X,Y,5*S,0,7); x.fill();
    const [P,Q]=toC(FALLS.x,FALLS.z); x.fillStyle="#3f86c8"; x.beginPath(); x.arc(P,Q,(FALLS.r+1)*S,0,7); x.fill(); }
  x.lineCap="round"; x.strokeStyle="rgba(243,226,210,.85)"; x.lineWidth=4*S*.8;
  roadLines.forEach(l=>{ x.beginPath(); l.forEach(([px,pz],k)=>{ const [X,Y]=toC(px,pz); k?x.lineTo(X,Y):x.moveTo(X,Y); }); x.stroke(); });
  { const a=toC(...Object.values(pAt(PIER.u0,0))), b=toC(...Object.values(pAt(PIER.u1,0))); x.strokeStyle="#c98f86"; x.lineWidth=4*S; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
  { const a=toC(LAGOON.x-BRIDGE.dx*BRIDGE.half, LAGOON.z-BRIDGE.dz*BRIDGE.half), b=toC(LAGOON.x+BRIDGE.dx*BRIDGE.half, LAGOON.z+BRIDGE.dz*BRIDGE.half); x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
  x.font="20px sans-serif"; x.textAlign="center"; x.textBaseline="middle";
  list.forEach(s=>{ const q=s.dot||s.p; const [X,Y]=toC(q.x,q.z); x.fillText(s.icon,X,Y); });
  const [cx,cz]=toC(C.pos.x,C.pos.z); x.fillStyle="#ff5f8f"; x.beginPath(); x.arc(cx,cz,9,0,7); x.fill(); x.strokeStyle="#fff"; x.lineWidth=3; x.stroke();
  $("#pbox").querySelectorAll(".islist button").forEach(b=>b.onclick=()=>{ const s=list[+b.dataset.i]; teleport(s.p, s.face); closePanel(); toast(`${s.icon} ${s.name}`, 2200); });
}
function teleport(p, face){
  if (!driving && !finaleOn && swingT<=0){ driving = true; himInCar = him.visible; updateWalkBtn(); }   // hop back in the car first
  const d=new THREE.Vector3(-p.x,0,-p.z); if (d.lengthSq()<1) d.set(0,0,1); d.normalize();
  const off = face ? 0 : 4, bx=p.x+d.x*off, bz=p.z+d.z*off; C.vel.set(0,0,0); C.heading=Math.atan2(-d.x,-d.z); C.pos.set(bx,0,bz);
  const free=(x,z)=>allColliders().every(c=>Math.hypot(x-c.x,z-c.z)>c.r+1.1) && props.every(q=>Math.hypot(x-q.pos.x,z-q.pos.z)>q.r+1.1);
  outer: for(let r=0;r<=5;r+=.7) for(let k=0;k<12;k++){ const a=k/12*6.283, x=bx+Math.sin(a)*r, z=bz+Math.cos(a)*r; if (free(x,z)){ C.pos.set(x,0,z); break outer; } if (r===0) break; }
  const fp = face || p; C.heading=Math.atan2(fp.x-C.pos.x, fp.z-C.pos.z); if (!face && Math.hypot(p.x-C.pos.x,p.z-C.pos.z)<.5) C.heading=Math.atan2(-d.x,-d.z);
  C.y=carGround(C.pos.x,C.pos.z); C.prevG=C.y; C.vy=0; camYaw=C.heading+Math.PI; burst(new THREE.Vector3(C.pos.x,C.y+1,C.pos.z), 24, "#ffe39a", false, 1.2); chime(1175);
}

// three.js r128 culls an InstancedMesh by its first copy only, which hides grass/trees spread over the big island
scene.traverse(o=>{ if (o.isInstancedMesh) o.frustumCulled = false; });
