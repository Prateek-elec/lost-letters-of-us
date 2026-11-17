// The pink car, its physics, ramps, tyre tracks and knockable props.

/* ============================ VEHICLE ============================ */
let driving = true, himInCar = true, lastDragT = -9;   // false while walking, or while he's "behind the Last Door" in the finale
const car = new THREE.Group(); scene.add(car);
car.rotation.order = "YXZ";
const carBody = new THREE.Group(); car.add(carBody);
const wheels = [];
{
  const pink = M("#ff8fb1",{roughness:.4,metalness:.15}), pink2 = M("#ff7aa2",{roughness:.4,metalness:.15}), cream = M("#fff3e6",{roughness:.6}), dark = M("#2d2340");
  const add = (geo, mat, x, y, z, rx=0, ry=0, rz=0) => { const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); carBody.add(m); return m; };
  add(new THREE.BoxGeometry(1.5,.42,2.5), pink, 0,.62,0);
  add(new THREE.BoxGeometry(1.42,.22,.85), pink2, 0,.9,.78, .07);
  add(new THREE.BoxGeometry(1.42,.3,.62), pink2, 0,.95,-.92);
  [[.82],[-.82]].forEach(([z])=>[-.74,.74].forEach(x=>{
    add(new THREE.CylinderGeometry(.42,.42,.32,14,1,false,0,Math.PI), pink, x,.52,z, 0,0,Math.PI/2); }));
  add(new THREE.BoxGeometry(1.56,.16,.16), cream, 0,.5,1.27);
  add(new THREE.BoxGeometry(1.56,.16,.16), cream, 0,.5,-1.27);
  [-.33,.33].forEach(x=>{ add(new THREE.BoxGeometry(.5,.14,.5), cream, x,.9,-.18); add(new THREE.BoxGeometry(.5,.55,.12), cream, x,1.12,-.46, -.12); });
  const glass = new THREE.MeshStandardMaterial({ color:"#cfe6ff", transparent:true, opacity:.32, roughness:.05, metalness:.4 });
  add(new THREE.BoxGeometry(1.3,.48,.04), glass, 0,1.24,.32, -.38);
  add(new THREE.BoxGeometry(1.36,.05,.06), cream, 0,1.47,.24, -.38);
  add(new THREE.TorusGeometry(.14,.025,6,16), dark, -.33,1.08,.1, -1.0);
  [-.5,.5].forEach(x=>{ add(new THREE.SphereGeometry(.12,10,8), E("#fff2c4",2.2), x,.68,1.27); add(new THREE.BoxGeometry(.2,.1,.05), E("#ff4d6d",1.6), x,.78,-1.24); });
  const heartG = new THREE.ExtrudeGeometry(hs,{depth:.05,bevelEnabled:false});
  const orn = add(heartG, E("#f4cd84",1.1), 0,1.08,1.12); orn.scale.setScalar(.45);
  add(new THREE.CylinderGeometry(.012,.012,1.1,4), cream, .6,1.55,-1.05);
  const balloon = add(heartG, E("#ff5f8f",.7), .6,2.15,-1.05); balloon.scale.setScalar(.75); balloon.userData.balloon = true;
  carBody.userData.balloon = balloon;
  // wheels
  [[-.74,.82,1],[.74,.82,1],[-.74,-.82,0],[.74,-.82,0]].forEach(([x,z,front])=>{
    const pivot = new THREE.Group(); pivot.position.set(x,.3,z); car.add(pivot);
    const spin = new THREE.Group(); pivot.add(spin);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.26,16), dark); tire.rotation.z = Math.PI/2; spin.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.27,8), cream); hub.rotation.z = Math.PI/2; spin.add(hub);
    wheels.push({ pivot, spin, front });
  });
  const headL = new THREE.SpotLight("#ffe6c0", 1.7, 24, .55, .55, 1.4); headL.position.set(0,.7,1.25); headL.target.position.set(0,-.4,9);
  car.add(headL); car.add(headL.target);
  [-.5,.5].forEach(x=>{ const g=sprite("#fff0c8",1.1,.7); g.position.set(x,.68,1.35); car.add(g); });
}
shadowy(car);

