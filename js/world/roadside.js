// Signposts, lamp posts, Firefly Forest and outer-ring trees.

/* ---------- signposts where the spokes leave the ring road ---------- */
[[.9,"⭐ Stargazer Hill"],[1.62,"💧 Whispering Falls"],[2.3,"🌙 Moon Lagoon"],[3.3,"🌲 Firefly Forest"],[4.6,"🏡 Fairy Village"],[5.34,"⛏️ Block World"],[6.0,"🌊 Starlight Pier"]].forEach(([a,text])=>{
  const p=ring(a+.1, ringR(a)+3.6), q=ring(a+.11), o=ring(a+.09), ry=Math.atan2(q.x-o.x, q.z-o.z), y=groundH(p.x,p.z);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,2.6,6),M("#3b2f3f")); pole.position.set(p.x,y+1.3,p.z); scene.add(shadowy(pole));
  const b=signBoard(text,2.4,.6); b.position.set(p.x,y+2.3,p.z); b.rotation.y=ry; scene.add(shadowy(b)); block(p.x,p.z,.3);
});

/* ---------- lamp posts along every road ---------- */
roadLines.forEach(line=>{ for(let i=6;i<line.length-3;i+=13){
  const [x,z]=line[i], [x2,z2]=line[i+1], tl=Math.hypot(x2-x,z2-z)||1, tx=(x2-x)/tl, tz=(z2-z)/tl, s=(i/13|0)%2?1:-1, px=x+tz*s*3.1, pz=z-tx*s*3.1;
  if (groundH(px,pz) < .3 || roadLines.some(l=>l.some(([a,b])=>(a-px)**2+(b-pz)**2 < 7.3))) continue;
  if (colliders.some(c=>Math.hypot(px-c.x,pz-c.z) < c.r+.6)) continue;
  addPost(px,pz); } });
{
  const pole=new THREE.CylinderGeometry(.06,.09,2.8,6); pole.translate(0,1.4,0);
  instanced(pole, M("#3b2f3f"), lampPosts.map(p=>({ x:p.x, y:p.y, z:p.z })));
  instanced(new THREE.SphereGeometry(.2,10,8), new THREE.MeshBasicMaterial({ color:"#ffe2a8" }), lampPosts.map(p=>({ x:p.x, y:p.y+2.9, z:p.z })), false);
  glowPoints(lampPosts.map((p,i)=>({ x:p.x, y:p.y+2.9, z:p.z, c:i%3?"#ffd98a":"#ffb3c6" })), 2.6);
  lampPosts.forEach(p=>{ if (p.solid) block(p.x,p.z,.25); });
}

