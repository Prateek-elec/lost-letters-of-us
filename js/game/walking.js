// Keeping her and Prateek on the island (collide) and getting in / out of the car to walk together.

function collide(p){
  for(const c of colliders){ const dx=p.x-c.x, dz=p.z-c.z, d=Math.hypot(dx,dz), m=c.r+.3; if(d<m && d>0.0001){ p.x=c.x+dx/d*m; p.z=c.z+dz/d*m; } }
  const r=Math.hypot(p.x,p.z), maxR=coastR(Math.atan2(p.x,p.z))*.97;
  const pu=p.x*PIER.dx+p.z*PIER.dz, pw=p.x*PIER.dz-p.z*PIER.dx;
  if (r>maxR && pu>0 && Math.abs(pw)<PIER.half){ // walking out on the pier: stay between the railings
    const w2=Math.max(-1.6,Math.min(1.6,pw)), u2=Math.min(pu, PIER.u1-.7); p.x=PIER.dx*u2+PIER.dz*w2; p.z=PIER.dz*u2-PIER.dx*w2; }
  else if(r>maxR){ p.x*=maxR/r; p.z*=maxR/r; }
  const lx=p.x-LAGOON.x, lz=p.z-LAGOON.z, d=Math.hypot(lx,lz), lim=LAGOON.r+1;
  if (d<lim && d>1e-4){ const w=lx*BRIDGE.dz-lz*BRIDGE.dx;
    if (Math.abs(w) < BRIDGE.w){ const dw=Math.max(-1.55,Math.min(1.55,w))-w; p.x+=BRIDGE.dz*dw; p.z-=BRIDGE.dx*dw; }   // on the bridge, inside the railings
    else { p.x=LAGOON.x+lx/d*lim; p.z=LAGOON.z+lz/d*lim; } }
}

// 🚶 get out of the car and walk the island together (F, or the 🚶 button); 🚗 to get back in
function updateWalkBtn(){ const b=$("#walkBtn"); if (!b) return; b.textContent = driving ? "🚶" : "🚗";
  b.title = driving ? "Get out and walk together (F)" : "Back in the car (F)"; b.setAttribute("aria-label", b.title); }
function toggleWalk(){
  if (!playing || frozen || finaleOn || swingT>0 || scopeOpen) return;
  const sx=Math.cos(C.heading), sz=-Math.sin(C.heading);   // the car's right-hand side
  if (driving){
    driving=false; C.vel.set(0,0,0); walkTarget=null;
    her.quaternion.identity(); her.rotation.set(0, C.heading, 0); her.position.set(C.pos.x - sx*1.6, 0, C.pos.z - sz*1.6); collide(her.position); her.position.y=walkH(her.position.x,her.position.z);
    if (him.visible && himInCar){ himInCar=false; him.quaternion.identity(); him.rotation.set(0, C.heading, 0); him.position.set(C.pos.x + sx*1.6, 0, C.pos.z + sz*1.6); collide(him.position); }
    burst(her.position.clone().add(new THREE.Vector3(0,1.2,0)), 10, "#ff9ec0", true, .6); chime(659);
    toast(isTouch ? "🚶 Walking together 💗 Tap 🚗 to get back in the car" : "🚶 Walking together 💗 Hold Shift to run · F to get back in the car", 4000);
  } else {
    if (Math.hypot(her.position.x-C.pos.x, her.position.z-C.pos.z) > 4.5){ // too far: Lumi brings the car over
      const fx=Math.sin(her.rotation.y), fz=Math.cos(her.rotation.y); C.pos.set(her.position.x+fx*2.2, 0, her.position.z+fz*2.2); collide(C.pos);
      C.heading=her.rotation.y; C.vel.set(0,0,0); C.y=carGround(C.pos.x,C.pos.z); C.prevG=C.y; C.vy=0;
      burst(new THREE.Vector3(C.pos.x, C.y+1, C.pos.z), 24, "#ffe39a", false, 1.2); say("✨ I brought the car to you!", 2500); }
    driving=true; himInCar=him.visible; camYaw=C.heading+Math.PI; chime(523);
  }
  updateWalkBtn();
}
$("#walkBtn").onclick = () => toggleWalk();
