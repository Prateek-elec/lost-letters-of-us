// Stargazer Hill, Moon Lagoon, Fairy Village, Starlight Pier, Ferris wheel, Whispering Falls.

/* ============================ NEW WORLD: OUTER AREAS ============================ */
// Stargazer Hill, Moon Lagoon, Fairy Village, Starlight Pier + Ferris wheel, Firefly Forest,
// road lamps and signposts. Repeated shapes use InstancedMesh (one draw call for many copies)
// and no extra real lights are added, so phones stay smooth.
const _wo = new THREE.Object3D(), _wc = new THREE.Color();
function instanced(geo, mat, list, shadows=true){
  if (!list.length) return null;
  const im = new THREE.InstancedMesh(geo, mat, list.length); _wo.rotation.order = "YXZ";
  list.forEach((d,i)=>{ _wo.position.set(d.x,d.y,d.z); _wo.rotation.set(d.rx||0, d.ry||0, d.rz||0);
    const s=d.s||1; _wo.scale.set(d.sx||s, d.sy||s, d.sz||s); _wo.updateMatrix(); im.setMatrixAt(i,_wo.matrix);
    if (d.c) im.setColorAt(i, _wc.set(d.c)); });
  im.castShadow = shadows; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im;
}
// local (lx,lz) → world, for something standing at (bx,bz) turned by ry
const loc = (bx, bz, ry, lx, lz) => ({ x: bx + lx*Math.cos(ry) + lz*Math.sin(ry), z: bz - lx*Math.sin(ry) + lz*Math.cos(ry) });
function glowPoints(list, size, parent=scene){ // soft glowing dots: [{x,y,z,c}]
  const pos=new Float32Array(list.length*3), col=new Float32Array(list.length*3);
  list.forEach((p,i)=>{ pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z; _wc.set(p.c||"#ffd98a"); col[i*3]=_wc.r; col[i*3+1]=_wc.g; col[i*3+2]=_wc.b; });
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(g, new THREE.PointsMaterial({ size, map:GLOW, vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
  pts.frustumCulled=false; parent.add(pts); return pts;
}
function signBoard(text, w=2.4, h=.62, col="#c96a88"){
  const t=canvasTex(512, Math.round(512*h/w), (x,W,H)=>{ x.fillStyle=col; roundRect(x,0,0,W,H,H*.25); x.fill(); x.strokeStyle="#fff3e6"; x.lineWidth=7; roundRect(x,8,8,W-16,H-16,H*.2); x.stroke();
    let fs=Math.round(H*.5); x.font=`600 ${fs}px ${SERIF}`; while(x.measureText(text).width > W-44 && fs>12){ fs-=2; x.font=`600 ${fs}px ${SERIF}`; }
    x.fillStyle="#fff3e6"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(text, W/2, H*.54); });
  const face=new THREE.MeshBasicMaterial({map:t}), side=M(col);
  return new THREE.Mesh(new THREE.BoxGeometry(w,h,.08), [side,side,side,side,face,face]);
}
const starShape = (()=>{ const s=new THREE.Shape(); for(let k=0;k<10;k++){ const r=k%2?.32:.78, a=k/10*Math.PI*2, x=Math.sin(a)*r, y=Math.cos(a)*r; k?s.lineTo(x,y):s.moveTo(x,y); } s.closePath(); return s; })();
const waveH = (x,z,t) => reduce ? -.15 : -.15 + Math.sin(x*.18+t*1.1)*.12 + Math.cos(z*.22+t*.9)*.1 + Math.sin((x+z)*.4+t*1.7)*.04;
const lampPosts = [];
function addPost(x, z, y, solid=true){ lampPosts.push({ x, z, y: y===undefined ? groundH(x,z) : y, solid }); }

/* ---------- Stargazer Hill ---------- */
const LOOK = new THREE.Vector3(HILL.x+Math.cos(HILL.a)*4.8, 0, HILL.z-Math.sin(HILL.a)*4.8);
const hillG = region(new THREE.Group(), HILL.x, HILL.z, 14); scene.add(hillG);
let hillStar;
{
  const g=new THREE.Group(); g.position.set(LOOK.x, groundH(LOOK.x,LOOK.z), LOOK.z); g.rotation.y=HILL.a; hillG.add(g);
  const brass=M("#f4cd84",{roughness:.4,metalness:.4});
  for(let k=0;k<3;k++){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.35,5),M("#3b2f3f")); const a=k/3*Math.PI*2; l.position.set(Math.sin(a)*.28,.62,Math.cos(a)*.28); l.rotation.set(Math.cos(a)*.35,0,-Math.sin(a)*.35); g.add(l); }
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,1.2,10),M("#b25d74")); tube.position.set(0,1.45,.2); tube.rotation.x=1.05; g.add(tube);
  // an invisible, bigger box around the telescope so it's easy to click / tap
  const scopeHit=new THREE.Mesh(new THREE.BoxGeometry(1.4,2.4,1.6), new THREE.MeshBasicMaterial({ visible:false })); scopeHit.position.set(0,1.2,.1); g.add(scopeHit);
  scopeHit.userData.onClick=()=>openTelescope(); clickables.push(scopeHit);
  [-.35,.3].forEach(o=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,6,12),brass); r.position.set(0,1.45+o*-.5,.2+o*.87); r.rotation.x=1.05+Math.PI/2; g.add(r); });
  const bench=new THREE.Group(); bench.position.set(-1.7,0,-.3);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.8,.1,.5),M("#a77a6a")); seat.position.y=.5; bench.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(1.8,.45,.07),M("#a77a6a")); back.position.set(0,.82,-.23); bench.add(back);
  [-.75,.75].forEach(x=>{ const l=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.45),M("#3b2f3f")); l.position.set(x,.25,0); bench.add(l); }); g.add(bench);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,3.4,6),M("#3b2f3f")); pole.position.set(1.8,1.7,-.5); g.add(pole);
  hillStar=new THREE.Mesh(new THREE.ExtrudeGeometry(starShape,{depth:.12,bevelEnabled:false}), E("#ffd36b",1.6)); hillStar.position.set(1.8,3.9,-.5); g.add(hillStar);
  const halo=sprite("#ffd98a",3.4,.55); halo.position.set(1.8,3.9,-.5); g.add(halo);
  const sign=signBoard("⭐ Stargazer Hill",2.2,.55,"#6a5aa8"); sign.position.set(1.8,2.1,-.42); g.add(sign);
  shadowy(g); halo.castShadow=false; scopeHit.castShadow=scopeHit.receiveShadow=false;
  block(LOOK.x, LOOK.z, 1.2); const pp=loc(LOOK.x,LOOK.z,HILL.a,1.8,-.5); block(pp.x,pp.z,.3);
  [[-3,1.6],[-2.6,-2],[3.2,1.4]].forEach(([lx,lz],k)=>{ const p=loc(LOOK.x,LOOK.z,HILL.a,lx,lz); crystal(p.x,p.z,rnd(.8,1.1),k%2?"#ff9ed2":"#c9a8ff"); });
}

