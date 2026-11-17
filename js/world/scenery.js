// Grass, trees, mushrooms, the 5 letter landmarks, the Last Door, well, swing, sky things.

/* ============================ SCENERY ============================ */
const animators = [];

// blossom trees
const occluders = [];
function blossomTree(x, z, s=1, col="#f2a7bb", lights=false){
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.32*s,2.4*s,7), M("#5b3b52")); trunk.position.y=1.2*s; g.add(trunk);
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(.08*s,.14*s,1.2*s,5), M("#5b3b52")); branch.position.set(.4*s,2.1*s,0); branch.rotation.z=-.8; g.add(branch);
  [[0,3,0,1.35],[.9,2.7,.3,1],[-.8,2.75,-.3,1.05],[.1,3.7,-.35,.9],[-.3,3.2,.8,.85]].forEach(([a,b,c,r])=>{
    const m = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(r*s,1),.12*s), M(col,{emissive:col,emissiveIntensity:.08})); m.position.set(a*s,b*s,c*s); g.add(m); });
  if (lights){
    for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, r=1.3*s; const b=new THREE.Mesh(new THREE.SphereGeometry(.06,6,4), E(i%2?"#ffd98a":"#ffb3c6",2.2));
      b.position.set(Math.cos(a)*r, 2.4*s + Math.sin(a*3)*.25, Math.sin(a)*r); g.add(b); }
  }
  g.rotation.y = Math.random()*6;
  place(shadowy(g), x, z); block(x,z,.45*s,g); occluders.push(g); g.userData.shake=0; g.userData.baseRot=g.rotation.y; STATIC.push(g); return g;
}

// glowing mushrooms
function mushroom(x,z,s=1,col="#7ef0ff"){
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.08*s,.12*s,.45*s,6), M("#efe6ff")); stem.position.y=.22*s; g.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.26*s,8,5,0,Math.PI*2,0,Math.PI/2), E(col,.75)); cap.position.y=.42*s; g.add(cap);
  place(g,x,z); return g;
}
// crystals
function crystal(x,z,s=1,col="#c9a8ff"){
  const g=new THREE.Group();
  for(let i=0;i<3;i++){ const c=new THREE.Mesh(new THREE.OctahedronGeometry(.3*s,0), E(col,.55)); c.scale.set(1,2.6+i*.4,1);
    c.position.set((i-1)*.3*s,.6*s,(i%2)*.2*s); c.rotation.set((i-1)*.3,i,(1-i)*.25); g.add(c); }
  place(g,x,z); STATIC.push(g); return g;
}

