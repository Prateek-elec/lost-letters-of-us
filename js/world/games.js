// Heart hunt, Love Lap, extra meadow trees, per-frame meadow update.

/* ---------- heart hunt ---------- */
const HEARTS_N = 30, heartsHunt = []; let heartsGot = 0;
{
  const geo=new THREE.ExtrudeGeometry(hs,{depth:.12,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1}); geo.center();
  let tries=0; while(heartsHunt.length<HEARTS_N && tries<1500){ tries++; const a=rnd(0,6.28), r=coastR(a)*rnd(.15,.82), x=Math.sin(a)*r, z=Math.cos(a)*r;
    if (groundH(x,z) < .4) continue;
    if ([LANT, FALLS, VILLAGE, HILL, BW].some(q=>Math.hypot(x-q.x, z-q.z) < 11) || Math.hypot(x-FER.x, z-FER.z) < 10) continue;   // keep the special moments clear
    if (!allColliders().every(c=>Math.hypot(x-c.x,z-c.z)>c.r+1.2)) continue;
    if (Object.values(ZONES).some(zn=>Math.hypot(x-zn.x,z-zn.z)<5)) continue;
    if (heartsHunt.some(h=>Math.hypot(x-h.position.x,z-h.position.z)<5)) continue;
    const m=new THREE.Mesh(geo, E("#ff5f8f",1.3)); m.scale.setScalar(1.3); m.position.set(x, groundH(x,z)+1.1, z); m.userData.base=m.position.y; scene.add(m);
    const gl=sprite("#ff9ec0",1.6,.5); m.add(gl); heartsHunt.push(m); }
}
function updateHearts(dt,t){
  for(const h of heartsHunt){ if(!h.visible) continue; h.rotation.y=t*2; h.position.y=h.userData.base+Math.sin(t*2+h.position.x)*.2;
    if (Math.hypot(h.position.x-her.position.x,h.position.z-her.position.z)<(driving?1.7:1.2) && Math.abs(h.position.y-her.position.y)<2.5){
      h.visible=false; heartsGot++; burst(h.position.clone(), 18); chime(1047+heartsGot*20); updateStats();
      if (heartsGot===heartsHunt.length){ achieve("hearts"); toast("💗 You found all "+heartsHunt.length+" hearts! That’s how many times a day I think of you… at least.", 6500); launchFireworks(8); hearts(40); }
      else if (heartsGot===1) say(`You found a floating heart! There are <b>${heartsHunt.length}</b> hidden around the island 💗`, 5000);
    } }
}

/* ---------- love lap (time trial through hoops) ---------- */
const HOOP_A = [.25, 1.45, 2.75, 3.45, 4.25, 5.35];
const hoops = HOOP_A.map((a,i)=>{
  const r=ringR(a), p=P(a,r); const g=new THREE.Group(); g.position.set(p.x, groundH(p.x,p.z)+2, p.z);
  const tx=Math.cos(a), tz=-Math.sin(a); g.rotation.y=Math.atan2(tx,tz);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.9,.14,8,32), E("#ff9ec0",1)); g.add(ring);
  if (i===0){ const ban=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.55), new THREE.MeshBasicMaterial({ side:THREE.DoubleSide, map:canvasTex(512,100,(x,w,h)=>{ for(let k=0;k<26;k++){ x.fillStyle=k%2?"#fff":"#2b2340"; x.fillRect(k*20,0,20,h/2); x.fillStyle=k%2?"#2b2340":"#fff"; x.fillRect(k*20,h/2,20,h/2);} x.fillStyle="#ff5f8f"; x.fillRect(120,10,272,80); x.fillStyle="#fff"; x.font=`700 54px ${SERIF}`; x.textAlign="center"; x.fillText("LOVE LAP",256,70); }) }));
    ban.position.y=2.35; g.add(ban); }
  scene.add(g); return g;
});
let lap = { on:false, next:0, t0:0, best: (()=>{ try { return +localStorage.getItem("love-lap-best")||0; } catch(e){ return 0; } })() };
function updateLap(dt,t){
  hoops.forEach((h,i)=>{ const target = lap.on ? i===lap.next : i===0; const m=h.children[0].material;
    m.emissive.set(target?"#ffd36b":"#ff9ec0"); m.color.set(target?"#ffd36b":"#ff9ec0"); m.emissiveIntensity = target ? 1.6+Math.sin(t*6)*.6 : .5; h.scale.setScalar(target?1+Math.sin(t*4)*.04:1); });
  if (!driving) return;
  const h=hoops[lap.on?lap.next:0]; if (Math.hypot(h.position.x-C.pos.x,h.position.z-C.pos.z) < 2){
    if (!lap.on){ lap.on=true; lap.next=1; lap.t0=t; chime(660); toast("🏁 Love Lap started! Drive through the glowing gold hoops.", 3500); }
    else if (lap.next===0){ achieve("lap"); const time=t-lap.t0; lap.on=false; const best=!lap.best||time<lap.best; if(best){ lap.best=time; try{ localStorage.setItem("love-lap-best", time.toFixed(2)); }catch(e){} }
      toast(`🏁 Lap finished in ${time.toFixed(1)}s${best?" — new record! 💖":` (best ${lap.best.toFixed(1)}s)`}`, 5000); launchFireworks(best?6:3); chime(784); chime(1047,.15); chime(1319,.3); }
    else { chime(880+lap.next*60); burst(h.position.clone(), 12, "#ffd36b", false, 1); lap.next=(lap.next+1)%hoops.length; }
    updateStats();
  }
  if (lap.on) updateStats(t);
}
function updateStats(t){
  const el=$("#stats"); const parts=[];
  if (heartsGot) parts.push(`💗 ${heartsGot}/${heartsHunt.length}`);
  if (lap.on) parts.push(`⏱ ${(t!==undefined?t-lap.t0:0).toFixed(1)}s · hoop ${lap.next===0?hoops.length:lap.next}/${hoops.length}`);
  else if (lap.best) parts.push(`🏁 best ${lap.best.toFixed(1)}s`);
  el.textContent = parts.join("   "); el.classList.toggle("show", parts.length>0);
}