/* ---------- Moon Lagoon ---------- */
const lagoonG = region(new THREE.Group(), LAGOON.x, LAGOON.z, 13); scene.add(lagoonG);
const bridgeYaw = Math.atan2(BRIDGE.dx, BRIDGE.dz), BRIDGE_TOP = bridgeH(LAGOON.x, LAGOON.z);
let lilyPads, lilyData = [];
const floatLanterns = [];
{
  const planks=[], posts=[], rails=[], lights=[];
  for(let u=-BRIDGE.half, k=0; u<=BRIDGE.half+.01; u+=.5, k++){
    const x=LAGOON.x+BRIDGE.dx*u, z=LAGOON.z+BRIDGE.dz*u, t=(u+BRIDGE.half)/(2*BRIDGE.half);
    const y=BRIDGE.hA+(BRIDGE.hB-BRIDGE.hA)*t + 1.1*Math.sin(Math.PI*t);
    const pitch=-Math.atan((BRIDGE.hB-BRIDGE.hA)/(2*BRIDGE.half) + 1.1*Math.PI*Math.cos(Math.PI*t)/(2*BRIDGE.half));
    planks.push({ x, y:y-.07, z, ry:bridgeYaw, rx:pitch, c:k%2?"#c98f86":"#b77d78" });
    [-1,1].forEach(s=>{ const px=x+BRIDGE.dz*s*(BRIDGE.w-.12), pz=z-BRIDGE.dx*s*(BRIDGE.w-.12);
      rails.push({ x:px, y:y+.92, z:pz, ry:bridgeYaw, rx:pitch });
      if (k%3===0){ posts.push({ x:px, y:y+.45, z:pz }); lights.push({ x:px, y:y+1.05, z:pz, c:s>0?"#ffd98a":"#ffb3c6" }); } });
  }
  instanced(new THREE.BoxGeometry(BRIDGE.w*2,.14,.5), M("#ffffff"), planks);
  instanced(new THREE.CylinderGeometry(.07,.07,.9,6), M("#fff3e6"), posts);
  instanced(new THREE.BoxGeometry(.1,.08,.54), M("#fff3e6"), rails);
  glowPoints(lights, 1.2);
  // lily pads with glowing flowers
  const blooms=[];
  for(let k=0, tries=0; k<16 && tries<300; tries++){ const a=rnd(0,6.28), r=rnd(1,LAGOON.r-.4), x=LAGOON.x+Math.sin(a)*r, z=LAGOON.z+Math.cos(a)*r;
    if (Math.abs((x-LAGOON.x)*BRIDGE.dz-(z-LAGOON.z)*BRIDGE.dx) < BRIDGE.w+.8) continue;
    lilyData.push({ x, z, ry:rnd(0,6), s:rnd(.6,1.1) }); if (k%2===0) blooms.push({ x, y:.12, z, c:k%4?"#ff9ed2":"#fff0c4" }); k++; }
  lilyPads = instanced(new THREE.CylinderGeometry(.55,.55,.04,10,1,false,0,Math.PI*1.8), M("#3f8a7a",{emissive:"#123a33",emissiveIntensity:.5}), lilyData.map(d=>({ ...d, y:-.1 })), false);
  lilyPads.userData.blooms = glowPoints(blooms, 1);
  // little floating lanterns
  for(let k=0;k<7;k++){ const l=new THREE.Group(); const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.28,6), E(k%2?"#ffb36b":"#ff9ec0",1.6)); b.position.y=.14; l.add(b);
    const gl=sprite(k%2?"#ffb36b":"#ff9ec0",1.3,.6); gl.position.y=.2; l.add(gl); l.userData={ a:k/7*Math.PI*2, r:rnd(2.5,LAGOON.r-1), p:rnd(0,6) }; lagoonG.add(l); floatLanterns.push(l); }
  const sign=signBoard("🌙 Moon Lagoon",2.2,.55,"#5a6fb0"); const sp=loc(LAGOON.x,LAGOON.z,bridgeYaw,3.2,-BRIDGE.half-1.6);
  sign.position.set(sp.x, groundH(sp.x,sp.z)+1.7, sp.z); sign.rotation.y=bridgeYaw; lagoonG.add(sign);
  const sPole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.8,6),M("#3b2f3f")); sPole.position.set(sp.x, groundH(sp.x,sp.z)+.9, sp.z); lagoonG.add(sPole); block(sp.x,sp.z,.3);
  shadowy(sign);
}