// grass (instanced, swaying): each copy is a soft tuft of 4 thin, curved blades,
// dark at the root and lighter at the tip
function grassTuft(){
  const pos=[], col=[], nor=[], idx=[], R=(a,b)=>a+Math.random()*(b-a);
  for(let b=0;b<4;b++){
    const yaw=b/4*Math.PI*2+R(-.5,.5), dx=Math.sin(yaw), dz=Math.cos(yaw), px=-dz, pz=dx;   // blade leans along (dx,dz), its width along (px,pz)
    const ox=dx*R(.02,.07), oz=dz*R(.02,.07), h=R(.38,.62), w=R(.035,.05), lean=R(.06,.16), i0=pos.length/3;
    [[0,w,0,.32],[.55,w*.62,.35,.72],[1,0,1,1.12]].forEach(([t,ww,bend,shade])=>{
      const cx=ox+dx*lean*bend, cz=oz+dz*lean*bend, y=h*t;
      if (ww>0){ pos.push(cx-px*ww,y,cz-pz*ww, cx+px*ww,y,cz+pz*ww); col.push(shade,shade,shade, shade,shade,shade); nor.push(0,1,0, 0,1,0); }
      else { pos.push(cx,y,cz); col.push(shade,shade,shade); nor.push(0,1,0); } });
    idx.push(i0,i0+1,i0+3, i0,i0+3,i0+2, i0+2,i0+3,i0+4);
  }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
  g.setAttribute("normal",new THREE.Float32BufferAttribute(nor,3)); g.setIndex(idx); return g;
}
{
  const n = isTouch ? 6000 : 14000;
  const geo = grassTuft();
  const mat = new THREE.MeshStandardMaterial({ color:"#ffffff", vertexColors:true, side:THREE.DoubleSide, roughness:1 });
  mat.onBeforeCompile = sh => { sh.uniforms.uTime = timeU; sh.uniforms.uWind = windU; sh.uniforms.uCar = carU;
    // both sides of a blade are lit like the ground (no dark back faces)
    sh.fragmentShader = sh.fragmentShader.replace("#include <normal_fragment_begin>", "float faceDirection = 1.0;\nvec3 normal = normalize( vNormal );\nvec3 geometryNormal = normal;");
    sh.vertexShader = "uniform float uTime; uniform float uWind; uniform vec3 uCar;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      vec4 ip = instanceMatrix * vec4(0.,0.,0.,1.);
      mat3 im = mat3(instanceMatrix);
      float gust = uWind * (.55 + .45*sin(uTime*.9 + ip.x*.15 - ip.z*.12));
      float sw = sin(uTime*1.8 + ip.x*.7 + ip.z*.5) * .12 + gust * .3;
      vec3 wv = vec3(-.6, 0., .8) * sw;
      vec2 away = ip.xz - uCar.xz; float d = length(away);
      float push = (1. - smoothstep(.5, 2.1, d)) * step(abs(ip.y - uCar.y), 2.);
      if (d > .001) wv += vec3(away.x/d, -.5, away.y/d) * push * .9;
      vec3 lw = vec3(dot(im[0], wv), dot(im[1], wv), dot(im[2], wv)) / max(.0001, dot(im[0], im[0]));
      transformed += lw * position.y * position.y * 2.;`); };
  const grass = new THREE.InstancedMesh(geo, mat, n); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), c = new THREE.Color();
  let k=0;
  while(k<n){ const x=(Math.random()-.5)*140, z=(Math.random()-.5)*140; if (isSand(x,z) || Math.hypot(x,z) < 4.2 || onRoad(x,z) || groundH(x,z) < .4) continue;
    q.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.random()*6); const sc=.85+Math.random()*.6; s.set(sc,sc*(.8+Math.random()*.7),sc);
    v.set(x, groundH(x,z)-.02, z); m.compose(v,q,s); grass.setMatrixAt(k,m);
    grass.setColorAt(k, c.set(["#5f9e7a","#6fae86","#4f8f7a","#7bb59a","#6a9fb0","#8aa0c8"][k%6])); k++; }
  grass.receiveShadow = true; scene.add(grass);
}

// stepping-stone loop
const SPOTS = [P(.45, 11.5), P(1.65, 12.5), P(2.85, 13), P(3.95, coastR(3.95)*.86), P(5.1, coastR(5.1)*.86)];
// the stepping-stone loop keeps the meadow's old shape (the last two letters moved out to the new beach)
const PATH_PTS = [SPOTS[0], SPOTS[1], SPOTS[2], P(3.95, coastR0(3.95)*.86), P(5.1, coastR0(5.1)*.86)];
const DOOR = new THREE.Vector3(0, 0, -.5);
{
  const pts = PATH_PTS.map(p=>p.clone().multiplyScalar(.82));
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const geo = new THREE.CylinderGeometry(.4,.46,.12,7); const mat = M("#c8bfe6");
  const n=110, inst = new THREE.InstancedMesh(geo, mat, n), m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), v=new THREE.Vector3();
  for(let i=0;i<n;i++){ const p=curve.getPoint(i/n); v.set(p.x, groundH(p.x,p.z)+.04, p.z); q.setFromAxisAngle(new THREE.Vector3(0,1,0), i*1.3); m.compose(v,q,s); inst.setMatrixAt(i,m); }
  inst.receiveShadow = true; scene.add(inst);
  // spokes to the door
  for(let j=0;j<5;j++){ const a=PATH_PTS[j].clone().multiplyScalar(.82), b=new THREE.Vector3(0,0,0);
    for(let t=.2;t<.85;t+=.09){ const x=a.x+(b.x-a.x)*t, z=a.z+(b.z-a.z)*t; const st=new THREE.Mesh(geo,mat); st.position.set(x,groundH(x,z)+.04,z); st.receiveShadow=true; scene.add(st); STATIC.push(st); } }
}

// scatter scenery
const rnd = (a,b)=>a+Math.random()*(b-a);
[[5,6,1.1,"#f2a7bb",true],[9.5,-7,1.2,"#f4cd84"],[-7,-6,1.1,"#f2a7bb",true],[-13,1,1.15,"#f4cd84"],
 [10,11,1,"#f2a7bb",true],[-6,-13.5,1.05,"#f6c1d0"],[0,-15,1.1,"#f2a7bb",true],[15,-2,.85,"#f4cd84"]]
  .forEach(([x,z,s,c,l])=>blossomTree(x,z,s,c,l));
for(let i=0;i<34;i++){ const a=rnd(0,6.28), r=rnd(5,17); const x=Math.sin(a)*r, z=Math.cos(a)*r; if(isSand(x,z)) continue;
  const g=new THREE.Group(); const cnt=2+Math.floor(Math.random()*3);
  for(let j=0;j<cnt;j++){ STATIC.push(mushroom(x+rnd(-.6,.6), z+rnd(-.6,.6), rnd(.6,1.4), ["#7ef0ff","#ff9ed2","#b9a2ff"][i%3])); } }
[[-4,16],[6,15.5],[16,-8],[-14,11],[3,-18]].forEach(([x,z],i)=>crystal(x,z,rnd(.9,1.4),i%2?"#ff9ed2":"#c9a8ff"));
// rocks on the beach
for(let i=0;i<34;i++){ const a=rnd(0,6.28), r=coastR(a)*rnd(.9,.99); const x=Math.sin(a)*r, z=Math.cos(a)*r;
  if (Math.abs(x*PIER.dz - z*PIER.dx) < 4 && x*PIER.dx + z*PIER.dz > 0) continue;
  const m=new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(rnd(.3,.8),0),.15), M("#5d5a86")); place(shadowy(m),x,z,.1); STATIC.push(m); }

/* ============================ LANDMARKS ============================ */
const landmarks = [];
function landmark(i, build){
  const p = SPOTS[i]; const g = new THREE.Group(); g.position.set(p.x, groundH(p.x,p.z), p.z);
  g.rotation.y = Math.atan2(p.x, p.z); scene.add(g);
  const anim = build(g) || (()=>{});
  shadowy(g);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,30,12,1,true), new THREE.MeshBasicMaterial({ color:"#f4cd84", transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide }));
  beacon.position.y = 15; g.add(beacon);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.3,0), E("#f4cd84",2)); marker.position.y = 4.4; g.add(marker);
  landmarks.push({ g, anim, beacon, marker, idx:i, pos:new THREE.Vector3(p.x, groundH(p.x,p.z), p.z) });
}

landmark(0, g=>{ // First Message: bench, lamp, chat bubble
  const bench = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2,.12,.55), M("#a77a6a")); seat.position.y=.55; bench.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2,.5,.08), M("#a77a6a")); back.position.set(0,.9,-.25); bench.add(back);
  [-.85,.85].forEach(x=>{ const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.55,.5),M("#3b2f3f")); l.position.set(x,.27,0); bench.add(l); });
  g.add(bench);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,2.6,6), M("#3b2f3f")); pole.position.set(1.5,1.3,-.2); g.add(pole);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.22,10,8), E("#ffd98a",2.5)); lamp.position.set(1.5,2.7,-.2); g.add(lamp);
  const pl = glowLight("#ffc98a", 4, .45); pl.position.copy(lamp.position); g.add(pl);
  const bubble = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.6,1,.3), E("#f8f0e6",.35)); bubble.add(b);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.2,.4,4), E("#f8f0e6",.35)); tail.position.set(-.45,-.62,0); tail.rotation.z=.5; bubble.add(tail);
  const dots=[-.4,0,.4].map((x,k)=>{ const d=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8), E("#e06b8a",1.2)); d.position.set(x,0,.17); bubble.add(d); return d; });
  bubble.position.y = 2.4; g.add(bubble);
  block(SPOTS[0].x, SPOTS[0].z, 1.3);
  return t => { bubble.lookAt(camera.position); bubble.position.y = 2.4+Math.sin(t*1.5)*.12; dots.forEach((d,k)=> d.position.y = Math.max(0,Math.sin(t*4-k))*.14); };
});

landmark(1, g=>{ // Name Garden
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.4,.1,6,22,Math.PI), M("#f8f0e6")); arch.position.y=1.7; g.add(arch);
  [-1.4,1.4].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1.7,6),M("#f8f0e6")); p.position.set(x,.85,0); g.add(p); });
  for(let i=0;i<11;i++){ const a=i/10*Math.PI; const r=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,0),E(i%2?"#ff8fb0":"#ffd1dc",.5)); r.position.set(Math.cos(a)*1.4,1.7+Math.sin(a)*1.4,0); g.add(r); }
  const flowers=[];
  for(let i=0;i<26;i++){ const a=Math.random()*6.28, r=.6+Math.random()*2; const f=new THREE.Group();
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.6,4),M("#4f8a6e")); st.position.y=.3; f.add(st);
    const col=["#ff8fb0","#f4cd84","#c9a8ff","#ffd1dc","#7ef0ff"][i%5];
    const h=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,0),E(col,.45)); h.position.y=.66; f.add(h);
    f.position.set(Math.cos(a)*r,0,Math.sin(a)*r+.6); f.userData.p=Math.random()*6; g.add(f); flowers.push(f); }
  block(SPOTS[1].x, SPOTS[1].z, .6);
  return t => flowers.forEach(f=> f.rotation.z = Math.sin(t*1.3+f.userData.p)*.14);
});

landmark(2, g=>{ // Midnight Call
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.4,.5,10), M("#8a7fc4")); plinth.position.y=.25; g.add(plinth);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(.55,1,.1), M("#2d2340")); phone.position.y=1.15; phone.rotation.x=-.25; g.add(phone);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.45,.82), E("#c9b6ff",1.3)); screen.position.set(0,1.155,.055); screen.rotation.x=-.25; g.add(screen);
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(.9,.26,8,26,Math.PI*1.25), E("#ffe9b8",1.4)); crescent.position.y=3.3; g.add(crescent);
  const halo = sprite("#f4cd84", 5, .4); halo.position.y = 3.3; g.add(halo);
  const notes = [];
  for(let i=0;i<5;i++){ const n=sprite("#ff9ed2", .5, .9, HEART); n.userData.p=i/5; g.add(n); notes.push(n); }
  block(SPOTS[2].x, SPOTS[2].z, 1.4);
  return t => { crescent.position.y = halo.position.y = 3.3+Math.sin(t)*.2; crescent.rotation.z = -.2+Math.sin(t*.6)*.15;
    notes.forEach(n=>{ const k=(t*.25+n.userData.p)%1; n.position.set(Math.sin(k*9)*.5, 1.6+k*2.2, .2); n.material.opacity = Math.sin(k*Math.PI)*.9; }); };
});

landmark(3, g=>{ // Beach Picture
  const palm = new THREE.Group();
  for(let i=0;i<7;i++){ const s=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.5,6),M("#8a6450")); s.position.set(-i*.07,.25+i*.46,0); s.rotation.z=.1; palm.add(s); }
  for(let i=0;i<7;i++){ const l=new THREE.Mesh(new THREE.ConeGeometry(.28,1.9,4),M("#3f9a7d")); l.position.y=3.3; l.rotation.set(0,i/7*6.28,1.95); l.translateY(.9); palm.add(l); }
  palm.position.set(-1.6,0,-.4); g.add(palm);
  const easel = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3,1.05,.08), M("#f8f0e6")); frame.position.y=1.45; frame.rotation.x=-.12; easel.add(frame);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.1,.86), E("#ff9ec0",.8)); pic.position.set(0,1.46,.045); pic.rotation.x=-.12; easel.add(pic);
  [-.45,.45].forEach(x=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.6,4),M("#8a6450")); l.position.set(x,.75,-.15); l.rotation.x=.12; easel.add(l); });
  easel.position.set(.6,0,0); g.add(easel);
  const pieces=[]; // scattered photo pieces glinting on sand
  for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3), E("#ffd1dc",.9)); s.rotation.x=-Math.PI/2; s.rotation.z=i; s.position.set(rnd(-1.5,1.8),.06,rnd(.5,1.8)); g.add(s); pieces.push(s); }
  const boat = new THREE.Group(); const hull=new THREE.Mesh(new THREE.CylinderGeometry(.7,.45,.4,8,1,false,0,Math.PI),M("#a77a6a")); hull.rotation.set(Math.PI/2,0,Math.PI/2); hull.scale.set(1,2.2,1); boat.add(hull);
  boat.position.set(1,-.4,coastR(3.95)*.14+2.5); g.add(boat);
  block(SPOTS[3].x, SPOTS[3].z, .9);
  return t => { boat.position.y = -.35+Math.sin(t*1.4)*.08; boat.rotation.z = Math.sin(t)*.06; pieces.forEach((p,i)=>p.material.emissiveIntensity = .5+Math.max(0,Math.sin(t*3+i*1.7))*1.5); };
});

landmark(4, g=>{ // Two Lighthouses
  const beams=[];
  [[-1.4,0,"#ef9fae"],[1.6,.4,"#f8f0e6"]].forEach(([x,z,stripe],k)=>{
    const lh=new THREE.Group();
    for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.CylinderGeometry(.5-i*.055,.56-i*.055,.62,12),M(i%2?stripe:"#3a3470")); s.position.y=.31+i*.62; lh.add(s); }
    const lampM=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.45,8),E("#ffd98a",2.5)); lampM.position.y=3.35; lh.add(lampM);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(.42,.55,8),M("#b25d74")); cap.position.y=3.85; lh.add(cap);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(1.4,9,18,1,true), new THREE.MeshBasicMaterial({color:"#ffe2a0",transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    beam.geometry.translate(0,-4.5,0); beam.rotation.z=Math.PI/2; beam.castShadow=false; const pv=new THREE.Group(); pv.position.y=3.35; pv.add(beam); pv.userData.k=k; lh.add(pv); beams.push(pv);
    lh.position.set(x,0,z); lh.scale.setScalar(k?1.05:.92); g.add(lh);
  });
  const pl=glowLight("#ffd98a", 6, .3); pl.position.set(0,3.4,0); g.add(pl);
  block(SPOTS[4].x, SPOTS[4].z, 2.2);
  return t => beams.forEach(b=> b.rotation.y = t*.8 + b.userData.k*Math.PI);
});
landmarks.forEach(l=>l.beacon.castShadow=false);

// the Last Door + gazebo platform
const doorG = new THREE.Group(); doorG.position.set(DOOR.x, groundH(DOOR.x,DOOR.z), DOOR.z); scene.add(doorG);
{
  const step1=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.7,.35,14),M("#7b70b8")); step1.position.y=.1; doorG.add(step1);
  const step2=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.9,.35,14),M("#9a8fd4")); step2.position.y=.42; doorG.add(step2);
}
const frameM = M("#f8f0e6");
[-1,1].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.38,3.2,.42),frameM); p.position.set(x*1.1,2.2,0); doorG.add(p); });
const archTop = new THREE.Mesh(new THREE.TorusGeometry(1.1,.2,6,18,Math.PI), frameM); archTop.position.y=3.8; doorG.add(archTop);
for(let i=0;i<13;i++){ const a=i/12*Math.PI; const r=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,0),E(i%2?"#ff8fb0":"#f4cd84",.8)); r.position.set(Math.cos(a)*1.1,3.8+Math.sin(a)*1.1,.18); doorG.add(r); }
const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.85,4.1), new THREE.MeshBasicMaterial({color:"#e8a9c0",transparent:true,opacity:0,side:THREE.DoubleSide})); portal.position.set(0,2.6,-.02); doorG.add(portal);
const hinge = new THREE.Group(); hinge.position.set(-.93,.6,.05); doorG.add(hinge);
const panel = new THREE.Mesh(new THREE.BoxGeometry(1.86,3.2,.12), M("#b25d74")); panel.position.set(.93,1.6,0); hinge.add(panel);
const hs = new THREE.Shape(); hs.moveTo(0,-.35); hs.bezierCurveTo(-.5,0,-.4,.4,-.15,.4); hs.bezierCurveTo(-.05,.4,0,.3,0,.22); hs.bezierCurveTo(0,.3,.05,.4,.15,.4); hs.bezierCurveTo(.4,.4,.5,0,0,-.35);
const doorHeart = new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:.06,bevelEnabled:false}), E("#f4cd84",1.2)); doorHeart.position.set(.93,1.9,.07); hinge.add(doorHeart);
const doorGlow = sprite("#ffd9a0", 7, 0); doorGlow.position.y = 2.6; doorG.add(doorGlow);
const doorLight = glowLight("#ffd9a0", 9, .45); doorLight.intensity = 0; doorLight.position.set(0,2.5,1.5); doorG.add(doorLight);
const doorBeacon = new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,30,12,1,true), new THREE.MeshBasicMaterial({ color:"#ff9ec0", transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide }));
doorBeacon.position.y = 15; doorG.add(doorBeacon);
shadowy(doorG); doorBeacon.castShadow=false; portal.castShadow=false;
block(DOOR.x-1.1, DOOR.z, .35); block(DOOR.x+1.1, DOOR.z, .35); block(DOOR.x, DOOR.z-.1, .5);

// wishing well
const WELL = P(-.55, 7.5);
const well = new THREE.Group();
{
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(.9,.95,.8,12,1,true),M("#8d87b8",{side:THREE.DoubleSide})); ring.position.y=.4; well.add(ring);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.92,.12,6,14),M("#a8a2d0")); rim.rotation.x=Math.PI/2; rim.position.y=.82; well.add(rim);
  const wtr=new THREE.Mesh(new THREE.CircleGeometry(.85,16),E("#7ef0ff",.9)); wtr.rotation.x=-Math.PI/2; wtr.position.y=.55; well.add(wtr);
  [-.85,.85].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.6,5),M("#6a4a5e")); p.position.set(x,1.5,0); well.add(p); });
  const roof=new THREE.Mesh(new THREE.ConeGeometry(1.25,.8,4),M("#b25d74")); roof.position.y=2.6; roof.rotation.y=Math.PI/4; well.add(roof);
}
place(shadowy(well), WELL.x, WELL.z); block(WELL.x, WELL.z, 1.1);
const wellLight = glowLight("#7ef0ff", 3.5, .4); wellLight.position.set(WELL.x, groundH(WELL.x,WELL.z)+.9, WELL.z); scene.add(wellLight);

// swing tree
const SWING = P(2.2, 7.2);
const swingTree = blossomTree(SWING.x, SWING.z, 1.35, "#f6c1d0", true);
const swing = new THREE.Group(); swing.position.set(SWING.x+1.1, groundH(SWING.x,SWING.z)+3.3, SWING.z); scene.add(swing);
{
  [-.35,.35].forEach(x=>{ const r=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.5,4),M("#f8f0e6")); r.position.set(x,-1.25,0); swing.add(r); });
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.9,.08,.4),M("#a77a6a")); seat.position.y=-2.5; swing.add(seat);
  for(let i=0;i<8;i++){ const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,0),E(i%2?"#ff8fb0":"#fff0a8",1)); f.position.set(i%2?-.35:.35,-.3*i-.2,0); swing.add(f); }
  shadowy(swing);
}
const SWINGSPOT = new THREE.Vector3(swing.position.x, 0, swing.position.z);

// fairy ring
const RING = P(4.55, 8.5);
const ringMushrooms = [];
for(let i=0;i<12;i++){ const a=i/12*6.28; ringMushrooms.push(mushroom(RING.x+Math.cos(a)*1.6, RING.z+Math.sin(a)*1.6, 1.1, i%2?"#ff9ed2":"#7ef0ff")); }

/* ============================ SKY THINGS ============================ */
// stars: soft round points of different sizes that twinkle (a few are tinted blue, pink or gold)
const starsU = { pr:{ value:1 } };
{
  const n=isTouch?2200:3200, pos=new Float32Array(n*3), col=new Float32Array(n*3), size=new Float32Array(n), ph=new Float32Array(n);
  const tints=[[1,.92,.85],[.8,.88,1],[1,.8,.9],[1,.9,.7]];
  for(let i=0;i<n;i++){ const u=Math.random()*.95+.04, th=Math.random()*6.28, r=380, s=Math.sqrt(1-u*u);
    pos[i*3]=Math.cos(th)*s*r; pos[i*3+1]=u*r; pos[i*3+2]=Math.sin(th)*s*r;
    const tn = Math.random()<.18 ? tints[1+Math.floor(Math.random()*3)] : tints[0]; col[i*3]=tn[0]; col[i*3+1]=tn[1]; col[i*3+2]=tn[2];
    size[i] = 1.4 + Math.pow(Math.random(), 7)*4.2; ph[i] = Math.random()*6.283; }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  g.setAttribute("size",new THREE.BufferAttribute(size,1)); g.setAttribute("ph",new THREE.BufferAttribute(ph,1));
  const stars=new THREE.Points(g, new THREE.ShaderMaterial({ uniforms:{ uTime:timeU, pr:starsU.pr }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:`attribute float size; attribute float ph; attribute vec3 color; uniform float uTime; uniform float pr; varying vec3 vC; varying float vA;
      void main(){ float tw=.6+.4*sin(uTime*(1.1+fract(ph*7.31)*2.4)+ph); vC=color; vA=tw; gl_PointSize=size*pr*(.85+.3*tw);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*smoothstep(.5,.05,d)*vA, 1.); }` }));
  stars.frustumCulled=false; scene.add(stars);
}
const moon = new THREE.Mesh(new THREE.SphereGeometry(14,32,20), new THREE.MeshBasicMaterial({color:"#fff1d6", fog:false}));
moon.position.set(-120,110,-200); scene.add(moon);
const moonHalo = sprite("#ffd9a0", 120, .4); moonHalo.material.fog=false; moonHalo.position.copy(moon.position); scene.add(moonHalo);
moonPath.position.set(-64, -.05, -108); moonPath.scale.set(20, 90, 1); moonPath.material.rotation = 0;

// heart-shaped clouds
function cloud(x,y,z,s){ const g=new THREE.Group(); const m=new THREE.MeshStandardMaterial({color:"#c9bdf0",transparent:true,opacity:.5,flatShading:true,roughness:1,emissive:"#3a2f6e",emissiveIntensity:.4});
  for(let j=0;j<5;j++){ const b=new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(2,3.6)*s,1),m); b.position.set((j-2)*2.6*s, rnd(-.6,.8)*s, rnd(-1,1)*s); g.add(b); }
  g.position.set(x,y,z); scene.add(g); return g; }
const clouds=[cloud(-60,40,-90,1.3),cloud(70,46,-60,1.1),cloud(40,38,110,1),cloud(-90,50,60,1.2),cloud(110,55,20,1)];

// sky lanterns: every lantern shares ONE instanced body mesh and ONE glow layer (2 draw calls for up to 110)
const LANT_MAX = 110, lanterns = [];
const lanternMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.32,.24,.6,8), E("#ffb36b",1.6), LANT_MAX);
lanternMesh.count = 0; lanternMesh.frustumCulled = false; scene.add(lanternMesh);
const lanternGlowPos = new Float32Array(LANT_MAX*3), lanternGlowCol = new Float32Array(LANT_MAX*3), lanternGlowGeo = new THREE.BufferGeometry();
lanternGlowGeo.setAttribute("position", new THREE.BufferAttribute(lanternGlowPos,3)); lanternGlowGeo.setAttribute("color", new THREE.BufferAttribute(lanternGlowCol,3));
const lanternGlow = new THREE.Points(lanternGlowGeo, new THREE.PointsMaterial({ size:2.6, map:GLOW, vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
lanternGlow.frustumCulled = false; scene.add(lanternGlow);
// a lantern is just data: { position, userData:{ p, vy, base } } — rising while vy > 0, then gently bobbing
function lantern(x,y,z,rise=false){
  if (lanterns.length >= LANT_MAX) lanterns.shift();   // keep the sky from getting too heavy
  const L = { position:new THREE.Vector3(x,y,z), userData:{ p:Math.random()*6, vy: rise ? 1.1 : 0, base:y } };
  lanterns.push(L); return L;
}
const _lm = new THREE.Matrix4();
function updateSkyLanterns(dt, t){
  lanterns.forEach((L,i)=>{ const u=L.userData;
    if (u.vy>0){ L.position.y += u.vy*dt; L.position.x += Math.sin(t*.5+u.p)*dt*.5; if (L.position.y>45){ u.vy=0; u.base=L.position.y; } }
    else L.position.y = u.base + Math.sin(t*.6+u.p)*.6;
    _lm.makeTranslation(L.position.x, L.position.y, L.position.z); lanternMesh.setMatrixAt(i, _lm);
    const f=.55+Math.sin(t*3+u.p)*.2; lanternGlowPos[i*3]=L.position.x; lanternGlowPos[i*3+1]=L.position.y; lanternGlowPos[i*3+2]=L.position.z;
    lanternGlowCol[i*3]=f; lanternGlowCol[i*3+1]=f*.7; lanternGlowCol[i*3+2]=f*.42; });
  lanternMesh.count = lanterns.length; lanternMesh.instanceMatrix.needsUpdate = true;
  lanternGlowGeo.setDrawRange(0, lanterns.length); lanternGlowGeo.attributes.position.needsUpdate = lanternGlowGeo.attributes.color.needsUpdate = true;
}
for(let i=0;i<26;i++){ const a=rnd(0,6.28), r=rnd(20,95); lantern(Math.sin(a)*r, rnd(14,40), Math.cos(a)*r); }

// fireflies: [centre x, centre z, wander radius, height, phase] — a third of them live in Firefly Forest
const flyN = isTouch ? 150 : 280, flyPos = new Float32Array(flyN*3), flySeed=[];
for(let i=0;i<flyN;i++){
  if (i%3===0){ const a=rnd(0,6.28), r=rnd(0,13); flySeed.push([FOREST.x+Math.sin(a)*r, FOREST.z+Math.cos(a)*r, rnd(.6,2.2), rnd(.5,4), rnd(0,6)]); }
  else { const a=rnd(0,6.28), r=coastR(a)*rnd(.05,.85); flySeed.push([Math.sin(a)*r, Math.cos(a)*r, rnd(.6,2.5), rnd(.5,3.5), rnd(0,6)]); } }
const flyGeo = new THREE.BufferGeometry(); flyGeo.setAttribute("position", new THREE.BufferAttribute(flyPos,3));
const flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({ color:"#ffe39a", size:.35, map:GLOW, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
scene.add(flies);

// falling petals (around the player)
const petN = isTouch ? 70 : 130, petPos = new Float32Array(petN*3), petSeed=[];
for(let i=0;i<petN;i++){ petSeed.push([rnd(-14,14), rnd(0,12), rnd(-14,14), rnd(0,6)]); }
const petGeo = new THREE.BufferGeometry(); petGeo.setAttribute("position", new THREE.BufferAttribute(petPos,3));
const petals = new THREE.Points(petGeo, new THREE.PointsMaterial({ color:"#ffb8cc", size:.16, map:HEART, transparent:true, depthWrite:false, opacity:.9 }));
scene.add(petals);

// burst particles (hearts & sparkles)
const bursts=[];
function burst(pos, n=24, color="#ff9ec0", heart=true, spread=1){
  for(let i=0;i<n;i++){ const s=sprite(color, rnd(.25,.5), 1, heart?HEART:GLOW); s.position.copy(pos);
    s.userData={ v:new THREE.Vector3(rnd(-1,1)*spread, rnd(1.5,3.5), rnd(-1,1)*spread), life:1, decay:rnd(.35,.6) }; scene.add(s); bursts.push(s); }
}