/* ---------- more trees in the bigger world ---------- */
{ let n=0, tries=0;
  while(n<(isTouch?2:4) && tries<600){ tries++; const a=rnd(0,6.28), r=coastR0(a)*rnd(.5,.8), x=Math.sin(a)*r, z=Math.cos(a)*r;
    if (!allColliders().every(c=>Math.hypot(x-c.x,z-c.z)>c.r+2.5) || onRoad(x,z)) continue;
    if (Object.values(ZONES).some(zn=>Math.hypot(x-zn.x,z-zn.z)<7.5)) continue;
    if (hoops.some(h=>Math.hypot(x-h.position.x,z-h.position.z)<5) || rampH(x,z)>-50 || Math.hypot(x-DANCE.x,z-DANCE.z)<5) continue;
    blossomTree(x,z,rnd(.85,1.25),["#f2a7bb","#f6c1d0","#f4cd84","#e9a6ff"][n%4], n%4===0); n++; } }

/* ---------- per-frame for zones ---------- */
let lastBeat = -1;
function updateZones(dt, t){
  // gallery auto-advance when nearby
  const nearGal = Math.hypot(her.position.x-galG.position.x, her.position.z-galG.position.z) < 12;
  if (nearGal && panelKind!=="gallery"){ galAuto += dt; if (galAuto>5) galNav(1); }
  // music-reactive jukebox
  const mb = musicBeat(), playingMusic = !!mb;
  const beatIdx = mb ? mb[0] : 0, beatPhase = mb ? mb[1] : 0;
  const pulse = playingMusic ? Math.pow(1-beatPhase,3) : .3+.2*Math.sin(t*2);
  jukeLights.forEach((m,k)=>{ if (m.userData.speaker){ m.scale.set(1,1+pulse*.6,1); return; } m.material.emissiveIntensity = 1 + pulse*2 + (k%2?Math.sin(t*5):0)*.3; });
  jukeLight.intensity = .6 + pulse*1.6;
  danceTiles.forEach(tl=>{ const [i,j]=tl.userData.ij; const on = playingMusic ? ((i+j+beatIdx)%3===0 || (i*j+beatIdx)%5===0) : ((i+j)%2===Math.floor(t)%2);
    tl.material.emissive.set(["#ff5fa2","#ffd36b","#7ef0ff","#c9a8ff"][(i+j*2+beatIdx)%4]); tl.material.emissiveIntensity += ((on?1.4*(.5+pulse):.08) - tl.material.emissiveIntensity)*Math.min(1,dt*10); });
  notes3d.forEach(n=>{ const k=(t*.3+n.userData.p)%1; n.position.set(Math.sin(k*8+n.userData.p*9)*1.2, 2.2+k*2.6, .4+Math.cos(k*6)*.4); n.material.opacity = playingMusic ? Math.sin(k*Math.PI)*.95 : 0; });
  // the car dances on the dance floor
  if (playingMusic && beatIdx!==lastBeat){ lastBeat=beatIdx; if (driving && Math.hypot(C.pos.x-DANCE.x, C.pos.z-DANCE.z) < 3.2 && Math.abs(C.vF)<2){ C.squashV -= 1.6; if (beatIdx%4===0) petalAt(C.pos.x, C.y+1.4, C.pos.z); } }
  // fireworks button when driven over
  if (driving && !fwShow.on && Math.hypot(C.pos.x-FW.x, C.pos.z-FW.z) < 1.5 && fwCool<=0){ fwCool=6; launchFireworks(3); toast("🎆 Click the big red button for the grand firework show!", 3500); }
  fwBtn.material.emissiveIntensity = fwShow.on ? .3 : .6+Math.sin(t*4)*.3;
  updateFireworks(dt, t); updateHearts(dt,t); updateLap(dt,t); updateWorld(dt,t);
}
