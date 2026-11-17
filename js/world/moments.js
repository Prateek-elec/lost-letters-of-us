// Sitting together: benches, the Ferris wheel ride, Lantern Meadow.

/* ---------- sitting together: benches, the Ferris wheel ride, Lantern Meadow ----------
   `sitting` holds the current moment; while it's set the frame loop leaves her and Prateek alone
   (updateSitting poses them) and the camera follows sitting.cam. */
let sitting = null;
const BENCHES = [];
function makeBench(x, z, yaw, y){
  const b=new THREE.Group(); b.position.set(x, y===undefined ? groundH(x,z) : y, z); b.rotation.y=yaw; b.userData.bench=true; scene.add(b);
  const wood=M("#a77a6a"), iron=M("#3b2f3f");
  [0,.17,.34].forEach(zz=>{ const sl=new THREE.Mesh(new THREE.BoxGeometry(2,.07,.15),wood); sl.position.set(0,.5,zz-.17); b.add(sl); });
  [.62,.82,1.02].forEach(yy=>{ const sl=new THREE.Mesh(new THREE.BoxGeometry(2,.12,.05),wood); sl.position.set(0,yy,-.27); sl.rotation.x=-.12; b.add(sl); });
  [-.9,.9].forEach(xx=>{ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.5,.5),iron); l.position.set(xx,.25,0); b.add(l); });
  const h=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.03,bevelEnabled:false}), E("#ff8fb1",.9)); h.scale.setScalar(.4); h.position.set(0,1.2,-.3); b.add(h);
  shadowy(b); block(x, z, 1.1); return b;
}
// a bench the two of you can sit on: (x,z) = bench centre, yaw = the way it faces
function addBench(x, z, yaw, name, msg, y){ BENCHES.push({ x, z, yaw, name, msg, y: y===undefined ? groundH(x,z) : y }); return BENCHES.length-1; }
const BENCH_HILL = addBench(...Object.values(loc(LOOK.x,LOOK.z,HILL.a,-1.7,-.3)), HILL.a, "The lookout bench", GAME.world.lookout);
const BENCH_FALLS = addBench(...Object.values(FL(0,5.4)), fallsYaw+Math.PI, "Whispering Falls", GAME.world.falls);
const BENCH_PIER = addBench(...Object.values(pAt(PIER.u1-.55,0)), pierYaw, "The end of the pier", GAME.world.pier, PIER.h);
{ // a new bench on the lagoon shore, facing the water and the bridge
  const a=LAGOON.a+Math.PI/2, x=LAGOON.x+Math.sin(a)*(LAGOON.r+3.4), z=LAGOON.z+Math.cos(a)*(LAGOON.r+3.4), yaw=Math.atan2(LAGOON.x-x, LAGOON.z-z);
  makeBench(x, z, yaw); var BENCH_LAGOON = addBench(x, z, yaw, "Moon Lagoon shore", GAME.world.lagoon); }

/* ---------- Lantern Meadow: a picnic blanket, glowing lantern posts, and lanterns to release together ---------- */
const lantG = region(new THREE.Group(), LANT.x, LANT.z, 12); scene.add(lantG);
const LANT_Y = groundH(LANT.x, LANT.z), lantOut = Math.atan2(LANT.x, LANT.z);   // facing out to the sea
let lantPaper = [];
{
  const blanket=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{ depth:.04, bevelEnabled:false }), M("#d9536f",{ roughness:1 }));
  blanket.geometry.center(); blanket.rotation.x=-Math.PI/2; blanket.rotation.z=Math.PI+lantOut; blanket.scale.setScalar(4.2); blanket.position.set(LANT.x, LANT_Y+.06, LANT.z); lantG.add(blanket);
  // unlit paper lanterns waiting on the blanket, and little candles
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, r=1.1, p=new THREE.Mesh(new THREE.CylinderGeometry(.18,.14,.36,8), E(k%2?"#ffb36b":"#ffd98a",.6));
    p.position.set(LANT.x+Math.cos(a)*r, LANT_Y+.26, LANT.z+Math.sin(a)*r); lantG.add(p); lantPaper.push(p); }
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+.3, x=LANT.x+Math.cos(a)*2.2, z=LANT.z+Math.sin(a)*2.2;
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.18,6),M("#fff3e6")); c.position.set(x,LANT_Y+.15,z); lantG.add(c);
    const f=sprite("#ffb36b",.45,.9); f.position.set(x,LANT_Y+.32,z); lantG.add(f); }
  // a ring of hanging lanterns on curved poles
  const glows=[];
  for(let k=0;k<10;k++){ const a=k/10*Math.PI*2, x=LANT.x+Math.cos(a)*6.4, z=LANT.z+Math.sin(a)*6.4, y=groundH(x,z);
    if (onRoad(x,z) && Math.abs(Math.sin(a-lantOut))<.5) continue;
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,2.6,6),M("#3b2f3f")); pole.position.set(x,y+1.3,z); lantG.add(pole);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,.05),M("#3b2f3f")); arm.position.set(x,y+2.55,z); arm.rotation.y=-a; lantG.add(arm);
    const lx=x-Math.cos(a)*.3, lz=z-Math.sin(a)*.3, lan=new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.38,8), E(k%2?"#ff9ec0":"#ffb36b",1.4)); lan.position.set(lx,y+2.2,lz); lantG.add(lan);
    glows.push({ x:lx, y:y+2.2, z:lz, c:k%2?"#ff9ec0":"#ffb36b" }); block(x,z,.2); }
  glowPoints(glows, 2.2, lantG);
  const sign=signBoard("🏮 Lantern Meadow",2.4,.6,"#c96a88"); const sp=ring(.42, LANT.r-6.2), sy=groundH(sp.x,sp.z);
  sign.position.set(sp.x+1.5, sy+1.8, sp.z); sign.rotation.y=lantOut; lantG.add(sign);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.9,6),M("#3b2f3f")); pole.position.set(sp.x+1.5, sy+.95, sp.z); lantG.add(pole); block(sp.x+1.5, sp.z, .3);
  shadowy(lantG);
}
const LANT_SPOT = new THREE.Vector3(LANT.x - Math.sin(lantOut)*2.4, 0, LANT.z - Math.cos(lantOut)*2.4);
// a bench at the edge of the meadow, looking out to sea
var BENCH_LANT = (()=>{ const x=LANT.x+Math.sin(lantOut)*4.6+Math.cos(lantOut)*2.5, z=LANT.z+Math.cos(lantOut)*4.6-Math.sin(lantOut)*2.5; makeBench(x, z, lantOut);
  return addBench(x, z, lantOut, "Lantern Meadow bench", GAME.world.lanternBench); })();