/* ---------- Fairy Village ---------- */
const villageG = region(new THREE.Group(), VILLAGE.x, VILLAGE.z, 16); scene.add(villageG);
const VY = groundH(VILLAGE.x, VILLAGE.z);
let fountainHeart, CAFE_SPOT, cafeHouse;
{
  const cob=canvasTex(256,256,(x,w,h)=>{ x.fillStyle="#6b5a8e"; x.fillRect(0,0,w,h);
    for(let j=0;j<8;j++) for(let i=0;i<8;i++){ x.fillStyle=["#8a78b0","#9d86bd","#7d6aa6","#b294c4"][(i*3+j*5)%4]; roundRect(x,i*32+(j%2)*16+2,j*32+2,28,28,8); x.fill(); } });
  cob.wrapS=cob.wrapT=THREE.RepeatWrapping; cob.repeat.set(3,3);
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(6.6,40), new THREE.MeshStandardMaterial({ map:cob, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4 }));
  plaza.rotation.x=-Math.PI/2; plaza.position.set(VILLAGE.x, VY+.05, VILLAGE.z); plaza.receiveShadow=true; villageG.add(plaza);
  // heart fountain
  const f=new THREE.Group(); f.position.set(VILLAGE.x, VY, VILLAGE.z); villageG.add(f);
  const basin=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.85,.55,18),M("#efe6ff")); basin.position.y=.28; f.add(basin);
  const wat=new THREE.Mesh(new THREE.CircleGeometry(1.55,18),E("#7ef0ff",.8)); wat.rotation.x=-Math.PI/2; wat.position.y=.5; f.add(wat);
  const pil=new THREE.Mesh(new THREE.CylinderGeometry(.18,.26,1.5,8),M("#efe6ff")); pil.position.y=1.1; f.add(pil);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.75,.3,.28,12),M("#efe6ff")); bowl.position.y=1.85; f.add(bowl);
  fountainHeart=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.1,bevelEnabled:false}), E("#ffd36b",1.4)); fountainHeart.geometry.center(); fountainHeart.scale.setScalar(1.6); fountainHeart.position.y=2.6; f.add(fountainHeart);
  const fg=sprite("#7ef0ff",4,.35); fg.position.y=1.2; f.add(fg);
  shadowy(f); block(VILLAGE.x, VILLAGE.z, 2.1);
  // cottages around the plaza (the roads come in at the inner and outer side)
  const HC=["#f6c1d0","#c9b6ff","#ffe1b3","#bfe3e0","#f4b8a8","#e3c8ff","#ffd1dc","#cfe6ff"], RC=["#b25d74","#6a5aa8","#c96a88","#5a6fb0"];
  const bodies=[], roofs=[], doors=[], wins=[], chims=[];
  [-.75,.75,-1.35,1.35,-1.95,1.95,-2.55,2.55].forEach((th,k)=>{
    const a=VILLAGE.a+th, x=VILLAGE.x+Math.sin(a)*10.5, z=VILLAGE.z+Math.cos(a)*10.5, y=groundH(x,z), ry=Math.atan2(VILLAGE.x-x, VILLAGE.z-z);
    const L=(lx,lz)=>loc(x,z,ry,lx,lz);
    bodies.push({ x, y:y+1, z, ry, c:HC[k] });
    roofs.push({ x, y:y+3.35, z, ry:ry+Math.PI/4, c:RC[k%4] });
    const d=L(0,1.52); doors.push({ x:d.x, y:y+.65, z:d.z, ry });
    [-.95,.95].forEach(lx=>{ const w=L(lx,1.53); wins.push({ x:w.x, y:y+1.55, z:w.z, ry }); const s=L(lx>0?1.53:-1.53,0); wins.push({ x:s.x, y:y+1.55, z:s.z, ry:ry+Math.PI/2 }); });
    const c=L(.8,-.5); chims.push({ x:c.x, y:y+3.5, z:c.z, ry });
    block(x,z,2.2);
    if (k===0){ cafeHouse={ x, z, y, ry }; }
    if (k>1 && k%2===0){ const p=L(1.9,2.1); if (freeSpot(p.x,p.z,.6)) addProp(flowerPot(), p.x, p.z, .3, .23, "pot"); }
  });
  instanced(new THREE.BoxGeometry(3,2.8,3), M("#ffffff"), bodies);
  instanced(new THREE.ConeGeometry(2.45,1.9,4), M("#ffffff"), roofs);
  instanced(new THREE.BoxGeometry(.8,1.3,.08), M("#7a4a5e"), doors);
  instanced(new THREE.BoxGeometry(.62,.62,.06), new THREE.MeshBasicMaterial({ color:"#ffd98a" }), wins, false);
  instanced(new THREE.BoxGeometry(.38,1,.38), M("#8a6f86"), chims);
  // the café: striped awning, sign and a table for two
  { const { x, z, y, ry } = cafeHouse, L=(lx,lz)=>loc(x,z,ry,lx,lz);
    const aw=new THREE.Mesh(new THREE.BoxGeometry(3.2,.06,1.1), M("#ffffff",{ map:canvasTex(256,64,(c,w,h)=>{ for(let i=0;i<8;i++){ c.fillStyle=i%2?"#fff3e6":"#ff8fb1"; c.fillRect(i*32,0,32,h); } }) }));
    const ap=L(0,2); aw.position.set(ap.x, y+2.35, ap.z); aw.rotation.order="YXZ"; aw.rotation.set(.32, ry, 0); villageG.add(aw);
    const sign=signBoard("☕ Café Us",1.8,.5,"#b25d74"); const sp=L(-2.1,2.6); sign.position.set(sp.x, y+1.45, sp.z); sign.rotation.y=ry; villageG.add(sign);
    [-.7,.7].forEach(o=>{ const p=L(-2.1+o,2.6); const l=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.3,5),M("#3b2f3f")); l.position.set(p.x,y+.65,p.z); villageG.add(l); });
    block(sp.x, sp.z, .5);
    const tp=L(1.6,3.2); const tab=new THREE.Group(); tab.position.set(tp.x,y,tp.z); villageG.add(tab);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,14),M("#fff3e6")); top.position.y=.75; tab.add(top);
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.75,6),M("#3b2f3f")); leg.position.y=.37; tab.add(leg);
    [-1,1].forEach(s=>{ const st=new THREE.Mesh(new THREE.CylinderGeometry(.22,.2,.45,10),M("#ff8fb1")); st.position.set(s*.8,.23,0); tab.add(st); });
    const cup=new THREE.Mesh(new THREE.CylinderGeometry(.08,.06,.14,8),M("#fff3e6")); cup.position.set(.15,.85,0); tab.add(cup);
    const steam=sprite("#ffffff",.5,.25); steam.position.set(.15,1.05,0); tab.add(steam);
    block(tp.x, tp.z, 1.2); shadowy(villageG);
    const cs=L(0,4.6); CAFE_SPOT=new THREE.Vector3(cs.x,0,cs.z);
  }
  [.6,-.6,1.57,-1.57,2.4,-2.4].forEach(th=>{ const a=VILLAGE.a+th; addPost(VILLAGE.x+Math.sin(a)*6.9, VILLAGE.z+Math.cos(a)*6.9); });
}