// love-leap ramps: the original one in the meadow + three on the ring road (alternating directions)
const RAMPS = [{ x: Math.sin(3.4)*10.5, z: Math.cos(3.4)*10.5, a: 3.4 + Math.PI/2 }];
[[1.17,1],[2.0,-1],[5.68,1]].forEach(([a,dir])=>{ const p=ring(a), q=ring(a+.01), o=ring(a-.01);
  RAMPS.push({ x:p.x, z:p.z, a: Math.atan2(q.x-o.x, q.z-o.z) + (dir<0?Math.PI:0) }); });
RAMPS.forEach(R=>R.g = groundH(R.x, R.z));
const RAMP = RAMPS[0];
function rampH(x,z){
  let best = -99;
  for(const R of RAMPS){ const dx=x-R.x, dz=z-R.z; if (dx*dx+dz*dz > 9) continue;
    const u=dx*Math.sin(R.a)+dz*Math.cos(R.a), w=dx*Math.cos(R.a)-dz*Math.sin(R.a);
    if (Math.abs(w)<1.2 && u>-1.6 && u<1.6) best = Math.max(best, R.g + (u+1.6)/3.2*1.5); }
  return best;
}
// the lagoon bridge arches over the water; its ends meet the ground on each shore
BRIDGE.hA = groundH(LAGOON.x-BRIDGE.dx*BRIDGE.half, LAGOON.z-BRIDGE.dz*BRIDGE.half);
BRIDGE.hB = groundH(LAGOON.x+BRIDGE.dx*BRIDGE.half, LAGOON.z+BRIDGE.dz*BRIDGE.half);
function bridgeH(x,z){
  const lx=x-LAGOON.x, lz=z-LAGOON.z, u=lx*BRIDGE.dx+lz*BRIDGE.dz, w=lx*BRIDGE.dz-lz*BRIDGE.dx;
  if (Math.abs(w)>BRIDGE.w || Math.abs(u)>BRIDGE.half) return -99;
  const t=(u+BRIDGE.half)/(2*BRIDGE.half); return BRIDGE.hA+(BRIDGE.hB-BRIDGE.hA)*t + 1.1*Math.sin(Math.PI*t);
}
function pierH(x,z){
  const u=x*PIER.dx+z*PIER.dz, w=x*PIER.dz-z*PIER.dx;
  return (Math.abs(w)<PIER.half && u>PIER.u0 && u<PIER.u1) ? PIER.h : -99;
}
function carGround(x,z){ return Math.max(groundH(x,z), rampH(x,z), bridgeH(x,z), pierH(x,z)); }
for(const R of RAMPS){
  const sh = new THREE.Shape(); sh.moveTo(-1.6,0); sh.lineTo(1.6,0); sh.lineTo(1.6,1.5); sh.lineTo(-1.6,0);
  const geo = new THREE.ExtrudeGeometry(sh,{depth:2.4,bevelEnabled:false}); geo.translate(0,0,-1.2);
  const ramp = new THREE.Mesh(geo, M("#ff9ec0",{roughness:.6})); ramp.position.set(R.x, R.g, R.z); ramp.rotation.y = R.a - Math.PI/2;
  scene.add(shadowy(ramp));
  const th = Math.atan(1.5/3.2);
  [-1.05,1.05].forEach(w=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(3.55,.03,.14), M("#fff3e6")); s.position.set(0,1.5/2+.02,w); s.rotation.z=th; ramp.add(s); });
  [-.9,.4].forEach(u=>{ const holder=new THREE.Group(); holder.position.set(u,(u+1.6)/3.2*1.5+.03,0); holder.rotation.z=th;
    const h=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.02,bevelEnabled:false}), E("#fff3e6",.5)); h.rotation.set(-Math.PI/2,0,-Math.PI/2); h.scale.setScalar(1.3); holder.add(h); ramp.add(holder); });
}

const C = { pos:new THREE.Vector3(START.x,0,START.z), vel:new THREE.Vector3(), heading:Math.PI, steer:0, y:groundH(START.x,START.z), vy:0, prevG:groundH(START.x,START.z),
  onGround:true, spin:0, squash:0, squashV:0, distAcc:0, shake:0, vF:0, vS:0, throttle:0, petalT:0, airT:0 };
const carExtra = [{ x:DOOR.x, z:DOOR.z, r:3.35 }];
const fwdV = new THREE.Vector3(), sideV = new THREE.Vector3(), vt = new THREE.Vector3(), qt = new THREE.Quaternion();