function sitPose(p, lean){ const u=p.userData; u.legs.forEach(l=>{ l.rotation.x=-1.45; }); u.arms.forEach((a,k)=>{ a.rotation.x=-.55; a.rotation.z=(k?-1:1)*.1; });
  u.body.position.y=0; u.head.rotation.z=lean||0; }
function standPose(p){ const u=p.userData; u.head.rotation.z=0; u.legs.forEach(l=>{ l.rotation.x=0; }); u.arms.forEach(a=>{ a.rotation.x=0; }); }
function beginMoment(s, exitLabel){
  s.wasDriving = driving; s.t = 0; sitting = s;
  driving=false; frozen=true; C.vel.set(0,0,0); walkTarget=null; himInCar=false; him.visible=true; her.quaternion.identity(); him.quaternion.identity();
  tagBox.classList.add("off"); $("#interact").classList.remove("show"); current=null;
  $("#exitBtn").textContent = exitLabel; $("#exitBtn").classList.add("show");
}
function endMoment(){
  const s=sitting; if (!s) return; sitting=null; frozen=false; walkTarget=null; tagBox.classList.remove("off"); $("#exitBtn").classList.remove("show");
  standPose(her); standPose(him); her.rotation.x = her.rotation.z = him.rotation.x = him.rotation.z = 0;
  if (s.end) s.end(s);
  if (s.wasDriving){ driving=true; himInCar=true; camYaw=C.heading+Math.PI; }
  else { const st=s.standAt || her.position.clone(); her.position.set(st.x, 0, st.z); collide(her.position); her.position.y=walkH(her.position.x, her.position.z);
    him.position.set(st.x+Math.cos(her.rotation.y)*.9, 0, st.z-Math.sin(her.rotation.y)*.9); collide(him.position); }
  updateWalkBtn();
}
$("#exitBtn").onclick = () => endMoment();