/* ---------- Firefly Forest + trees all over the outer ring ---------- */
{
  const spots=[], avoid=[[LAGOON.x,LAGOON.z,LAGOON.r+4],[VILLAGE.x,VILLAGE.z,14.5],[HILL.x,HILL.z,3],[LOOK.x,LOOK.z,4],[FER.x,FER.z,9],[FALLS.x,FALLS.z,10],[FALLS_ROCK.x,FALLS_ROCK.z,7],[LANT.x,LANT.z,11],[BW.x,BW.z,13],[SPOTS[3].x,SPOTS[3].z,7],[SPOTS[4].x,SPOTS[4].z,7]];
  const ok=(x,z)=> groundH(x,z)>.4 && !isSand(x,z) && ![[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]].some(([i,j])=>onRoad(x+i,z+j))
    && avoid.every(([ax,az,r])=>Math.hypot(x-ax,z-az)>r) && colliders.every(c=>Math.hypot(x-c.x,z-c.z)>c.r+1.6) && spots.every(t=>Math.hypot(x-t.x,z-t.z)>2.7);
  const want=(n, a0, a1, forest)=>{ for(let k=0,tries=0;k<n && tries<n*25;tries++){ const a=rnd(a0,a1), r=rnd(ringR(a)+3.5, coastR(a)*.84), x=Math.sin(a)*r, z=Math.cos(a)*r;
    if (!ok(x,z)) continue; spots.push({ x, z, y:groundH(x,z), s:rnd(.8,1.35), pine: forest ? Math.random()<.75 : Math.random()<.5, forest }); k++; } };
  want(isTouch?22:35, 2.8, 3.85, true);
  want(isTouch?8:14, 0, Math.PI*2, false);
  const trunks=[], cones=[], blobs=[], fruit=[];
  const PC=["#2f6b7a","#3e4f94","#5a4a9e","#2a5f6a","#4a6aa0"], BC=["#f2a7bb","#f6c1d0","#f4cd84","#e9a6ff","#c9a8ff"];
  spots.forEach((t,i)=>{ const { x, y, z, s } = t, rz=rnd(-.05,.05);
    trunks.push({ x, y, z, s, rz, ry:rnd(0,6) });
    if (t.pine) for(let k=0;k<3;k++) cones.push({ x, y:y+(1.1+k*.95)*s, z, s:(1-k*.24)*s, ry:rnd(0,6), rz, c:PC[(i+k)%PC.length] });
    else { const c=t.forest?["#9d7bd8","#c9a8ff","#7f74c4"][i%3]:BC[i%BC.length];
      blobs.push({ x, y:y+2.7*s, z, s, ry:rnd(0,6), c }); const o=loc(x,z,rnd(0,6),.6*s,.3*s); blobs.push({ x:o.x, y:y+2.15*s, z:o.z, s:.7*s, ry:rnd(0,6), c });
      if (t.forest) for(let k=0;k<5;k++){ const a=k/5*6.28+i; fruit.push({ x:x+Math.cos(a)*1.1*s, y:y+(2+Math.sin(a*2)*.5)*s, z:z+Math.sin(a)*1.1*s, c:k%2?"#ffd98a":"#ff9ed2" }); } }
    block(x,z,.42*s);
  });
  const trunkGeo=new THREE.CylinderGeometry(.14,.24,1.7,6); trunkGeo.translate(0,.85,0);
  const coneGeo=new THREE.ConeGeometry(1.35,2.3,7); coneGeo.translate(0,1.15,0);
  const blobGeo=jitter(new THREE.IcosahedronGeometry(1.15,1),.14);
  instanced(trunkGeo, M("#5b3b52"), trunks);
  const pines=instanced(coneGeo, M("#ffffff",{ emissive:"#141033", emissiveIntensity:.4 }), cones);
  const rounds=instanced(blobGeo, M("#ffffff",{ emissive:"#2a1530", emissiveIntensity:.3 }), blobs);
  [pines, rounds].forEach(m=>{ if (m) occluders.push(m); });
  glowPoints(fruit, .8);
  // glowing mushroom rings on the forest floor
  const stems=[], caps=[];
  for(let k=0,tries=0;k<(isTouch?22:36) && tries<600;tries++){ const a=rnd(2.8,3.85), r=rnd(ringR(a)+3, coastR(a)*.84), x=Math.sin(a)*r, z=Math.cos(a)*r;
    if (onRoad(x,z) || isSand(x,z) || colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.5)) continue;
    const n=2+(k%3), col=["#7ef0ff","#ff9ed2","#b9a2ff"][k%3];
    for(let j=0;j<n;j++){ const mx=x+rnd(-.6,.6), mz=z+rnd(-.6,.6), y=groundH(mx,mz), s=rnd(.6,1.4);
      stems.push({ x:mx, y:y+.22*s, z:mz, s }); caps.push({ x:mx, y:y+.42*s, z:mz, s, c:col }); } k++; }
  instanced(new THREE.CylinderGeometry(.08,.12,.45,6), M("#efe6ff"), stems, false);
  instanced(new THREE.SphereGeometry(.26,8,5,0,Math.PI*2,0,Math.PI/2), new THREE.MeshBasicMaterial({ color:"#ffffff" }), caps, false);
}