/* ---------- tire tracks ---------- */
const TRK_N = isTouch ? 360 : 600;
const trkGeo = new THREE.PlaneGeometry(.22,.42); trkGeo.rotateX(-Math.PI/2);
const trk = new THREE.InstancedMesh(trkGeo, new THREE.MeshBasicMaterial({ color:"#15122c", transparent:true, opacity:.4, depthWrite:false }), TRK_N);
trk.frustumCulled = false; scene.add(trk);
const trkData = Array.from({length:TRK_N}, ()=>({ x:0, y:-50, z:0, h:0, age:99 }));
let trkI = 0;
function addTrack(x,z,h){ const d=trkData[trkI]; d.x=x; d.z=z; d.y=carGround(x,z)+.05; d.h=h; d.age=0; trkI=(trkI+1)%TRK_N; }
const trkM = new THREE.Matrix4(), trkS = new THREE.Vector3(), trkP = new THREE.Vector3(), trkQ = new THREE.Quaternion(), UP = new THREE.Vector3(0,1,0);
function updateTracks(dt){
  for(let i=0;i<TRK_N;i++){ const d=trkData[i]; d.age+=dt; const s = d.age>16 ? 0 : Math.min(1,(16-d.age)/5);
    trkP.set(d.x,d.y,d.z); trkQ.setFromAxisAngle(UP,d.h); trkS.set(s,1,s); trkM.compose(trkP,trkQ,trkS); trk.setMatrixAt(i,trkM); }
  trk.instanceMatrix.needsUpdate = true;
}

/* ---------- knockable props ---------- */
const props = [];
function addProp(obj, x, z, r, y0, group){
  obj.position.set(x, groundH(x,z)+y0, z); scene.add(shadowy(obj));
  const p = { mesh:obj, pos:obj.position, vel:new THREE.Vector3(), ang:new THREE.Vector3(), r, awake:false, sleepT:0, group,
    home:obj.position.clone(), homeQ:obj.quaternion.clone(), lost:0 };
  props.push(p); return p;
}
function flowerPot(){
  const g=new THREE.Group();
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.3,.22,.45,10), M("#d9826b")); g.add(pot);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,6,12), M("#e89a82")); rim.rotation.x=Math.PI/2; rim.position.y=.22; g.add(rim);
  const col=["#ff8fb0","#f4cd84","#c9a8ff","#ffd1dc"][Math.floor(Math.random()*4)];
  for(let i=0;i<3;i++){ const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),E(col,.5)); f.position.set(Math.cos(i*2.1)*.12,.38+i*.04,Math.sin(i*2.1)*.12); g.add(f); }
  const leaf=new THREE.Mesh(new THREE.SphereGeometry(.2,7,5,0,6.3,0,1.4), M("#3f8a6e")); leaf.position.y=.2; g.add(leaf);
  return g;
}
function loveBox(){
  const g=new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(.54,.54,.54), M("#f6b6c8",{roughness:.7})));
  [0,1,2,3].forEach(k=>{ const h=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.02,bevelEnabled:false}), E("#ff5f8f",.4)); h.scale.setScalar(.45);
    const hold=new THREE.Group(); h.position.set(0,0,.275); hold.add(h); hold.rotation.y=k*Math.PI/2; g.add(hold); });
  const rib=new THREE.Mesh(new THREE.BoxGeometry(.56,.08,.56), M("#fff3e6")); g.add(rib);
  return g;
}
function allColliders(){ return colliders.concat(carExtra); }
function freeSpot(x,z,min){ return allColliders().every(c=>Math.hypot(x-c.x,z-c.z) > c.r+min) && rampH(x,z)<-50 && !isSand(x,z) && !onRoad(x,z); }

// flower pots along the paths
{ let n=0, tries=0;
  while(n<16 && tries<400){ tries++; const i=Math.floor(Math.random()*5), t=Math.random(); const a=PATH_PTS[i].clone().multiplyScalar(.82), b=PATH_PTS[(i+1)%5].clone().multiplyScalar(.82);
    const x=a.x+(b.x-a.x)*t+rnd(-2.2,2.2), z=a.z+(b.z-a.z)*t+rnd(-2.2,2.2);
    if (!freeSpot(x,z,1.2) || Math.hypot(x,z)<5) continue; addProp(flowerPot(), x, z, .3, .23, "pot"); n++; } }