/* ---------- Starlight Pier ---------- */
const pAt = (u,w) => ({ x:PIER.dx*u + PIER.dz*w, z:PIER.dz*u - PIER.dx*w });
const pierYaw = Math.atan2(PIER.dx, PIER.dz), PIER_END = (()=>{ const p=pAt(PIER.u1-3.2,0); return new THREE.Vector3(p.x,0,p.z); })();
const pierG = region(new THREE.Group(), pAt((PIER.u0+PIER.u1)/2,0).x, pAt((PIER.u0+PIER.u1)/2,0).z, 14); scene.add(pierG);
{
  const planks=[], stilts=[], posts=[], lights=[];
  for(let u=PIER.u0, k=0; u<=PIER.u1; u+=.5, k++){ const p=pAt(u,0); planks.push({ x:p.x, y:PIER.h-.06, z:p.z, ry:pierYaw, c:k%2?"#c98f86":"#b77d78" });
    if (k%6===0) [-1,1].forEach(s=>{ const q=pAt(u,s*1.9); stilts.push({ x:q.x, y:PIER.h-2.2, z:q.z }); });
    if (k%4===0) [-1,1].forEach(s=>{ const q=pAt(u,s*1.95); posts.push({ x:q.x, y:PIER.h+.45, z:q.z }); lights.push({ x:q.x, y:PIER.h+1.05, z:q.z, c:(k/4+s)%2?"#ffd98a":"#ffb3c6" }); });
    if (k%16===8){ const q=pAt(u,(k%32===8?1:-1)*2.25); addPost(q.x, q.z, PIER.h-.05, false); } }
  instanced(new THREE.BoxGeometry(4.2,.12,.48), M("#ffffff"), planks);
  instanced(new THREE.CylinderGeometry(.14,.17,4.2,7), M("#6a4a5e"), stilts);
  instanced(new THREE.CylinderGeometry(.06,.06,.9,6), M("#fff3e6"), posts);
  glowPoints(lights, 1.1);
  [-1,1].forEach(s=>{ const q=pAt((PIER.u0+PIER.u1)/2, s*1.95); const r=new THREE.Mesh(new THREE.BoxGeometry(.1,.08,PIER.u1-PIER.u0), M("#fff3e6")); r.position.set(q.x, PIER.h+.92, q.z); r.rotation.y=pierYaw; pierG.add(r); });
  // heart arch and a bench at the very end
  const arch=new THREE.Group(); const ap=pAt(PIER.u1-3.4,0); arch.position.set(ap.x, PIER.h, ap.z); arch.rotation.y=pierYaw+Math.PI/2; pierG.add(arch);
  [-1,1].forEach(s=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,2.4,6),M("#fff3e6")); p.position.set(s*2.15,1.2,0); arch.add(p); });
  const tor=new THREE.Mesh(new THREE.TorusGeometry(2.15,.1,6,24,Math.PI),M("#fff3e6")); tor.position.y=2.4; arch.add(tor);
  for(let i=0;i<9;i++){ const a=i/8*Math.PI; const h=new THREE.Mesh(new THREE.IcosahedronGeometry(.15,0),E(i%2?"#ff8fb0":"#f4cd84",1)); h.position.set(Math.cos(a)*2.15,2.4+Math.sin(a)*2.15,0); arch.add(h); }
  const ah=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.06,bevelEnabled:false}), E("#ff5f8f",1.5)); ah.scale.setScalar(1.3); ah.position.set(0,4.2,0); arch.add(ah);
  const bench=new THREE.Group(); const bp=pAt(PIER.u1-.55,0); bench.position.set(bp.x,PIER.h,bp.z); bench.rotation.y=pierYaw; pierG.add(bench);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.8,.1,.5),M("#a77a6a")); seat.position.y=.5; bench.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(1.8,.45,.07),M("#a77a6a")); back.position.set(0,.82,-.23); bench.add(back);
  const sign=signBoard("🌊 Starlight Pier",2.4,.6,"#5a6fb0"); const sp=pAt(PIER.u0-1.5,3.4); sign.position.set(sp.x, groundH(sp.x,sp.z)+1.8, sp.z); sign.rotation.y=pierYaw; pierG.add(sign);
  const sPole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.9,6),M("#3b2f3f")); sPole.position.set(sp.x, groundH(sp.x,sp.z)+.95, sp.z); pierG.add(sPole); block(sp.x,sp.z,.3);
  shadowy(pierG);
}

