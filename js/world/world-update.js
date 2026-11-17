// Shooting stars and the per-frame update for the outer areas.

/* ---------- shooting stars ---------- */
const shooters = [];
function shootingStar(){
  const a=rnd(0,6.28), r=rnd(70,140), head=new THREE.Group();
  head.position.set(her.position.x+Math.sin(a)*r, rnd(55,85), her.position.z+Math.cos(a)*r);
  const trail=[]; for(let k=0;k<10;k++){ const s=sprite("#fff3d6", 2.2-k*.18, 1-k*.09); s.material.fog=false; scene.add(s); s.position.copy(head.position); trail.push(s); }
  shooters.push({ p:head.position, v:new THREE.Vector3(rnd(-1,1),-.32,rnd(-1,1)).normalize().multiplyScalar(rnd(60,80)), life:1.3, trail });
}
let nextShooter = 12;

/* ---------- per-frame for the outer areas ---------- */
function updateWorld(dt, t){
  // hide far-away areas (the fog hides them anyway)
  regions.forEach(R=>{ R.g.visible = introCam || Math.hypot(camera.position.x-R.x, camera.position.z-R.z) < R.r + 115; });
  if (lagoonG.visible){
    lilyData.forEach((d,i)=>{ _wo.position.set(d.x, waveH(d.x,d.z,t)+.03, d.z); _wo.rotation.set(0,d.ry+Math.sin(t*.4+i)*.1,0); _wo.scale.setScalar(d.s); _wo.updateMatrix(); lilyPads.setMatrixAt(i,_wo.matrix); });
    lilyPads.instanceMatrix.needsUpdate = true; lilyPads.userData.blooms.material.opacity = .7+Math.sin(t*2)*.3;
    floatLanterns.forEach(l=>{ const u=l.userData, a=u.a+t*.05; l.position.set(LAGOON.x+Math.sin(a)*u.r, waveH(LAGOON.x+Math.sin(a)*u.r, LAGOON.z+Math.cos(a)*u.r, t), LAGOON.z+Math.cos(a)*u.r); l.rotation.z=Math.sin(t+u.p)*.08; });
  }
  updateFalls(dt, t); updateBlockworld(dt, t);
  if (villageG.visible){ fountainHeart.rotation.y = t*1.2; fountainHeart.position.y = 2.6+Math.sin(t*1.6)*.12; }
  if (hillG.visible){ hillStar.rotation.y = t*.8; hillStar.material.emissiveIntensity = 1.3+Math.sin(t*3)*.5; }
  if (ferG.visible){ ferBoost = Math.max(0, ferBoost-dt); if (!ride) ferWheel.rotation.z -= dt*(.12 + (ferBoost>0?.6:0));
    gondolas.forEach(g=>{ g.rotation.z = -ferWheel.rotation.z; }); ferWheel.userData.bulbs.material.opacity = ferBoost>0 ? .6+Math.sin(t*14)*.4 : .85+Math.sin(t*2)*.15; }
  // ambient shooting stars
  if (playing && (nextShooter -= dt) < 0){ nextShooter = rnd(14,26); shootingStar(); }
  for(let i=shooters.length-1;i>=0;i--){ const s=shooters[i]; s.life -= dt; s.p.addScaledVector(s.v, dt);
    for(let k=s.trail.length-1;k>0;k--) s.trail[k].position.lerp(s.trail[k-1].position, Math.min(1,dt*30)); s.trail[0].position.copy(s.p);
    s.trail.forEach((m,k)=> m.material.opacity = Math.max(0, Math.min(1,s.life*1.5))*(1-k*.09));
    if (s.life<=0){ s.trail.forEach(m=>{ scene.remove(m); m.material.dispose(); }); shooters.splice(i,1); } }
}