// stack of love boxes (each one holds a little gift, see GAME.gifts)
const BOXES = new THREE.Vector3(3.2, 0, 14.2);
{ const layout=[[-.56,0],[0,0],[.56,0],[-.28,1],[.28,1],[0,2]];
  layout.forEach(([x,l])=> addProp(loveBox(), BOXES.x+x, BOXES.z, .27, .27+l*.55, "box")); }

function wake(p){ if(p.awake) return; p.awake=true; p.sleepT=0;
  props.forEach(o=>{ if(!o.awake && o!==p && o.pos.distanceTo(p.pos) < (o.r+p.r)*1.6+.15){ o.awake=true; o.sleepT=0; } }); }

function updateProps(dt, t){
  const sp = Math.hypot(C.vel.x, C.vel.z);
  for(const p of props){
    // car impact
    const dx=p.pos.x-C.pos.x, dz=p.pos.z-C.pos.z, d=Math.hypot(dx,dz), m=p.r+.95;
    if (driving && d<m && Math.abs(p.pos.y-(C.y+.5))<1.3){
      const nx=dx/(d||1), nz=dz/(d||1); p.pos.x=C.pos.x+nx*m; p.pos.z=C.pos.z+nz*m;
      const vn = C.vel.x*nx + C.vel.z*nz;
      if (vn>.4 || sp>1.2){ const k=Math.max(vn,0)+.6;
        if (p.group==="ball") p.vel.set(C.vel.x*1.25+nx*k*1.6, 1.2+k*.35, C.vel.z*1.25+nz*k*1.6); else
        p.vel.set(C.vel.x*.85+nx*k*1.3, 1.4+k*.6, C.vel.z*.85+nz*k*1.3);
        p.ang.set(rnd(-1,1),rnd(-.4,.4),rnd(-1,1)).normalize().multiplyScalar(3+k*1.6); wake(p);
        C.vel.multiplyScalar(p.group==="box"?.9:.96);
        if (k>1.8) thud(k*.6);
        if (p.group==="box" && k>1.2) giftKnock();
        if (p.group==="pot" && k>2) burst(p.pos.clone().add(new THREE.Vector3(0,.4,0)), 8, "#ffb8cc", true, .7);
      }
    }
    if (!p.awake) continue;
    p.vel.y -= 22*dt; p.pos.addScaledVector(p.vel, dt);
    const w=p.ang.length(); if(w>1e-3){ qt.setFromAxisAngle(vt.copy(p.ang).divideScalar(w), w*dt); p.mesh.quaternion.premultiply(qt); }
    const g = groundH(p.pos.x,p.pos.z) + p.r;
    if (p.group==="ball"){ if (p.pos.y < g){ p.pos.y=g; if(p.vel.y<0) p.vel.y*=-.45; if(Math.abs(p.vel.y)<.6) p.vel.y=0; const f=Math.exp(-dt*.9); p.vel.x*=f; p.vel.z*=f; }
      const sp2=Math.hypot(p.vel.x,p.vel.z); p.ang.set(p.vel.z,0,-p.vel.x).multiplyScalar(1/p.r); if (sp2<.05) p.ang.set(0,0,0); }
    else if (p.pos.y < g){ p.pos.y=g; if(p.vel.y<0) p.vel.y*=-.3; p.vel.x*=.86; p.vel.z*=.86; p.ang.multiplyScalar(.82); if(Math.abs(p.vel.y)<.5) p.vel.y=0; }
    for(const c of colliders){ const ex=p.pos.x-c.x, ez=p.pos.z-c.z, ed=Math.hypot(ex,ez), em=c.r+p.r; if(ed<em && ed>1e-4){ const nx=ex/ed, nz=ez/ed; p.pos.x=c.x+nx*em; p.pos.z=c.z+nz*em;
      const vn=p.vel.x*nx+p.vel.z*nz; if(vn<0){ p.vel.x-=1.6*vn*nx; p.vel.z-=1.6*vn*nz; } } }
    if (p.pos.y < -1.2){ p.lost += dt; if (p.lost>2.5) respawn(p); }
    if (p.vel.lengthSq()<.03 && p.ang.lengthSq()<.08 && p.pos.y-g<.02) p.sleepT+=dt; else p.sleepT=0;
    if (p.sleepT>1) { p.awake=false; p.vel.set(0,0,0); p.ang.set(0,0,0); }
  }
  // prop vs prop
  for(let i=0;i<props.length;i++){ const a=props[i];
    for(let j=i+1;j<props.length;j++){ const b=props[j]; if(!a.awake && !b.awake) continue;
      const dx=b.pos.x-a.pos.x, dy=b.pos.y-a.pos.y, dz=b.pos.z-a.pos.z, m=a.r+b.r; const d2=dx*dx+dy*dy+dz*dz; if (d2>=m*m || d2<1e-6) continue;
      const d=Math.sqrt(d2), nx=dx/d, ny=dy/d, nz=dz/d, push=(m-d)/2;
      a.pos.x-=nx*push; a.pos.y-=ny*push; a.pos.z-=nz*push; b.pos.x+=nx*push; b.pos.y+=ny*push; b.pos.z+=nz*push;
      const rv=(b.vel.x-a.vel.x)*nx+(b.vel.y-a.vel.y)*ny+(b.vel.z-a.vel.z)*nz;
      if (rv<0){ const j2=-rv*.9; a.vel.x-=nx*j2; a.vel.y-=ny*j2; a.vel.z-=nz*j2; b.vel.x+=nx*j2; b.vel.y+=ny*j2; b.vel.z+=nz*j2;
        if(!b.awake){ b.awake=true; b.ang.set(rnd(-1,1),0,rnd(-1,1)).multiplyScalar(2+j2); } if(!a.awake){ a.awake=true; a.ang.set(rnd(-1,1),0,rnd(-1,1)).multiplyScalar(2+j2); }
      } } }
}
function respawn(p){ p.pos.copy(p.home); p.mesh.quaternion.copy(p.homeQ); p.vel.set(0,0,0); p.ang.set(0,0,0); p.awake=false; p.lost=0; p.sleepT=0; }