// 🪑 sit together on a bench; her head on your shoulder; the camera looks out at the view over your shoulders
function sitBench(i){
  if (sitting || frozen || !playing) return; const b=BENCHES[i];
  beginMoment({ kind:"bench", b, standAt:new THREE.Vector3(b.x+Math.sin(b.yaw)*1.4, 0, b.z+Math.cos(b.yaw)*1.4) }, "Stand up ×");
  chime(659); chime(880,.2); toast("🪑 " + b.msg, 6500); achieve("bench");
}
// 🎡 ride one full turn together, with a pause at the very top
let ride = null;
function startRide(){
  if (sitting || frozen || !playing) return;
  let best=0, by=1e9; gondolas.forEach((g,k)=>{ const y=Math.sin(k/8*Math.PI*2 + ferWheel.rotation.z); if (y<by){ by=y; best=k; } });
  const a0 = best/8*Math.PI*2 + ferWheel.rotation.z, dTop = (((a0 - Math.PI/2) % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
  ride = { k:best, travel:0, dTop, pause:0, topDone:false };
  // your basket's roof and lamp step aside so nothing blocks the view of the two of you
  const roofy = gondolas[best].userData.cab.children.filter(o=>o.geometry && o.geometry.type==="ConeGeometry" || o.isSprite); roofy.forEach(o=>o.visible=false);
  beginMoment({ kind:"ride", standAt:FER_SPOT.clone(), end:()=>{ ride=null; roofy.forEach(o=>o.visible=true); } }, "End the ride ×");
  chime(523); chime(659,.15); chime(784,.3); toast("🎡 Just the two of us… hold on, here we go!", 3500); achieve("ride");
}
function updateRide(dt){
  const r=ride; let sp = .185*Math.min(1, sitting.t/2.5);
  if (!r.topDone && r.travel >= r.dTop){ r.topDone=true; r.pause=6; toast("🎡 " + GAME.world.ferris, 6500); hearts(24); chime(784); chime(988,.2); chime(1319,.4);
    [0,900,1900].forEach(ms=>setTimeout(shootingStar, ms)); }
  if (r.pause>0){ r.pause-=dt; sp=0; }
  const left=Math.PI*2-r.travel; sp=Math.min(sp, Math.max(.04, left*.45));
  r.travel += sp*dt; ferWheel.rotation.z -= sp*dt;
  if (r.travel >= Math.PI*2) endMoment();
}
// 🏮 release sky lanterns together
function releaseLanterns(){
  if (sitting || frozen || !playing) return;
  beginMoment({ kind:"lanterns", standAt:LANT_SPOT.clone(), spawned:0 }, "Back to the island ×");
  chime(523); chime(784,.25); toast("🏮 " + GAME.world.lanterns, 7500); achieve("lanterns");
}
function updateLanterns(dt){
  const s=sitting, t=s.t;
  // the two of you let go of the first ones, then the whole meadow fills the sky
  const want = t<1.2 ? 0 : Math.min(isTouch?30:44, Math.floor((t-1.2)*6)+2);
  while (s.spawned < want){ const k=s.spawned++, near=k<2;
    const a=rnd(0,6.283), r=near ? .3 : rnd(1.5, 11), x=(near ? (k ? him : her).position.x : LANT.x+Math.sin(a)*r), z=(near ? (k ? him : her).position.z : LANT.z+Math.cos(a)*r);
    const L=lantern(x, groundH(x,z)+(near?1.8:rnd(.6,1.4)), z, true); L.userData.vy = rnd(.9,1.5); if (k%6===0) chime(880+k*12); }
  lantPaper.forEach((p,i)=>{ p.visible = i >= Math.min(6, s.spawned); });
  if (t > 16) endMoment();
}
// 💃 dance together on the dance floor: holding hands, stepping to the beat, slowly turning, with a twirl every 8 beats
function startDance(){
  if (sitting || frozen || !playing) return;
  beginMoment({ kind:"dance", ang:Math.random()*6.283, lastBeat:-1, standAt:DANCE.clone().add(new THREE.Vector3(0,0,0)) }, "Stop dancing ×");
  if (!musicBeat()){ initAudio(); if (actx) actx.resume(); musicOn = true; $("#music").style.opacity = 1; playSong(); }
  chime(784); chime(988,.15); toast("💃 " + GAME.world.dance, 5000); achieve("dance");
}
function updateDance(dt, t){
  const s=sitting, mb=musicBeat(), ph = mb ? mb[1] : (s.t*1.7)%1, bi = mb ? mb[0] : Math.floor(s.t*1.7);
  s.ang += dt*.5;
  const cx=DANCE.x, cz=DANCE.z, gy=walkH(cx,cz)+.09, r=.43, sa=Math.sin(s.ang), ca=Math.cos(s.ang);
  her.position.set(cx+sa*r, gy, cz+ca*r); him.position.set(cx-sa*r, gy, cz-ca*r);
  const face = Math.atan2(-sa, -ca);                      // she faces him, he faces her
  animatePerson(her, 1.1, dt, t); animatePerson(him, 1.1, dt, t);
  const bob = Math.pow(Math.sin(ph*Math.PI), 2)*.07, sway = Math.sin(t*2.3)*.06;
  her.position.y += bob; him.position.y += bob;
  // holding hands: arms reach forward towards each other
  [her, him].forEach(p => p.userData.arms.forEach((a,k)=>{ a.rotation.x=-1.05; a.rotation.z=(k?-1:1)*.22; }));
  let herYaw = face;
  if (bi % 8 === 7){ herYaw += ph*Math.PI*2; her.userData.arms[1].rotation.x = -2.9; him.userData.arms[0].rotation.x = -2.9; }   // the twirl
  her.rotation.set(0, herYaw, sway); him.rotation.set(0, face+Math.PI, -sway);
  her.userData.head.rotation.z = Math.sin(t*1.7)*.12; him.userData.head.rotation.z = -Math.sin(t*1.7)*.08;
  if (bi !== s.lastBeat){ s.lastBeat = bi; if (bi % 2 === 0) petalAt(cx+rnd(-.4,.4), gy+2, cz+rnd(-.4,.4)); if (bi % 8 === 0) burst(new THREE.Vector3(cx, gy+1.9, cz), 10, "#ff9ec0", true, .6); }
  // the camera slowly circles the two of you
  const cam = s.t*.22;
  s.cam = { pos:new THREE.Vector3(cx+Math.sin(cam)*5.4, gy+2.3, cz+Math.cos(cam)*5.4), look:new THREE.Vector3(cx, gy+1.15, cz) };
}
function updateSitting(dt, t){
  const s=sitting; s.t += dt;
  if (s.kind==="dance"){ updateDance(dt, t); return; }
  if (s.kind==="bench"){ const b=s.b, f={ x:Math.sin(b.yaw), z:Math.cos(b.yaw) }, r={ x:Math.cos(b.yaw), z:-Math.sin(b.yaw) }, y=b.y-.08;
    her.position.set(b.x - r.x*.36, y, b.z - r.z*.36); him.position.set(b.x + r.x*.36, y, b.z + r.z*.36);
    her.rotation.set(0,b.yaw,0); him.rotation.set(0,b.yaw,0); sitPose(her, -.32); sitPose(him, .1);
    her.position.addScaledVector(new THREE.Vector3(r.x,0,r.z), .06); her.rotation.z = -.08;            // leaning into you
    const sway=Math.sin(s.t*.18)*1.4;
    s.cam = { pos:new THREE.Vector3(b.x - f.x*3.4 + r.x*sway, b.y+2.1, b.z - f.z*3.4 + r.z*sway), look:new THREE.Vector3(b.x + f.x*14, b.y+1.1, b.z + f.z*14) };
    if (Math.random() < dt*.7){ const p=her.position.clone().add(new THREE.Vector3(r.x*.36, 1.6, r.z*.36)); petalAt(p.x, p.y, p.z); } }
  else if (s.kind==="ride"){ updateRide(dt);
    if (!sitting) return;
    const cab=gondolas[ride.k].userData.cab; cab.updateMatrixWorld();
    const P=cab.localToWorld(new THREE.Vector3(0,0,0)), f={ x:Math.sin(ferYaw), z:Math.cos(ferYaw) };
    her.position.copy(cab.localToWorld(new THREE.Vector3(-.3,-.14,-.25))); him.position.copy(cab.localToWorld(new THREE.Vector3(.3,-.14,-.25)));
    her.rotation.set(0,ferYaw,0); him.rotation.set(0,ferYaw,0); sitPose(her, -.3); sitPose(him, .1);
    // look out over the island, turning a little towards the moon near the top
    const up=Math.max(0,(P.y-FER_H)/FER_R), md=new THREE.Vector3(moon.position.x-P.x, 0, moon.position.z-P.z).normalize(), k=.25+.35*up;
    const dir=new THREE.Vector3(f.x*(1-k)+md.x*k, 0, f.z*(1-k)+md.z*k).normalize();
    s.cam = { pos:new THREE.Vector3(P.x - dir.x*3.1, P.y+1.65, P.z - dir.z*3.1), look:new THREE.Vector3(P.x + dir.x*30, P.y-6+up*6, P.z + dir.z*30) }; }
  else if (s.kind==="lanterns"){ updateLanterns(dt); if (!sitting) return;
    const f={ x:Math.sin(lantOut), z:Math.cos(lantOut) }, r={ x:Math.cos(lantOut), z:-Math.sin(lantOut) }, st=LANT_SPOT;
    her.position.set(st.x - r.x*.45, walkH(st.x,st.z), st.z - r.z*.45); him.position.set(st.x + r.x*.45, walkH(st.x,st.z), st.z + r.z*.45);
    her.rotation.set(0,lantOut,0); him.rotation.set(0,lantOut,0); animatePerson(her,0,dt,t); animatePerson(him,0,dt,t);
    her.userData.arms.forEach(a=>{ a.rotation.x = s.t<2.4 ? -2.4 : -.2; }); him.userData.arms.forEach(a=>{ a.rotation.x = s.t<2.4 ? -2.4 : -.2; });
    // filmed from the sea side, facing the two of you, with the lanterns rising all around and above
    const lift=Math.min(1, s.t/7), gy=walkH(st.x,st.z), sway=Math.sin(s.t*.25)*1.5;
    s.cam = { pos:new THREE.Vector3(st.x + f.x*6.2 + r.x*sway, gy+1.1, st.z + f.z*6.2 + r.z*sway), look:new THREE.Vector3(st.x, gy+1.4+lift*1.4, st.z) }; }
}
