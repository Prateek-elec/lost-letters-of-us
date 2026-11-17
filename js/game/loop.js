// Walking, the main frame loop and the camera.

/* ============================ LOOP ============================ */
function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.fov = w<h ? 65 : 55; camera.updateProjectionMatrix(); if(composer) composer.setSize(w,h); }
addEventListener("resize", resize); resize();

const $hud = $("#hud");
const clock = new THREE.Clock(), tmp = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
const occRay = new THREE.Raycaster();

// Adaptive quality: if the frame rate stays low, step down ONE notch at a time — sharpness first, then shadow
// detail, then shadows, then bloom — and step back up when there's plenty of headroom again.
const QUALITY = [
  { pr:1.5,  shadows:true,  shadowEvery:2, bloom:true  },
  { pr:1.25, shadows:true,  shadowEvery:2, bloom:true  },
  { pr:1,    shadows:true,  shadowEvery:2, bloom:true  },
  { pr:1,    shadows:true,  shadowEvery:4, bloom:true  },
  { pr:1,    shadows:false, shadowEvery:4, bloom:true  },
  { pr:.85,  shadows:false, shadowEvery:4, bloom:false },
];
const quality = { level: isTouch ? 1 : 0, frames:0, since:performance.now(), slow:0, fast:0, warm: performance.now()+5000, n:0 };
function applyQuality(){
  const Q = QUALITY[quality.level];
  renderer.setPixelRatio(Math.min(devicePixelRatio, Q.pr)); resize(); starsU.pr.value = renderer.getPixelRatio();
  if (renderer.shadowMap.enabled !== Q.shadows){ renderer.shadowMap.enabled = Q.shadows; scene.traverse(o=>{ if(o.material) [].concat(o.material).forEach(m=>m.needsUpdate=true); }); }
  bloomOn = Q.bloom && !!composer;
}
renderer.shadowMap.autoUpdate = false;   // shadows are redrawn every 2nd (or 4th) frame — looks the same, costs half
function checkQuality(){
  quality.frames++; const now=performance.now(); if (now - quality.since < 2500) return;
  const fps = quality.frames*1000/(now-quality.since); quality.frames=0; quality.since=now;
  if (now < quality.warm || document.hidden) return;
  if (fps < 40){ quality.slow++; quality.fast=0; } else if (fps > 57){ quality.fast++; quality.slow=0; } else { quality.slow=quality.fast=0; }
  if (quality.slow >= 1 && quality.level < QUALITY.length-1){ quality.level++; quality.slow=0; applyQuality(); }
  else if (quality.fast >= 4 && quality.level > 0){ quality.level--; quality.fast=0; applyQuality(); }
}
applyQuality();
camera.position.set(40, 30, 40);