/* ---------- wind lines ---------- */
const WIND = new THREE.Vector3(-.6,0,.8).normalize();
const windLines = [];
for(let i=0;i<10;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.03), new THREE.MeshBasicMaterial({ color:"#f2eeff", transparent:true, opacity:0, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending }));
  m.rotation.y = Math.atan2(-WIND.z, WIND.x); m.userData.life = Math.random()*3; scene.add(m); windLines.push(m); }
function updateWind(dt, t){
  windU.value = .55 + .45*Math.sin(t*.37) + .25*Math.sin(t*1.3+1);
  carU.value.set(C.pos.x, C.y, C.pos.z);
  windLines.forEach(m=>{ const u=m.userData; u.life -= dt*.6;
    if (u.life<=0){ u.life=1; const a=rnd(0,6.28), r=rnd(2,13); m.position.set(her.position.x+Math.sin(a)*r, her.position.y+rnd(.8,3.2), her.position.z+Math.cos(a)*r); }
    m.position.addScaledVector(WIND, dt*(5+windU.value*4)); m.material.opacity = Math.sin(u.life*Math.PI)*.28*windU.value; m.position.y += Math.sin(t*3+u.life*6)*dt*.3; });
}

/* ---------- car physics ---------- */
function updateCar(dt, t){
  let throttle=0, steerIn=0, hand=false;
  if (playing && !frozen && driving){
    const kx = (keys["d"]||keys["arrowright"]?1:0) - (keys["a"]||keys["arrowleft"]?1:0);
    const kz = (keys["w"]||keys["arrowup"]?1:0) - (keys["s"]||keys["arrowdown"]?1:0);
    hand = !!keys[" "];
    if (kx||kz){ throttle=kz; steerIn=-kx; walkTarget=null; }
    else {
      let dx=0, dz=0, mag=0; const jm=Math.hypot(joyVec.x, joyVec.y);
      if (jm>.15){ walkTarget=null; const fx=-Math.sin(camYaw), fz=-Math.cos(camYaw), rx=-fz, rz=fx;
        dx = fx*(-joyVec.y) + rx*joyVec.x; dz = fz*(-joyVec.y) + rz*joyVec.x; mag=Math.min(1,jm); }
      else if (walkTarget){ dx=walkTarget.x-C.pos.x; dz=walkTarget.z-C.pos.z; const d=Math.hypot(dx,dz); if (d<1.8){ walkTarget=null; dx=dz=0; } else mag=Math.min(1,d/5)*.75+.25; }
      if (mag>0){ const want=Math.atan2(dx,dz); let diff=want-C.heading; while(diff>Math.PI)diff-=6.283; while(diff<-Math.PI)diff+=6.283;
        steerIn=Math.max(-1,Math.min(1,diff*2.2)); throttle = mag * (Math.abs(diff)>2.2 ? .55 : 1); }
    }
  }
  C.throttle = throttle;
  fwdV.set(Math.sin(C.heading),0,Math.cos(C.heading)); sideV.set(Math.cos(C.heading),0,-Math.sin(C.heading));
  let vF = C.vel.dot(fwdV), vS = C.vel.dot(sideV);
  C.steer += (steerIn*.62 - C.steer)*Math.min(1,dt*7);
  const prevVF = vF;
  // turbo (Shift / ⚡ button), a little extra speed on roads, and hills that pull the car
  C.boost = playing && !frozen && driving && throttle>0 && (keys["shift"] || boostHeld);
  const topF = C.boost ? 21 : onRoad(C.pos.x, C.pos.z) ? 16.5 : 14.5;
  const slopeF = Math.max(-.6, Math.min(.6, (carGround(C.pos.x+fwdV.x*.9, C.pos.z+fwdV.z*.9) - carGround(C.pos.x-fwdV.x*.9, C.pos.z-fwdV.z*.9))/1.8));
  if (C.onGround){
    if (throttle>0) vF += throttle*(vF<-.2?24:C.boost?20:11.5)*dt;
    else if (throttle<0) vF += throttle*(vF>.2?20:7)*dt;
    else vF *= Math.exp(-dt*1.1);
    vF -= 7*slopeF*dt;
    if (vF > topF) vF += (topF - vF)*Math.min(1, dt*1.6);
    vF = Math.max(-5.5, Math.min(24, vF));
    vS *= Math.exp(-dt*(hand?1.4:9));
    if (hand) vF *= Math.exp(-dt*.5);
    C.heading += C.steer * vF * .3 * dt * (hand?1.45:1);
  } else C.heading += C.steer*vF*.06*dt;
  fwdV.set(Math.sin(C.heading),0,Math.cos(C.heading)); sideV.set(Math.cos(C.heading),0,-Math.sin(C.heading));
  C.vel.copy(fwdV).multiplyScalar(vF).addScaledVector(sideV, vS); C.vF=vF; C.vS=vS;
  C.pos.x += C.vel.x*dt; C.pos.z += C.vel.z*dt;

  // collisions
  for(const c of allColliders()){ const dx=C.pos.x-c.x, dz=C.pos.z-c.z, d=Math.hypot(dx,dz), m=c.r+.95;
    if (d<m && d>1e-4){ const nx=dx/d, nz=dz/d; C.pos.x=c.x+nx*m; C.pos.z=c.z+nz*m; const vn=C.vel.x*nx+C.vel.z*nz;
      if (vn<0){ C.vel.x-=1.45*vn*nx; C.vel.z-=1.45*vn*nz; if (-vn>2.2) bumpCar(-vn, c); } } }
  const r=Math.hypot(C.pos.x,C.pos.z), maxR=coastR(Math.atan2(C.pos.x,C.pos.z))*.965;
  const pu=C.pos.x*PIER.dx+C.pos.z*PIER.dz, pw=C.pos.x*PIER.dz-C.pos.z*PIER.dx;
  if (r>maxR && pu>0 && Math.abs(pw)<PIER.half){ // out on the pier: railings on the sides, a bench at the end
    if (Math.abs(pw)>PIER.lane) railPush(Math.sign(pw)*PIER.lane - pw, PIER.dz, -PIER.dx);
    if (pu>PIER.u1-1.4) railPush(PIER.u1-1.4-pu, PIER.dx, PIER.dz);
  }
  else if (r>maxR){ const nx=C.pos.x/r, nz=C.pos.z/r; C.pos.x=nx*maxR; C.pos.z=nz*maxR; const vn=C.vel.x*nx+C.vel.z*nz; if(vn>0){ C.vel.x-=1.5*vn*nx; C.vel.z-=1.5*vn*nz; if(vn>2.5){ bumpCar(vn); splash(); } } }
  // Moon Lagoon: water all around, except the bridge (which has railings)
  { const lx=C.pos.x-LAGOON.x, lz=C.pos.z-LAGOON.z, d=Math.hypot(lx,lz), lim=LAGOON.r+2;
    if (d<lim){ const w=lx*BRIDGE.dz-lz*BRIDGE.dx;
      if (Math.abs(w)<BRIDGE.lane || C.bridge){ C.bridge=true; if (Math.abs(w)>BRIDGE.lane) railPush(Math.sign(w)*BRIDGE.lane - w, BRIDGE.dz, -BRIDGE.dx); }
      else { const nx=lx/d, nz=lz/d; C.pos.x=LAGOON.x+nx*lim; C.pos.z=LAGOON.z+nz*lim; const vn=C.vel.x*nx+C.vel.z*nz; if(vn<0){ C.vel.x-=1.5*vn*nx; C.vel.z-=1.5*vn*nz; if(-vn>2.5){ bumpCar(-vn); splash(); } } }
    } else C.bridge=false; }

  // ground & suspension
  const sample=(f,s)=>carGround(C.pos.x+fwdV.x*f+sideV.x*s, C.pos.z+fwdV.z*f+sideV.z*s);
  const hFL=sample(.82,.74), hFR=sample(.82,-.74), hRL=sample(-.82,.74), hRR=sample(-.82,-.74);
  const g=(hFL+hFR+hRL+hRR)/4;
  C.vy -= 21*dt; C.y += C.vy*dt;
  const wasAir = !C.onGround;
  if (C.y <= g){
    if (wasAir && C.vy < -4.5){ C.squashV -= Math.min(6, -C.vy*.45); thud(-C.vy*.35); C.shake = Math.min(.5, -C.vy*.04);
      burst(new THREE.Vector3(C.pos.x, g+.2, C.pos.z), 14, "#ffb8cc", true, 1.2);
      if (C.airT>.55){ toast(["Wheee! 💗","That’s how my heart jumps when you text me 💓","Flying… just like when you said yes 🕊️"][Math.floor(Math.random()*3)], 3200); } }
    C.y = g; C.vy = Math.max(0, Math.min(10, (g-C.prevG)/Math.max(dt,1e-3)*.95)); C.onGround = true; C.airT = 0;
  } else if (C.y - g < .12 && C.vy <= 0){ C.y = g; C.vy = 0; C.onGround = true; C.airT = 0; }
  else { C.onGround = false; C.airT += dt; }
  C.prevG = g;
  const pitch = Math.atan2(((hFL+hFR)-(hRL+hRR))/2, 1.64), roll = Math.atan2(((hFL+hRL)-(hFR+hRR))/2, 1.48);
  car.position.set(C.pos.x, C.y, C.pos.z);
  car.rotation.y = C.heading;
  car.rotation.x += (-pitch - car.rotation.x)*Math.min(1,dt*(C.onGround?12:2));
  car.rotation.z += (roll - car.rotation.z)*Math.min(1,dt*(C.onGround?12:2));
  // body motion
  const accel = (vF - prevVF)/Math.max(dt,1e-3);
  C.squashV += (-C.squash*140 - C.squashV*10)*dt; C.squash += C.squashV*dt;
  carBody.scale.set(1-C.squash*.4, 1+C.squash, 1-C.squash*.4); carBody.position.y = C.squash*.4;
  carBody.rotation.z += ((-C.steer*vF*.018) - carBody.rotation.z)*Math.min(1,dt*8);
  carBody.rotation.x += ((-accel*.006) - carBody.rotation.x)*Math.min(1,dt*6);
  const bal = carBody.userData.balloon; bal.position.x = .6 + Math.sin(t*2.1)*.06 - vS*.02; bal.position.z = -1.05 - vF*.025; bal.rotation.y = t*1.3;
  C.spin += vF*dt/.3;
  wheels.forEach(w=>{ w.spin.rotation.x = C.spin; if (w.front) w.pivot.rotation.y = C.steer; });

  // tracks, petals, dust
  if (C.onGround){
    C.distAcc += Math.hypot(vF,vS)*dt;
    if (C.distAcc > .32){ C.distAcc = 0;
      [-.74,.74].forEach(s=> addTrack(C.pos.x - fwdV.x*.82 + sideV.x*s, C.pos.z - fwdV.z*.82 + sideV.z*s, C.heading)); }
    C.petalT -= dt;
    if (Math.abs(vF) > 3 && C.petalT < 0){ C.petalT = .07; petalAt(C.pos.x - fwdV.x*1.35 + rnd(-.4,.4), C.y+.35, C.pos.z - fwdV.z*1.35 + rnd(-.4,.4)); }
    if (Math.abs(vS) > 2.2 && Math.random()<.5) dustAt(C.pos.x - fwdV.x*.82 + sideV.x*rnd(-.8,.8), C.y+.15, C.pos.z - fwdV.z*.82 + sideV.z*rnd(-.8,.8));
  }
  if (C.boost && Math.random()<.7){ const s=sprite(Math.random()<.5?"#ffd36b":"#ff9ec0", rnd(.3,.55), 1, Math.random()<.3?HEART:GLOW);
    s.position.set(C.pos.x - fwdV.x*1.4 + rnd(-.3,.3), C.y+.5, C.pos.z - fwdV.z*1.4 + rnd(-.3,.3));
    s.userData={ v:new THREE.Vector3(-fwdV.x*2+rnd(-.4,.4), rnd(.2,.8), -fwdV.z*2+rnd(-.4,.4)), life:.8, decay:1.6 }; scene.add(s); bursts.push(s); }
  C.shake *= Math.exp(-dt*6);
  updateEngine();
}
// slide the car by d along the unit direction (ex,ez) and bounce it off that railing
function railPush(d, ex, ez){
  C.pos.x += ex*d; C.pos.z += ez*d; const vn=C.vel.x*ex+C.vel.z*ez;
  if (vn*d < 0){ C.vel.x -= 1.4*vn*ex; C.vel.z -= 1.4*vn*ez; if (Math.abs(vn)>3) bumpCar(Math.abs(vn)*.6); }
}
function bumpCar(k, c){
  thud(k*.5); C.shake = Math.min(.6, k*.06); C.squashV -= Math.min(3, k*.25);
  burst(new THREE.Vector3(C.pos.x+fwdV.x*1.1, C.y+.7, C.pos.z+fwdV.z*1.1), Math.min(16, 4+Math.round(k*1.5)), "#ffe39a", false, .9);
  if (c && c.ref){ c.ref.userData.shake = Math.min(.12, k*.018); burst(c.ref.position.clone().add(new THREE.Vector3(0,3,0)), 12, "#ffb8cc", true, 1.2); }
}
function petalAt(x,y,z){ const s=sprite("#ffb8cc", rnd(.2,.32), 1, HEART); s.material.blending=THREE.NormalBlending; s.position.set(x,y,z);
  s.userData={ v:new THREE.Vector3(rnd(-.5,.5), rnd(.4,1.1), rnd(-.5,.5)), life:1, decay:.5 }; scene.add(s); bursts.push(s); }
