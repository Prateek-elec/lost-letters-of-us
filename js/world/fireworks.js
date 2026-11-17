// Firework particles, small celebrations and the grand show.

/* ---------- fireworks button ---------- */
const FW = ZONES.fireworks;
const fwG = new THREE.Group(); fwG.position.set(FW.x, groundH(FW.x,FW.z), FW.z); scene.add(fwG);
const fwPad = new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.4,.15,24), M("#fff3e6")); fwPad.position.y=.07; fwG.add(fwPad);
const fwBtn = new THREE.Mesh(new THREE.CylinderGeometry(.85,.95,.35,24), E("#ff3355",.5)); fwBtn.position.y=.32; fwG.add(fwBtn);
shadowy(fwG); fwBtn.userData.onClick=()=>grandShow(); clickables.push(fwBtn);
let fwCool = 0;

/* ---------- firework particles ----------
   Every spark lives in ONE THREE.Points object (one draw call), so even the grand show stays smooth
   on a phone. Kinds: 0 spark, 1 rocket (explodes into its payload), 2 letter spark ("I LOVE U"), 4 glitter. */
const FWN = isTouch ? 2600 : 5200;
const FP = {}; ["x","y","z","vx","vy","vz","life","decay","r","g","b","size","grav","drag","tx","ty","tz","sx","sy","sz","t0","hold"].forEach(k=>FP[k]=new Float32Array(FWN));
FP.kind = new Uint8Array(FWN); FP.pay = new Array(FWN).fill(null); let fwN = 0;
const fwPos = new Float32Array(FWN*3), fwCol = new Float32Array(FWN*3), fwSz = new Float32Array(FWN);
const fwGeo = new THREE.BufferGeometry();
fwGeo.setAttribute("position", new THREE.BufferAttribute(fwPos,3).setUsage(THREE.DynamicDrawUsage));
fwGeo.setAttribute("color", new THREE.BufferAttribute(fwCol,3).setUsage(THREE.DynamicDrawUsage));
fwGeo.setAttribute("size", new THREE.BufferAttribute(fwSz,1).setUsage(THREE.DynamicDrawUsage));
const fwMat = new THREE.ShaderMaterial({ uniforms:{ pr:{ value:1 } }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:`attribute float size; attribute vec3 color; varying vec3 vC; uniform float pr;
    void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=size*pr*(320./max(1.,-mv.z)); gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`varying vec3 vC; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r); gl_FragColor=vec4(vC*a*a*1.7,1.); }` });
const fwPoints = new THREE.Points(fwGeo, fwMat); fwPoints.frustumCulled = false; scene.add(fwPoints);
const FWC = ["#ff5f8f","#ffd36b","#9fd8ff","#c9a8ff","#ff9ec0","#7ef0ff","#ffffff","#ff8a5c","#b8ff9f"].map(c=>new THREE.Color(c));
const fwPick = () => FWC[Math.floor(Math.random()*FWC.length)];
const GOLD = new THREE.Color("#ffcf6b"), ROCKET = new THREE.Color("#ffe9b0"), LOVE = new THREE.Color("#ff4f7f");
function spark(x,y,z, vx,vy,vz, col, o={}){
  if (fwN>=FWN) return -1; const i=fwN++;
  FP.x[i]=x; FP.y[i]=y; FP.z[i]=z; FP.vx[i]=vx; FP.vy[i]=vy; FP.vz[i]=vz; FP.life[i]=1; FP.decay[i]=o.decay||rnd(.5,.75);
  FP.r[i]=col.r; FP.g[i]=col.g; FP.b[i]=col.b; FP.size[i]=o.size||1.2; FP.grav[i]=o.grav!==undefined?o.grav:3.5; FP.drag[i]=o.drag!==undefined?o.drag:1.3;
  FP.kind[i]=o.kind||0; FP.pay[i]=o.pay||null; return i;
}
function killSpark(i){ const j=--fwN; if (i===j){ FP.pay[j]=null; return; }
  for(const k in FP){ if (k!=="pay") FP[k][i]=FP[k][j]; } FP.pay[i]=FP.pay[j]; FP.pay[j]=null; }
function crackle(){ if(!actx) return; try{ const len=Math.floor(1.3*actx.sampleRate), b=actx.createBuffer(1,len,actx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=Math.random()<.004 ? (Math.random()*2-1)*(1-i/len) : 0;
  const s=actx.createBufferSource(); s.buffer=b; const f=actx.createBiquadFilter(); f.type="highpass"; f.frequency.value=1500;
  const g=actx.createGain(); g.gain.value=.3; s.connect(f); f.connect(g); g.connect(actx.destination); s.start(); }catch(e){} }
const fwRight = new THREE.Vector3(1,0,0);
// a rocket that climbs to `target` and bursts into `type`
function launchShell(type, target, col, col2){
  const sx=target.x+rnd(-2,2), sz=target.z+rnd(-2,2), sy=Math.max(groundH(sx,sz),0)+.5, T=rnd(1.1,1.45);
  const i=spark(sx,sy,sz, (target.x-sx)/T, (target.y-sy)/T, (target.z-sz)/T, ROCKET, { kind:1, decay:1/T, size:1.5, grav:0, drag:0, pay:{ type, col:col||fwPick(), col2:col2||fwPick() } });
  whoosh(); return i;
}
function shell(p, x,y,z){
  const n = isTouch ? 60 : 100, col=p.col, c2=p.col2, ty=p.type;
  spark(x,y,z,0,0,0, ROCKET, { size:7, decay:3.2, grav:0, drag:0 });              // the flash
  if (ty==="text"){ fireTextPart(p, x,y,z); thud(3); crackle(); return; }
  if (ty==="peony" || ty==="double" || ty==="glitter"){
    for(let k=0;k<n;k++){ const inner = ty==="double" && k%2; const u=rnd(-1,1), a=rnd(0,6.283), s=Math.sqrt(1-u*u), sp=(inner?5.5:10.5)*rnd(.85,1);
      spark(x,y,z, s*Math.cos(a)*sp, u*sp, s*Math.sin(a)*sp, inner?c2:(ty==="glitter"?GOLD:col), { kind:ty==="glitter"?4:0, size:ty==="glitter"?1.3:1.7, decay:rnd(.45,.65) }); } }
  else if (ty==="ring"){ const nrm=new THREE.Vector3(rnd(-.4,.4),1,rnd(-.4,.4)).normalize(), u=new THREE.Vector3().crossVectors(nrm,UP).normalize();
      if (u.lengthSq()<.1) u.set(1,0,0); const v=new THREE.Vector3().crossVectors(nrm,u);
    for(let k=0;k<n*.8;k++){ const a=k/(n*.8)*6.283; spark(x,y,z, (u.x*Math.cos(a)+v.x*Math.sin(a))*11, (u.y*Math.cos(a)+v.y*Math.sin(a))*11, (u.z*Math.cos(a)+v.z*Math.sin(a))*11, k%2?col:c2, { size:1.7 }); } }
  else if (ty==="heart"){
    for(let k=0;k<n;k++){ const a=k/n*6.283, hx=16*Math.pow(Math.sin(a),3), hy=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);
      spark(x,y,z, fwRight.x*hx*.62, hy*.62, fwRight.z*hx*.62, k%7?col:GOLD, { size:1.8, grav:.7, drag:1.6, decay:rnd(.4,.5) }); } }
  else if (ty==="willow"){
    for(let k=0;k<n;k++){ const u=rnd(-.4,1), a=rnd(0,6.283), s=Math.sqrt(1-u*u), sp=rnd(6,8);
      spark(x,y,z, s*Math.cos(a)*sp, u*sp, s*Math.sin(a)*sp, GOLD, { size:1.35, grav:2.6, drag:1.7, decay:rnd(.26,.34) }); } crackle(); }
  else if (ty==="palm"){
    for(let arm=0;arm<9;arm++){ const u=rnd(-.1,1), a=arm/9*6.283+rnd(-.2,.2), s=Math.sqrt(1-u*u);
      for(let k=0;k<11;k++){ const sp=3+k*.85; spark(x,y,z, s*Math.cos(a)*sp, u*sp, s*Math.sin(a)*sp, k%3?col:GOLD, { size:1.9-k*.05, grav:4.5, decay:rnd(.5,.6) }); } } }
  thud(2.2+Math.random()); if (ty==="glitter") crackle();
}
// small celebrations (goal, lap, all hearts, the pier, the finale): a few shells around her
function launchFireworks(n=6){
  fwRight.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  for(let k=0;k<n;k++) setTimeout(()=>{ const b=her.position; launchShell(["peony","heart","ring","double","glitter","willow"][k%6], new THREE.Vector3(b.x+rnd(-12,12), b.y+rnd(14,20), b.z+rnd(-12,12))); }, k*300);
}

/* ---------- the grand show (click the big red button): ~25 s of fireworks, then "I LOVE U" in the sky ---------- */
let fwShow = { on:false };
function grandShow(){
  if (fwShow.on || finaleOn || scopeOpen) return;
  initAudio(); if (actx) actx.resume(); achieve("fireworks");
  fwBtn.position.y = .2; setTimeout(()=>fwBtn.position.y=.32, 300);
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir); dir.y=0; if (dir.lengthSq()<.01) dir.set(0,0,-1); dir.normalize();
  fwRight.set(-dir.z,0,dir.x);
  const base=(driving ? car.position : her.position).clone(), D=46, Cc=base.clone().addScaledVector(dir,D); Cc.y=base.y+21;
  const vfov=(innerWidth<innerHeight?65:55)*Math.PI/180, hfov=2*Math.atan(Math.tan(vfov/2)*innerWidth/innerHeight);
  const visW=2*(D+10)*Math.tan(hfov/2), visH=2*(D+10)*Math.tan(vfov/2), W=Math.min(40, visW*.8);
  const pos=(lx,ly,lz=0)=>Cc.clone().addScaledVector(fwRight,lx).add(new THREE.Vector3(0,ly,0)).addScaledVector(dir,lz);
  const Q=[]; let t=.4; const at=(gap,f)=>{ Q.push({ t, f }); t+=gap; };
  // act 1: one at a time
  ["peony","ring","heart","glitter","double","willow"].forEach(ty=>at(1, ()=>launchShell(ty, pos(rnd(-.35,.35)*W, rnd(-3,5), rnd(-5,5)))));
  // act 2: mirrored pairs
  ["ring","palm","heart","double","peony"].forEach(ty=>at(1.25, ()=>{ const lx=rnd(.2,.42)*W, ly=rnd(-2,5), a=fwPick(), b=fwPick(); launchShell(ty,pos(-lx,ly),a,b); launchShell(ty,pos(lx,ly),a,b); }));
  // act 3: a golden fan of willows, then glitter
  at(1.8, ()=>{ for(let k=0;k<5;k++) launchShell("willow", pos((k/4-.5)*W*.9, 3+Math.sin(k/4*Math.PI)*5)); });
  at(1.6, ()=>{ for(let k=0;k<3;k++) launchShell("glitter", pos((k-1)*W*.32, -1)); });
  // finale barrage
  for(let k=0;k<(isTouch?16:26);k++) at(.16, ()=>launchShell(["peony","double","ring","palm","glitter","heart"][k%6], pos(rnd(-.5,.5)*W, rnd(-4,8), rnd(-6,6))));
  t += 2.8;
  at(4.2, ()=>fireText(innerWidth<innerHeight ? Cc.clone().add(new THREE.Vector3(0,4,0)) : Cc, Math.min(38, visW*.84), visH*.42));
  at(0, ()=>{ launchShell("heart", pos(-W*.46,-7), LOVE, GOLD); launchShell("heart", pos(W*.46,-7), LOVE, GOLD); });
  fwShow = { on:true, t:0, Q, end:t+8, C:Cc, dir, base };
  frozen = true; C.vel.set(0,0,0); tagBox.classList.add("off"); $("#interact").classList.remove("show"); current = null;
  $("#fwSkip").classList.add("show"); toast(isTouch ? "🎆 A firework show, just for you…" : "🎆 A firework show, just for you… (press Space for extra sparkle)", 4000);
}
// Space during the show: an extra-big burst on command
let bigCool = 0;
function bigBurst(){
  if (!fwShow.on || fwNow < bigCool) return; bigCool = fwNow + 1.2;
  ["peony","double","glitter","ring","heart"].forEach((ty,k)=>launchShell(ty, fwShow.C.clone().addScaledVector(fwRight,(k-2)*7).add(new THREE.Vector3(0,rnd(-2,6),0))));
}
function endShow(){ if (!fwShow.on) return; fwShow.on=false; frozen=false; tagBox.classList.remove("off"); $("#fwSkip").classList.remove("show"); }
// "I LOVE U": the words are drawn on a hidden canvas, every lit pixel becomes a target for a spark
function textTargets(text, maxW, maxH, count){
  const words=text.split(/\s+/), lines = innerWidth<innerHeight*.8 && words.length>1 ? words : [text];
  const c=document.createElement("canvas"), x=c.getContext("2d"); c.width=1100; c.height=170*lines.length+40;
  x.fillStyle="#fff"; x.font="900 150px 'Arial Black', Arial, sans-serif"; x.textAlign="center"; x.textBaseline="middle";
  lines.forEach((l,k)=>x.fillText(l, c.width/2, 20+85+k*170));
  const d=x.getImageData(0,0,c.width,c.height).data, pts=[]; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(let py=0;py<c.height;py+=3) for(let px=0;px<c.width;px+=3) if (d[(py*c.width+px)*4+3]>128){ pts.push([px,py]); x0=Math.min(x0,px); x1=Math.max(x1,px); y0=Math.min(y0,py); y1=Math.max(y1,py); }
  const keep=pts.filter((_,i)=>i%Math.max(1,Math.round(pts.length/count))===0), s=Math.min(maxW/(x1-x0), maxH/(y1-y0));
  return keep.map(([px,py])=>[(px-(x0+x1)/2)*s, ((y0+y1)/2-py)*s]);
}
function fireText(Cc, maxW, maxH){
  const tg=textTargets(GAME.world.fireworksText || "I LOVE U", maxW, maxH, isTouch?900:1700).sort((a,b)=>a[0]-b[0]), parts=4;
  for(let k=0;k<parts;k++){ const grp=tg.slice(Math.floor(k/parts*tg.length), Math.floor((k+1)/parts*tg.length)); if (!grp.length) continue;
    const mx=grp.reduce((s,p)=>s+p[0],0)/grp.length, my=grp.reduce((s,p)=>s+p[1],0)/grp.length;
    const tp=Cc.clone().addScaledVector(fwRight,mx).add(new THREE.Vector3(0,my,0));
    const i=launchShell("text", tp, LOVE, GOLD); if (i>=0){ FP.pay[i].grp=grp; FP.pay[i].C=Cc; } }
}
function fireTextPart(p, x,y,z){
  p.grp.forEach(([lx,ly],k)=>{ const i=spark(x,y,z,0,0,0, k%9===0?GOLD:LOVE, { kind:2, size:1.45, grav:0, drag:0, decay:0 }); if (i<0) return;
    FP.sx[i]=x; FP.sy[i]=y; FP.sz[i]=z; FP.tx[i]=p.C.x+fwRight.x*lx; FP.ty[i]=p.C.y+ly; FP.tz[i]=p.C.z+fwRight.z*lx; FP.t0[i]=fwNow; FP.hold[i]=6.5+rnd(0,.6); });
  setTimeout(()=>{ chime(784); chime(988,.15); chime(1175,.3); chime(1568,.45); hearts(30); }, 900);
  if (!fwShow.hinted){ fwShow.hinted = true; setTimeout(()=>toast(isTouch ? "📸 Tap 📸 to keep this moment" : "📸 Press P (or 📸) to keep this moment", 4500), 2600); }
}
let fwNow = 0;
function updateFireworks(dt, t){
  fwNow = t; fwCool -= dt; fwMat.uniforms.pr.value = renderer.getPixelRatio();
  if (fwShow.on){ fwShow.t += dt; while (fwShow.Q.length && fwShow.Q[0].t <= fwShow.t) fwShow.Q.shift().f(); if (fwShow.t > fwShow.end) endShow(); }
  for(let i=0;i<fwN;i++){
    const kind=FP.kind[i];
    if (kind===2){ // letter sparks fly to their place, shimmer, then drift down
      const age=t-FP.t0[i], k=Math.min(1, age/1.3), e=1-Math.pow(1-k,3);
      if (age < FP.hold[i]){ FP.x[i]=FP.sx[i]+(FP.tx[i]-FP.sx[i])*e; FP.y[i]=FP.sy[i]+(FP.ty[i]-FP.sy[i])*e; FP.z[i]=FP.sz[i]+(FP.tz[i]-FP.sz[i])*e; }
      else { FP.kind[i]=0; FP.vx[i]=rnd(-.3,.3); FP.vy[i]=rnd(-.6,0); FP.vz[i]=rnd(-.3,.3); FP.grav[i]=1.2; FP.drag[i]=.6; FP.decay[i]=rnd(.3,.45); }
      const tw=.75+.25*Math.sin(t*9+i);
      fwPos[i*3]=FP.x[i]; fwPos[i*3+1]=FP.y[i]; fwPos[i*3+2]=FP.z[i]; fwCol[i*3]=FP.r[i]*tw; fwCol[i*3+1]=FP.g[i]*tw; fwCol[i*3+2]=FP.b[i]*tw; fwSz[i]=FP.size[i]*(k<1?1.4:1);
      if (age < FP.hold[i] && age>1.3 && Math.random()<.004) spark(FP.x[i],FP.y[i],FP.z[i], rnd(-1,1),rnd(-1,1),rnd(-1,1), ROCKET, { size:.8, decay:2.2, grav:1, drag:2 });
      continue;
    }
    FP.life[i] -= dt*FP.decay[i];
    if (FP.life[i] <= 0){ if (kind===1 && FP.pay[i]){ const p=FP.pay[i], x=FP.x[i], y=FP.y[i], z=FP.z[i]; killSpark(i); shell(p,x,y,z); } else killSpark(i); i--; continue; }
    const dr=Math.exp(-FP.drag[i]*dt); FP.vx[i]*=dr; FP.vy[i]=FP.vy[i]*dr - FP.grav[i]*dt; FP.vz[i]*=dr;
    FP.x[i]+=FP.vx[i]*dt; FP.y[i]+=FP.vy[i]*dt; FP.z[i]+=FP.vz[i]*dt;
    if (kind===1 && Math.random()<.8) spark(FP.x[i],FP.y[i],FP.z[i], rnd(-.4,.4), rnd(-1.5,-.5), rnd(-.4,.4), GOLD, { size:.7, decay:2.4, grav:1, drag:1 });
    let br = Math.pow(FP.life[i], .7); if (kind===4) br *= Math.random()<.45 ? .15 : 1.5;
    fwPos[i*3]=FP.x[i]; fwPos[i*3+1]=FP.y[i]; fwPos[i*3+2]=FP.z[i]; fwCol[i*3]=FP.r[i]*br; fwCol[i*3+1]=FP.g[i]*br; fwCol[i*3+2]=FP.b[i]*br; fwSz[i]=FP.size[i]*(.6+.4*FP.life[i]);
  }
  fwGeo.setDrawRange(0, fwN);
  fwGeo.attributes.position.needsUpdate = fwGeo.attributes.color.needsUpdate = fwGeo.attributes.size.needsUpdate = true;
}
function whoosh(){ if(!actx) return; try{ const len=Math.floor(.6*actx.sampleRate), b=actx.createBuffer(1,len,actx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.sin(i/len*Math.PI)*.6;
  const s=actx.createBufferSource(); s.buffer=b; const f=actx.createBiquadFilter(); f.type="bandpass"; f.frequency.setValueAtTime(400,actx.currentTime); f.frequency.linearRampToValueAtTime(2400,actx.currentTime+.6);
  const g=actx.createGain(); g.gain.value=.12; s.connect(f); f.connect(g); g.connect(actx.destination); s.start(); }catch(e){} }
