// Vaishali, Prateek and Lumi the fairy.

/* ============================ CHARACTERS ============================ */
function person({ skin="#c98e6b", hair="#2a1a1e", top="#ef9fae", bottom="#f8f0e6", dress=true, long=true, curly=false, glasses=false }){
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const legGeo = new THREE.CylinderGeometry(.07,.06,.62,6); legGeo.translate(0,-.31,0);
  const legs = [-.11,.11].map(x=>{ const l=new THREE.Mesh(legGeo, M(dress? skin : "#3b4a7a")); l.position.set(x,.66,0); body.add(l);
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.2),M(dress?"#b25d74":"#3b2f3f")); shoe.position.set(0,-.62,.04); l.add(shoe); return l; });
  if (dress){ const d=new THREE.Mesh(new THREE.ConeGeometry(.4,.75,10,1,true), M(top,{side:THREE.DoubleSide})); d.position.y=.88; body.add(d); }
  else { const pants=new THREE.Mesh(new THREE.CylinderGeometry(.2,.22,.25,8),M("#3b4a7a")); pants.position.y=.72; body.add(pants); }
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,.5,8), M(dress ? top : top)); torso.position.y=1.12; body.add(torso);
  const armGeo = new THREE.CylinderGeometry(.05,.045,.55,6); armGeo.translate(0,-.27,0);
  const arms = [-.24,.24].map(x=>{ const a=new THREE.Mesh(armGeo, M(dress? skin : top)); a.position.set(x,1.33,0); body.add(a);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.05,6,4),M(skin)); hand.position.y=-.56; a.add(hand); return a; });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.1,6), M(skin)); neck.position.y=1.42; body.add(neck);
  const head = new THREE.Group(); head.position.y=1.62; body.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.2,14,10), M(skin,{flatShading:false})));
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(.215,14,10,0,Math.PI*2,0,Math.PI*.55), M(hair,{flatShading:false})); hairCap.rotation.x=-.25; hairCap.position.z=-.01; head.add(hairCap);
  if (long){ const back=new THREE.Mesh(new THREE.BoxGeometry(.36,.48,.12),M(hair)); back.position.set(0,-.18,-.13); head.add(back);
    const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.06,0),E("#ff8fb0",.8)); flower.position.set(.16,.12,.08); head.add(flower); }
  [-.07,.07].forEach(x=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(.022,6,4),M("#1d1420")); e.position.set(x,.02,.185); head.add(e); });
  if (curly) for(let k=0;k<18;k++){ // a mop of curls on top
    const a=k/18*Math.PI*2, ring=k%3, rr=[.16,.12,.06][ring], c=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,0), M(hair));
    c.position.set(Math.cos(a)*rr, .12+ring*.06, Math.sin(a)*rr-.02); head.add(c); }
  if (glasses){ const gm=M("#eef3f8",{ transparent:true, opacity:.9 });
    [-.075,.075].forEach(x=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,6,16), gm); r.position.set(x,.025,.2); head.add(r); });
    const br=new THREE.Mesh(new THREE.BoxGeometry(.045,.012,.012), gm); br.position.set(0,.035,.205); head.add(br); }
  [-.11,.11].forEach(x=>{ const c=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),M("#f08aa0",{transparent:true,opacity:.6})); c.position.set(x,-.05,.165); head.add(c); });
  shadowy(root);
  root.userData = { legs, arms, body, head, phase:0 };
  return root;
}
function animatePerson(p, speed, dt, t){
  const u = p.userData; u.phase += dt * (4 + speed*2.2);
  const sw = Math.min(1, speed/3) * .7;
  u.legs[0].rotation.x = Math.sin(u.phase)*sw; u.legs[1].rotation.x = -Math.sin(u.phase)*sw;
  u.arms[0].rotation.x = -Math.sin(u.phase)*sw*.8; u.arms[1].rotation.x = Math.sin(u.phase)*sw*.8;
  u.body.position.y = Math.abs(Math.sin(u.phase))*.05*Math.min(1,speed);
  if (speed < .1){ u.arms[0].rotation.z = .08 + Math.sin(t*1.4)*.02; u.arms[1].rotation.z = -.08 - Math.sin(t*1.4)*.02; u.body.position.y = Math.sin(t*1.6)*.012; }
}

// Vaishali: dark shoulder-length hair; him: curly hair, clear glasses, the blue check shirt from the Taj night
const her = person({ skin:"#a8714f", hair:"#17101a" }); scene.add(her);
const him = person({ skin:"#8f5d3e", hair:"#120d12", top:"#3e5fb8", dress:false, long:false, curly:true, glasses:true }); scene.add(him);   // Prateek: rides along from the start
const START = P(0, 16.8);
her.position.set(START.x, groundH(START.x, START.z), START.z); her.rotation.y = Math.PI;
const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(.35,16), new THREE.MeshBasicMaterial({color:"#000",transparent:true,opacity:.25,depthWrite:false}));
shadowBlob.rotation.x = -Math.PI/2; scene.add(shadowBlob);

// fairy companion
const fairy = new THREE.Group(); scene.add(fairy);
const fairyCore = new THREE.Mesh(new THREE.SphereGeometry(.09,10,8), E("#fff4c4",3)); fairy.add(fairyCore);
const fairyGlow = sprite("#ffd98a", 1.3, .9); fairy.add(fairyGlow);
const wingM = new THREE.MeshBasicMaterial({ color:"#cfe9ff", transparent:true, opacity:.55, side:THREE.DoubleSide, depthWrite:false, blending:THREE.AdditiveBlending });
const wingGeo = new THREE.CircleGeometry(.18,10); wingGeo.scale(1,1.6,1); wingGeo.translate(0,.22,0);
const wings = [-1,1].map(s=>{ const w=new THREE.Mesh(wingGeo,wingM); w.position.x = s*.03; w.rotation.z = s*-.9; fairy.add(w); return w; });
const trailN=26, trailPos=new Float32Array(trailN*3), trail=[]; for(let i=0;i<trailN;i++) trail.push(new THREE.Vector3());
const trailGeo=new THREE.BufferGeometry(); trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos,3));
const trailPts = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color:"#ffe39a", size:.18, map:GLOW, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.8 }));
scene.add(trailPts);
fairy.position.copy(her.position).add(new THREE.Vector3(.8,2,0));
trail.forEach(v=>v.copy(fairy.position));