function frame(){
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; timeU.value = t;
  scene.fog.density += ((introCam || (sitting && sitting.kind==="ride") ? .006 : .013) - scene.fog.density)*Math.min(1, dt*.8);
  checkQuality(); waterTimeU.value = reduce ? 0 : t;
  if (renderer.shadowMap.enabled && (quality.n++ % QUALITY[quality.level].shadowEvery) === 0) renderer.shadowMap.needsUpdate = true;

  // ---- movement
  let speed = 0;
  if (driving && swingT<=0){ updateCar(dt, t); seat(her, seatL); speed = Math.abs(C.vF); }
  else if (playing && !frozen && swingT<=0){
    let ix = (keys["d"]||keys["arrowright"]?1:0) - (keys["a"]||keys["arrowleft"]?1:0) + joyVec.x;
    let iz = (keys["w"]||keys["arrowup"]?1:0) - (keys["s"]||keys["arrowdown"]?1:0) - joyVec.y;
    if (Math.abs(ix)+Math.abs(iz) > .05) walkTarget = null;
    let mx=0, mz=0;
    if (walkTarget){ const dx=walkTarget.x-her.position.x, dz=walkTarget.z-her.position.z, d=Math.hypot(dx,dz); if(d<.3) walkTarget=null; else { mx=dx/d; mz=dz/d; } }
    else {
      const fx=-Math.sin(camYaw), fz=-Math.cos(camYaw), rx=-fz, rz=fx;
      mx = fx*iz + rx*ix; mz = fz*iz + rz*ix; const m=Math.hypot(mx,mz); if(m>1){ mx/=m; mz/=m; }
    }
    const mag = Math.hypot(mx,mz);
    if (mag>.05){
      speed = (keys["shift"] || boostHeld ? 8.5 : 4.6)*mag; her.position.x += mx*speed*dt; her.position.z += mz*speed*dt; collide(her.position);
      const want = Math.atan2(mx,mz); let d=want-her.rotation.y; while(d>Math.PI)d-=6.283; while(d<-Math.PI)d+=6.283; her.rotation.y += d*Math.min(1,dt*10);
      // gentle camera follow: swing round BEHIND her (the camera sits on the opposite side to where she faces)
      if (!walkTarget && !drag){ let cd=(her.rotation.y+Math.PI)-camYaw; while(cd>Math.PI)cd-=6.283; while(cd<-Math.PI)cd+=6.283; if (iz>.3) camYaw += cd*dt*.6; }
    }
  }
  if (!driving && !sitting) her.position.y = walkH(her.position.x, her.position.z);
  if (swingT>0){ swingT-=dt; swing.rotation.x = Math.sin(t*2.6)*.5*Math.min(1,swingT); const sp=new THREE.Vector3(0,-2.5,0).applyEuler(swing.rotation).add(swing.position);
    her.position.set(sp.x, sp.y-.55, sp.z); her.rotation.y = Math.atan2(SWING.x-swing.position.x, SWING.z-swing.position.z)+Math.PI/2; }
  else { swing.rotation.x *= .95; if (wasSwinging){ wasSwinging=false; driving=swingWasDriving; her.quaternion.identity(); } }
  if (!driving && !sitting) animatePerson(her, speed, dt, t);
  shadowBlob.visible = !driving;
  updateProps(dt, t); updateTracks(dt); updateWind(dt, t); updateZones(dt, t);
  occluders.forEach(tr=>{ const u=tr.userData; if(u.shake>.001){ tr.rotation.z=Math.sin(t*28)*u.shake; tr.rotation.x=Math.cos(t*23)*u.shake*.6; u.shake*=Math.exp(-dt*3.5); } else if (u.shake){ tr.rotation.z=0; tr.rotation.x=0; u.shake=0; } });
  shadowBlob.position.set(her.position.x, walkH(her.position.x,her.position.z)+.03, her.position.z);

  // ---- him: in the car, walking beside her, sitting with her, or (finale) coming out of the door
  if (sitting) updateSitting(dt, t);
  else if (him.visible && himInCar){ seat(him, seatR); }
  else if (him.visible){
    if (himWalk>0){ himWalk -= dt*.5; him.position.z += dt*.6; him.position.y = walkH(him.position.x, him.position.z); animatePerson(him, himWalk>0?2:0, dt, t); }
    else { animatePerson(him, 0, dt, t); him.position.y = walkH(him.position.x, him.position.z); }
    // walking together: Prateek keeps to her right side, side by side
    if (!finaleOn && himWalk<=0){
      const tx=her.position.x+Math.cos(her.rotation.y)*.85, tz=her.position.z-Math.sin(her.rotation.y)*.85, dx=tx-him.position.x, dz=tz-him.position.z, d=Math.hypot(dx,dz);
      if (d>8){ him.position.set(tx, 0, tz); collide(him.position); }                       // fell far behind (e.g. after a teleport): catch up
      else if (d>.25){ const s=Math.min(9.5, d*3.2); him.position.x+=dx/d*s*dt; him.position.z+=dz/d*s*dt; collide(him.position); animatePerson(him, s, dt, t);
        let ry=d>.7 ? Math.atan2(dx,dz) : her.rotation.y, dr=ry-him.rotation.y; while(dr>Math.PI)dr-=6.283; while(dr<-Math.PI)dr+=6.283; him.rotation.y += dr*Math.min(1,dt*10); }
      else { let dr=her.rotation.y-him.rotation.y; while(dr>Math.PI)dr-=6.283; while(dr<-Math.PI)dr+=6.283; him.rotation.y += dr*Math.min(1,dt*6); } }
    if (finaleOn) { him.rotation.y = 0; her.rotation.y = Math.PI; }
  }

  // ---- door
  if (doorOpening){ doorT=Math.min(1,doorT+dt*.45); const e=1-Math.pow(1-doorT,3); hinge.rotation.y=-e*1.9; portal.material.opacity=e*.75;
    doorGlow.material.opacity=.3+e*.25; doorGlow.scale.setScalar(6+e*3); doorLight.intensity=e*1.1; }

  // ---- fairy
  const nIdx = nextIdx();
  const idle = playing && !frozen && speed < .1;
  const goalPos = tmp.copy(her.position).add(new THREE.Vector3(Math.sin(t*.9)*1.1, (driving?2.3:2.1)+Math.sin(t*2.2)*.2, Math.cos(t*.9)*1.1));
  fairy.position.lerp(goalPos, Math.min(1, dt*(driving?4:2.5)));
  wings.forEach((w,k)=> w.rotation.y = (k?1:-1)*(.4+Math.sin(t*28)*.6));
  fairyGlow.scale.setScalar(1.2+Math.sin(t*4)*.15);
  trail.unshift(trail.pop().copy(fairy.position)); trail.forEach((v,i)=>{ trailPos[i*3]=v.x; trailPos[i*3+1]=v.y-i*.01; trailPos[i*3+2]=v.z; }); trailGeo.attributes.position.needsUpdate=true;

  // ---- landmarks & beacons
  landmarks.forEach(l=>{ l.anim(t); l.marker.position.y = 4.4+Math.sin(t*2+l.idx)*.2; l.marker.rotation.y=t*1.5;
    const target = (playing && l.idx===nIdx) ? .13 : 0; l.beacon.material.opacity += (target - l.beacon.material.opacity)*dt*2; });
  doorBeacon.material.opacity += (((playing && nIdx===total && !finaleOn) ? .16 : 0) - doorBeacon.material.opacity)*dt*2;
  doorHeart.material.emissiveIntensity = isOpen(total) ? 1.2+Math.sin(t*4)*.8 : .6;

  // ---- fairy ring
  ringCooldown -= dt;
  const inRing = Math.hypot(her.position.x-RING.x, her.position.z-RING.z) < 1.4;
  ringMushrooms.forEach((m,i)=>{ m.children[1].material.emissiveIntensity = inRing ? 1.8+Math.sin(t*6+i)*.8 : .75; });
  if (inRing && ringCooldown<0 && playing){ ringCooldown = 12; burst(her.position.clone().add(new THREE.Vector3(0,1,0)), 40, "#ff9ed2"); toast("🍄 " + GAME.fairyRing, 5500); chime(784); chime(1047,.15); chime(1319,.3); }

  // ---- water (the waves themselves move on the graphics card, see the water material in setup.js)
  if (!reduce) moonPath.material.opacity = .18 + Math.sin(t*2)*.04;

  // ---- fireflies, petals, lanterns, clouds
  for(let i=0;i<flyN;i++){ const [cx,cz,w,h,p]=flySeed[i]; const aa=p+t*.25*(i%2?1:-1); const x=cx+Math.sin(aa)*w+Math.sin(t*.7+p)*.6, z=cz+Math.cos(aa)*w+Math.cos(t*.6+p)*.6;
    flyPos[i*3]=x; flyPos[i*3+1]=Math.max(groundH(x,z),.1)+h+Math.sin(t*1.3+p)*.4; flyPos[i*3+2]=z; }
  flyGeo.attributes.position.needsUpdate=true; flies.material.opacity=.65+Math.sin(t*2.3)*.3;
  for(let i=0;i<petN;i++){ const s=petSeed[i]; s[1] -= dt*(.6+(i%3)*.2); if(s[1]<0){ s[1]=10+Math.random()*4; s[0]=rnd(-14,14); s[2]=rnd(-14,14); }
    petPos[i*3]=her.position.x+s[0]+Math.sin(t*.8+s[3])*1.2; petPos[i*3+1]=her.position.y+s[1]; petPos[i*3+2]=her.position.z+s[2]+Math.cos(t*.6+s[3]); }
  petGeo.attributes.position.needsUpdate=true;
  updateSkyLanterns(dt, t);
  clouds.forEach((c,i)=>{ c.position.x += Math.sin(t*.05+i)*.01; });
  for(let i=bursts.length-1;i>=0;i--){ const b=bursts[i], u=b.userData; u.life-=dt*u.decay; b.position.addScaledVector(u.v,dt); u.v.y-=dt*1.2; u.v.multiplyScalar(.98);
    b.material.opacity=Math.max(0,u.life)*.7; if(u.life<=0){ scene.remove(b); b.material.dispose(); bursts.splice(i,1); } }

  // ---- camera
  if (introCam){
    const a = t*.05; camPos.set(Math.sin(a)*100, 50, Math.cos(a)*100); camLook.set(0,0,0);
    camera.position.lerp(camPos, .05); camera.lookAt(camLook);
  } else {
    let yaw = camYaw, dist = camDist, pitch = camPitch, look = her.position.clone().add(new THREE.Vector3(0,1.3,0));
    if (driving && !finaleOn){
      // follow behind the car — faster when driving fast — and look a little ahead of it
      if (t - lastDragT > 1.6 && C.vF > 1.2){ let cd = (C.heading + Math.PI) - camYaw; while(cd>Math.PI)cd-=6.283; while(cd<-Math.PI)cd+=6.283; camYaw += cd*Math.min(1, dt*(1.8 + C.vF*.12)); }
      yaw = camYaw; dist = camDist + 1.4 + Math.abs(C.vF)*.2; pitch = camPitch + .04;
      look.set(C.pos.x + Math.sin(C.heading)*Math.max(0,C.vF)*.2, C.y + 1.1, C.pos.z + Math.cos(C.heading)*Math.max(0,C.vF)*.2);
    }
    const baseFov = innerWidth<innerHeight ? 65 : 55; camera.fov += ((baseFov + (driving?Math.min(16, Math.abs(C.vF)*.6):0) + (C.boost?4:0)) - camera.fov)*Math.min(1,dt*3); camera.updateProjectionMatrix();
    if (finaleOn){ yaw = t*.15; dist = 9; pitch = .3; look.set(DOOR.x, 1.8, DOOR.z+1.4); }
    camPos.set(look.x + Math.sin(yaw)*Math.cos(pitch)*dist, look.y + Math.sin(pitch)*dist, look.z + Math.cos(yaw)*Math.cos(pitch)*dist);
    if (fwShow.on){ // firework show: rise above the treetops behind her and look up at the sky
      camPos.copy(fwShow.base).addScaledVector(fwShow.dir, -7); camPos.y = fwShow.base.y + 10;
      look.copy(fwShow.C); look.y -= 3; }
    if (sitting && sitting.cam){ camPos.copy(sitting.cam.pos); look.copy(sitting.cam.look); }   // bench / Ferris ride / lanterns
    if (!finaleOn && !fwShow.on && !sitting){ const dir = tmp.copy(camPos).sub(look); const full = dir.length(); dir.normalize();
      occRay.set(look, dir); occRay.far = full; const hit = occRay.intersectObjects(occluders, true)[0];
      if (hit) camPos.copy(look).addScaledVector(dir, Math.max(driving?3.4:1.6, hit.distance - .4)); }
    camPos.y = Math.max(camPos.y, carGround(camPos.x, camPos.z)+.7);
    camera.position.lerp(camPos, 1-Math.exp(-dt*(introBlend>0?2:6))); introBlend = Math.max(0, introBlend-dt);
    if (window.__snap){ camera.position.copy(camPos); camLook.copy(look); camera.lookAt(camLook); }
    if (C.shake>.01){ camera.position.x += rnd(-1,1)*C.shake*.3; camera.position.y += rnd(-1,1)*C.shake*.3; }
    camLook.lerp(look, Math.min(1, dt*6)); camera.lookAt(camLook);
  }
  moonLight.position.set(her.position.x-30, 45, her.position.z-40); moonLight.target.position.copy(her.position);
  sky.position.copy(camera.position);

  // ---- labels
  if (playing){
    interactables.forEach((it,k)=>{
      const el = tags[k]; const tp = it.tagPos || it.pos; tmp.set(tp.x, it.tagY!==undefined ? it.tagY : it.tagH && it.pos===hoops[0].position ? tp.y+2.7 : groundH(tp.x,tp.z) + (it.tagH || (it.kind==="chapter"?4.9: it.kind==="door"?5.6: it.kind==="label"?2.4:3.4)), it.kind==="door"?DOOR.z:tp.z);
      const dist = camera.position.distanceTo(tmp); tmp.project(camera);
      const hide = tmp.z>1 || dist>34 || Math.abs(tmp.x)>1.1 || Math.abs(tmp.y)>1.1;
      el.classList.toggle("hidden", hide);
      if(!hide) el.style.transform = `translate(${(tmp.x*.5+.5)*innerWidth}px, ${(-tmp.y*.5+.5)*innerHeight}px) translate(-50%,-100%)`;
    });
    tmp.copy(fairy.position).add(new THREE.Vector3(0,.35,0)).project(camera);
    const bw = fairyBubble.offsetWidth || 220; let bx = (tmp.x*.5+.5)*innerWidth + 14; bx = Math.max(8, Math.min(innerWidth - bw - 8, bx));
    let by = Math.max(fairyBubble.offsetHeight + 60, (-tmp.y*.5+.5)*innerHeight);
    fairyBubble.style.transform = `translate(${bx}px, ${by}px) translate(0,-100%)`;
    updateInteract();
    $hud.classList.toggle("frozen", frozen);
  }

  updateCursor(dt);
  if (scopeOpen) drawScope(t);   // the telescope covers the screen, so the 3D island can rest
  else if (composer && bloomOn) composer.render(); else renderer.render(scene, camera);
  if (snapReq){ snapReq=false; captureSnapshot(scopeOpen ? $("#scopec") : canvas); }
  requestAnimationFrame(frame);
}
let introBlend = 1.5;
requestAnimationFrame(frame);