/* ---------- Ferris wheel on the beach ---------- */
const FER = PA(5.78, coastR(5.78)*.8), ferYaw = Math.atan2(-FER.x, -FER.z);
const ferG = region(new THREE.Group(), FER.x, FER.z, 12); ferG.position.set(FER.x, groundH(FER.x,FER.z), FER.z); ferG.rotation.y = ferYaw; scene.add(ferG);
const ferWheel = new THREE.Group(), gondolas = []; let ferBoost = 0;
const FER_R = 6.5, FER_H = 9.2;            // wheel radius and axle height (a basket at the bottom just clears the ground)
{
  const leg=M("#efe6ff"), L=Math.hypot(3.4,FER_H), tilt=Math.atan(3.4/FER_H);
  [-.9,.9].forEach(z=>[-1,1].forEach(s=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,L,6),leg); l.position.set(s*1.7,FER_H/2,z); l.rotation.z=s*tilt; ferG.add(l); }));
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,2.1,8),M("#b25d74")); axle.rotation.x=Math.PI/2; axle.position.y=FER_H; ferG.add(axle);
  ferWheel.position.y=FER_H; ferG.add(ferWheel);
  [-.45,.45].forEach(z=>{ const rim=new THREE.Mesh(new THREE.TorusGeometry(FER_R,.1,6,56),E("#ff9ec0",.35)); rim.position.z=z; ferWheel.add(rim); });
  for(let k=0;k<12;k++){ const sp=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,FER_R*2,4),M("#fff3e6")); sp.rotation.z=k/12*Math.PI; ferWheel.add(sp); }
  const bulbs=[]; for(let k=0;k<56;k++){ const a=k/56*Math.PI*2; bulbs.push({ x:Math.cos(a)*FER_R, y:Math.sin(a)*FER_R, z:k%2?.45:-.45, c:["#ffd98a","#ff9ec0","#7ef0ff"][k%3] }); }
  ferWheel.userData.bulbs = glowPoints(bulbs, 1, ferWheel);
  // 8 open baskets with a little bench and a roof on poles, so the two of you can be seen riding inside
  const GC=["#ff8fb1","#c9b6ff","#ffe1b3","#bfe3e0","#f4b8a8","#ffd1dc","#cfe6ff","#f4cd84"], white=M("#fff3e6");
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, pv=new THREE.Group(); pv.position.set(Math.cos(a)*FER_R, Math.sin(a)*FER_R, 0); ferWheel.add(pv);
    const cab=new THREE.Group(); cab.position.y=-2.3; pv.add(cab);
    const wall=new THREE.Mesh(new THREE.CylinderGeometry(.86,.76,.5,14,1,true),M(GC[k],{ side:THREE.DoubleSide })); wall.position.y=.25; cab.add(wall);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(.76,14),M("#7a4a5e")); floor.rotation.x=-Math.PI/2; floor.position.y=.02; cab.add(floor);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.86,.05,6,18),white); rim.rotation.x=Math.PI/2; rim.position.y=.5; cab.add(rim);
    const seatB=new THREE.Mesh(new THREE.BoxGeometry(1.1,.1,.4),M("#a77a6a")); seatB.position.set(0,.42,-.25); cab.add(seatB);
    for(let q=0;q<4;q++){ const pa=q/4*Math.PI*2+Math.PI/4, po=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.3,5),white); po.position.set(Math.cos(pa)*.74,1.15,Math.sin(pa)*.74); cab.add(po); }
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.02,.5,12),M(GC[(k+3)%8])); roof.position.y=2.02; cab.add(roof);
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.3,4),white); rod.position.y=2.35; cab.add(rod);
    const lamp=sprite("#ffe2a8",.9,.7); lamp.position.y=1.7; cab.add(lamp);
    pv.userData.cab=cab; gondolas.push(pv); }
  const hub=sprite("#ffd98a",3,.6); hub.position.y=FER_H; ferG.add(hub);
  shadowy(ferG); hub.castShadow=false;
  // an invisible box around the whole wheel: click / tap anywhere on it to ride together
  const rideHit=new THREE.Mesh(new THREE.BoxGeometry(FER_R*2+2, FER_R*2+FER_H-3, 3), new THREE.MeshBasicMaterial({ visible:false }));
  rideHit.position.y=(FER_R*2+FER_H-3)/2; ferG.add(rideHit); rideHit.userData.onClick=()=>startRide(); clickables.push(rideHit);
  [-3.4,3.4].forEach(lx=>{ const p=loc(FER.x,FER.z,ferYaw,lx,0); block(p.x,p.z,.6); }); block(FER.x,FER.z,1.4);
}
const FER_SPOT = (()=>{ const p=loc(FER.x,FER.z,ferYaw,0,6); return new THREE.Vector3(p.x,0,p.z); })();