function dustAt(x,y,z){ const s=sprite("#f2eeff", rnd(.4,.7), .5, GLOW); s.position.set(x,y,z);
  s.userData={ v:new THREE.Vector3(rnd(-.4,.4), rnd(.3,.8), rnd(-.4,.4)), life:.7, decay:1.2 }; scene.add(s); bursts.push(s); }
function splash(){ burst(new THREE.Vector3(C.pos.x, .2, C.pos.z), 18, "#9fd8ff", false, 1.4); }

const seatL = new THREE.Vector3(-.33,.31,-.2), seatR = new THREE.Vector3(.33,.31,-.2);
function seat(p, local){
  car.updateMatrixWorld(); p.position.copy(local).applyMatrix4(car.matrixWorld); p.quaternion.copy(car.quaternion);
  const u=p.userData; u.legs.forEach(l=>{ l.rotation.x=-1.45; }); u.arms.forEach((a,k)=>{ a.rotation.x=-1.05; a.rotation.z=(k?-1:1)*.12; }); u.body.position.y=0;
}
function honk(){
  [0,.2].forEach(w=>{ note(660,w,.16,.08,"square"); note(830,w,.16,.06,"square"); });
  burst(car.position.clone().add(new THREE.Vector3(0,1.8,0)), 14, "#ff9ec0", true, .7);
  if (Math.random()<.4) setTimeout(()=>say(["Beep beep! 💕","Someone’s excited!","That horn sounds like it’s in love 🥰"][Math.floor(Math.random()*3)], 2500), 300);
}
