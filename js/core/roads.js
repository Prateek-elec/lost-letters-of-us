// Placement helpers and the road network.

/* ============================ HELPERS ============================ */
const P = (a, r) => new THREE.Vector3(Math.sin(a)*r, 0, Math.cos(a)*r);
function place(obj, x, z, yOff=0){ obj.position.set(x, groundH(x,z)+yOff, z); scene.add(obj); return obj; }
const colliders = []; // {x,z,r}
function block(x,z,r,ref){ colliders.push({x,z,r,ref}); }
// far-away areas are hidden to keep phones smooth (fog hides them anyway)
const regions = []; // {g, x, z, r}
function region(g, x, z, r){ regions.push({ g, x, z, r }); return g; }

/* ============================ ROADS ============================ */
// Smooth roads tie the bigger island together. The car is a bit faster on them.
// roadMask is a 1 m grid that remembers where the roads are (grass and trees avoid it).
const MASK_N = 170, roadMask = new Uint8Array(MASK_N*MASK_N);
const maskI = (x,z) => { const i=Math.floor(x+MASK_N/2), j=Math.floor(z+MASK_N/2); return (i<0||j<0||i>=MASK_N||j>=MASK_N) ? -1 : j*MASK_N+i; };
function onRoad(x,z){ const k=maskI(x,z); return k>=0 && roadMask[k]===1; }
function markRoad(x,z,rad){ for(let i=-Math.ceil(rad);i<=rad;i++) for(let j=-Math.ceil(rad);j<=rad;j++){ if(i*i+j*j>rad*rad) continue; const k=maskI(x+i,z+j); if(k>=0) roadMask[k]=1; } }
const roadTex = (()=>{ const c=document.createElement("canvas"); c.width=64; c.height=256; const x=c.getContext("2d");
  x.fillStyle="#3b3463"; x.fillRect(0,0,64,256);
  for(let i=0;i<260;i++){ x.fillStyle=`rgba(${Math.random()<.5?"255,220,240":"20,16,50"},${Math.random()*.12})`; x.fillRect(Math.random()*64,Math.random()*256,2,2); }
  x.fillStyle="#f3e2d2"; x.fillRect(3,0,3,256); x.fillRect(58,0,3,256);
  x.fillStyle="#f4cd84"; x.fillRect(30,20,4,90); x.fillRect(30,148,4,90);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; })();
const roadMat = new THREE.MeshStandardMaterial({ map:roadTex, roughness:.85, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4 });
const roadLines = []; // kept for the island map
function road(pts, { closed=false, width=4, heightAt=groundH } = {}){
  const curve = new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p.x,0,p.z)), closed, "centripetal");
  const L = curve.getLength(), n = Math.max(8, Math.ceil(L/1.1)), pos=[], uv=[], idx=[], line=[];
  for(let i=0;i<=n;i++){
    const t=i/n, p=curve.getPointAt(t), tg=curve.getTangentAt(t), nx=tg.z, nz=-tg.x, nl=Math.hypot(nx,nz)||1;
    [-1,1].forEach(s=>{ const x=p.x+nx/nl*s*width/2, z=p.z+nz/nl*s*width/2; pos.push(x, heightAt(x,z)+.07, z); uv.push(s<0?0:1, t*L/7); });
    markRoad(p.x, p.z, width/2+.6); line.push([p.x,p.z]);
    if (i<n) idx.push(i*2, i*2+1, i*2+2, i*2+1, i*2+3, i*2+2);
  }
  const g=new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos,3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();
  const m=new THREE.Mesh(g, roadMat); m.receiveShadow=true; scene.add(m); roadLines.push(line); return { curve, mesh:m };
}
const ring = (a, r) => PA(a, r===undefined ? ringR(a) : r);
// the moonlit ring road around the old meadow
road(Array.from({length:72}, (_,k)=>ring(k/72*Math.PI*2)), { closed:true });
// spokes out to every new area
road([ring(.9), ring(.9,37), ring(.9,HILL.r), ring(.9,49), ring(.9,coastR(.9)*.83)]);                                  // over Stargazer Hill
road([ring(2.3), ring(2.3,LAGOON.d-BRIDGE.half+.3)]);                                                                  // to the lagoon bridge (it lands on the beach)
road([ring(3.3,20), ring(3.3), ring(3.28,FOREST.r), ring(3.45,43), ring(3.7,48), ring(3.95,coastR(3.95)*.82)]);        // through Firefly Forest to the Beach Picture
road([ring(.42), ring(.42,LANT.r-6.5)]);                                                                             // to Lantern Meadow
road([ring(1.62), ring(1.62,FALLS.d-8.2)]);                                                                        // to the bench at Whispering Falls
road([ring(4.6), ring(4.6,VILLAGE.r-6.5)]);                                                                          // into the Fairy Village
road([ring(4.6,VILLAGE.r+6.5), ring(4.75,50), ring(5.1,coastR(5.1)*.8)]);                                              // village to the Lighthouses
road([ring(0,20), ring(0), ring(6.1,40), ring(6.0,PIER.u0+.5)]);                                                      // meadow to the pier
road([ring(5.34), ring(5.34,BW.r-8)]);                                                                              // to Our Block World
markRoad(VILLAGE.x, VILLAGE.z, 6.8); markRoad(LANT.x, LANT.z, 3.4);                                                    // keep grass off the plaza and the picnic blanket
markRoad(BW.x, BW.z, 10.5);                                                                                            // …and off the block world

function jitter(geo, amt){
  const p=geo.attributes.position, v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i);
    const h=Math.sin(Math.round(v.x*100)*12.9898+Math.round(v.y*100)*78.233+Math.round(v.z*100)*37.719)*43758.5453, r=(h-Math.floor(h))-.5;
    p.setXYZ(i, v.x+r*amt, v.y+r*amt*.6, v.z-r*amt); }
  geo.computeVertexNormals(); return geo;
}