/* ---------- Whispering Falls: a waterfall over a rocky cliff, a glowing pool and a bench ---------- */
// local frame: origin = pool centre, +z points back towards the middle of the island, the cliff is at -z
const fallsYaw = Math.atan2(-FALLS.x, -FALLS.z), FL = (lx,lz) => loc(FALLS.x, FALLS.z, fallsYaw, lx, lz);
const fallsG = region(new THREE.Group(), FALLS.x, FALLS.z, 12); fallsG.position.set(FALLS.x, 0, FALLS.z); fallsG.rotation.y = fallsYaw; scene.add(fallsG);
const fallsWater = [], fallsRipples = [], fallsMist = [], rainbow = []; let fallsSplash, LIP_Y, rainbowT = 0, fallsSnd = null;
const FALLS_SPOT = (()=>{ const p=FL(0,6.6); return new THREE.Vector3(p.x,0,p.z); })();
{
  // the cliff: an arc of stacked boulders, tallest beside the gap the water pours through
  const RC2=["#5d5a86","#6b6699","#4f4c78","#77709f","#625d8f"], rocks=[], moss=[], flowers=[];
  const addStack=(lx,lz,layers,s0)=>{ const p=FL(lx,lz), gy=groundH(p.x,p.z);
    for(let k=0;k<layers;k++){ const s=(s0-k*.32)*rnd(.88,1.08), q=FL(lx*(1-k*.05), lz-k*.3), y=gy+.3+k*1.5;
      rocks.push({ x:q.x, y, z:q.z, s, sy:s*.78, rx:rnd(0,6), ry:rnd(0,6), c:RC2[(rocks.length*3)%5] });
      if (k===layers-1){ moss.push({ x:q.x, y:y+s*.6, z:q.z, s:s*.72, sy:s*.22, ry:rnd(0,6), c:["#3f8a6e","#4f9a7a","#2f7a6a"][rocks.length%3] });
        for(let f=0;f<3;f++){ const a=rnd(0,6.28); flowers.push({ x:q.x+Math.cos(a)*s*.5, y:y+s*.75, z:q.z+Math.sin(a)*s*.5, c:["#ff9ed2","#ffd98a","#7ef0ff","#c9a8ff"][(rocks.length+f)%4] }); } } }
    block(p.x, p.z, s0*.85); return gy; };
  for(let i=1;i<=6;i++) [-1,1].forEach(sg=>{ const ang=sg*(.34+(i-1)*.23), R=5.7+i*.12; addStack(Math.sin(ang)*R, -Math.cos(ang)*R, Math.max(1, 5-i), i<3?1.6:2.1); });
  const gyb = addStack(0, -7.1, 3, 2);
  LIP_Y = gyb + .3 + 2*1.5 + .75;
  instanced(jitter(new THREE.DodecahedronGeometry(1,1),.18), M("#ffffff"), rocks);
  instanced(new THREE.SphereGeometry(1,10,6), M("#ffffff",{ emissive:"#0e2a22", emissiveIntensity:.4 }), moss, false);
  glowPoints(flowers, .7);
  // falling water: a curved sheet with a scrolling streak texture, a glowing layer on top and a soft back
  const streaks=canvasTex(128,256,(x,w,h)=>{ x.clearRect(0,0,w,h);
    for(let i=0;i<90;i++){ const sx=Math.random()*w, sw=1+Math.random()*4, sy=Math.random()*h, sl=40+Math.random()*160, a=.25+Math.random()*.65;
      x.fillStyle=`rgba(255,255,255,${a})`; x.fillRect(sx,sy,sw,sl); x.fillRect(sx,sy-h,sw,sl); } });
  streaks.wrapS=streaks.wrapT=THREE.RepeatWrapping; streaks.repeat.set(1.5,2);
  const sheet=(width, zOff)=>{ const g=new THREE.PlaneGeometry(width,1,1,14), p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const v=p.getY(i)+.5; p.setY(i, .1+v*(LIP_Y-.1)); p.setZ(i, -6.1+2.35*Math.sqrt(1-v)+zOff); } g.computeVertexNormals(); return g; };
  const back=new THREE.Mesh(sheet(2.5,-.1), new THREE.MeshBasicMaterial({ color:"#4f8fd0", transparent:true, opacity:.55, depthWrite:false, side:THREE.DoubleSide })); fallsG.add(back);
  const main=new THREE.Mesh(sheet(2.6,0), new THREE.MeshBasicMaterial({ map:streaks, color:"#e4f7ff", transparent:true, opacity:.95, depthWrite:false, side:THREE.DoubleSide })); fallsG.add(main); fallsWater.push({ m:main, speed:1.4 });
  const tex2=streaks.clone(); tex2.needsUpdate=true; tex2.repeat.set(2.2,1.4);
  const glow=new THREE.Mesh(sheet(3.1,.08), new THREE.MeshBasicMaterial({ map:tex2, color:"#9fe4ff", transparent:true, opacity:.45, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending })); fallsG.add(glow); fallsWater.push({ m:glow, speed:2.1 });
  const halo=sprite("#9fe4ff", 7, .3); halo.position.set(0, LIP_Y*.5, -4.6); fallsG.add(halo);
  // the glowing pool
  const pool=new THREE.Mesh(new THREE.CircleGeometry(FALLS.r+1.1,36), new THREE.MeshStandardMaterial({ color:"#3f86c8", emissive:"#1d5aa0", emissiveIntensity:.65, roughness:.15, metalness:.2, transparent:true, opacity:.9 }));
  pool.rotation.x=-Math.PI/2; pool.position.y=.1; fallsG.add(pool); block(FALLS.x, FALLS.z, FALLS.r+1.2);
  for(let k=0;k<3;k++){ const r=new THREE.Mesh(new THREE.RingGeometry(.8,1,32), new THREE.MeshBasicMaterial({ color:"#ffffff", transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide }));
    r.rotation.x=-Math.PI/2; r.position.set(0,.13,-3.7); r.userData.p=k/3; fallsG.add(r); fallsRipples.push(r); }
  for(let k=0;k<3;k++){ const s=sprite("#d8f2ff", 3.2, .2); s.position.set(rnd(-1,1), .6+k*.5, -3.6+rnd(-.3,.3)); s.userData.p=k*2; fallsG.add(s); fallsMist.push(s); }
  const sp=[]; for(let k=0;k<(isTouch?30:50);k++) sp.push({ x:0, y:0, z:0, c:k%3?"#ffffff":"#bfeaff" });
  fallsSplash=glowPoints(sp, .35, fallsG); fallsSplash.userData.seed=sp.map(()=>[rnd(-1.2,1.2), rnd(0,1), rnd(.6,1.4), rnd(-.2,.9)]);
  // a rainbow that appears when she sits on the bench
  ["#ff9aa8","#ffc89a","#fff1a0","#a8f0b8","#9ad0ff","#c7a8ff"].forEach((c,k)=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(4.2+k*.16,.075,4,48,Math.PI),
    new THREE.MeshBasicMaterial({ color:c, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending })); r.position.set(0,.2,-2.2); fallsG.add(r); rainbow.push(r); });
  // the bench, facing the waterfall, with a lamp, flowers and a sign
  const bench=new THREE.Group(); const bp=FL(0,5.4); bench.position.set(bp.x, groundH(bp.x,bp.z), bp.z); bench.rotation.y=fallsYaw+Math.PI; bench.userData.bench=true; scene.add(bench);
  const wood=M("#a77a6a"), iron=M("#3b2f3f");
  [0,.17,.34].forEach(z=>{ const sl=new THREE.Mesh(new THREE.BoxGeometry(2,.07,.15),wood); sl.position.set(0,.5,z-.17); bench.add(sl); });
  [.62,.82,1.02].forEach(y=>{ const sl=new THREE.Mesh(new THREE.BoxGeometry(2,.12,.05),wood); sl.position.set(0,y,-.27); sl.rotation.x=-.12; bench.add(sl); });
  [-.9,.9].forEach(x=>{ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.5,.5),iron); l.position.set(x,.25,0); bench.add(l);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.07,.06,.5),iron); arm.position.set(x,.7,0); bench.add(arm);
    const back=new THREE.Mesh(new THREE.BoxGeometry(.07,.6,.06),iron); back.position.set(x,.8,-.29); bench.add(back); });
  const hrt=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.03,bevelEnabled:false}), E("#ff8fb1",.9)); hrt.scale.setScalar(.45); hrt.position.set(0,1.2,-.3); bench.add(hrt);
  shadowy(bench); block(bp.x, bp.z, 1.1);
  const lp=FL(2.1,5.7); addPost(lp.x, lp.z);
  [[-1.6,5.2],[1.4,4.9]].forEach(([lx,lz])=>{ const p=FL(lx,lz); addProp(flowerPot(), p.x, p.z, .3, .23, "pot"); });
  const sign=signBoard("💧 Whispering Falls",2.4,.6,"#3f7fb0"); const sgp=FL(-2.7,6.8), sgy=groundH(sgp.x,sgp.z);
  sign.position.set(sgp.x, sgy+1.8, sgp.z); sign.rotation.y=fallsYaw; scene.add(shadowy(sign));
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.9,6),iron); pole.position.set(sgp.x, sgy+.95, sgp.z); scene.add(pole); block(sgp.x, sgp.z, .3);
}
function updateFalls(dt, t){
  if (fallsG.visible){
  fallsWater.forEach(w=>{ w.m.material.map.offset.y += dt*w.speed; });
  fallsRipples.forEach(r=>{ const k=(t*.45+r.userData.p)%1; r.scale.setScalar(1+k*2.6); r.material.opacity=(1-k)*.45; });
  fallsMist.forEach(s=>{ s.material.opacity=.14+Math.sin(t*.9+s.userData.p)*.06; s.scale.setScalar(3+Math.sin(t*.7+s.userData.p)*.5); });
  const pos=fallsSplash.geometry.attributes.position, sd=fallsSplash.userData.seed;
  sd.forEach(([x,ph,up,fz],i)=>{ const k=(t*1.3+ph)%1; pos.setXYZ(i, x*(1+k*.6), .15+Math.sin(k*Math.PI)*up, -3.7+fz*k*1.2); }); pos.needsUpdate=true;
  rainbowT=Math.max(0, rainbowT-dt); const ra=Math.min(1, rainbowT/2, (12-rainbowT)/2)*.55; rainbow.forEach(r=>{ r.material.opacity = rainbowT>0 ? ra : 0; });
  }
  // soft rushing-water sound that gets louder as she gets closer
  if (actx && !fallsSnd){ try { const len=actx.sampleRate*2, b=actx.createBuffer(1,len,actx.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const s=actx.createBufferSource(); s.buffer=b; s.loop=true; const lp=actx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1100; const hp=actx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=180;
    const g=actx.createGain(); g.gain.value=0; s.connect(lp); lp.connect(hp); hp.connect(g); g.connect(actx.destination); s.start(); fallsSnd={ g }; } catch(e){ fallsSnd={ g:null }; } }
  if (fallsSnd && fallsSnd.g){ const d=Math.hypot(her.position.x-FALLS.x, her.position.z-FALLS.z), v=Math.max(0, 1-d/30);
    fallsSnd.g.gain.setTargetAtTime((playing && !document.hidden) ? .14*v*v : 0, actx.currentTime, .3); }
}
