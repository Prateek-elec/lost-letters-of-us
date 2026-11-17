// ⛏️ Our Block World: a little Minecraft-style corner (she loves Minecraft).
// Everything is drawn here in code (16×16 pixel tiles on one small canvas), nothing is taken from the real game.
// All the still blocks share ONE texture and are merged into ONE mesh, so the whole corner costs only a few draw calls.

/* ---------- the pixel tiles (one 8×4 sheet of 16×16 tiles) ---------- */
const TILE = { GRASS:0, GRASS_SIDE:1, DIRT:2, STONE:3, LOG:4, LOG_TOP:5, PLANK:6, LEAVES:7,
  CRAFT_TOP:8, CRAFT_SIDE:9, ORE_LOVE:10, ORE_GOLD:11, ORE_DIAMOND:12, WOOL:13, CREEPER:14, CREEPER_FACE:15,
  SHEEP_FACE:16, SKIN:17, BED:18, GLASS:19, TORCH:20, FLOWER_RED:21, FLOWER_YELLOW:22, COBBLE:23, DARK_PLANK:24, DOOR:25, LEAF_PINK:26 };
const bwAtlas = (()=>{
  const c=document.createElement("canvas"); c.width=128; c.height=64; const x=c.getContext("2d");
  let seed=20241023; const rr=()=>((seed=seed*16807%2147483647)/2147483647);
  const hsl=(h,s,l)=>`hsl(${h},${s}%,${Math.max(0,Math.min(100,l))}%)`;
  const tile=(t, fn)=>{ const ox=(t%8)*16, oy=Math.floor(t/8)*16; for(let j=0;j<16;j++) for(let i=0;i<16;i++){ x.fillStyle=fn(i,j); x.fillRect(ox+i,oy+j,1,1); } };
  const grass = ()=>hsl(96+rr()*14, 48, 38+rr()*14), dirt = ()=>hsl(28, 38, 30+rr()*12), stone = ()=>hsl(0, 0, 46+rr()*14);
  const ore = (h,s,l)=>(i,j)=>{ const k=(i*7+j*13)%17; return ((i>2&&i<6&&j>3&&j<6)||(i>9&&i<12&&j>1&&j<4)||(i>7&&i<10&&j>9&&j<13)||(i>2&&i<4&&j>10&&j<13)||(i>11&&i<14&&j>8&&j<11)) ? hsl(h,s,l+(k%3)*6) : stone(); };
  tile(TILE.GRASS, grass);
  tile(TILE.GRASS_SIDE, (i,j)=> j < 3 + ((i*5)%3===0?1:0) + ((i*3)%4===0?1:0) ? grass() : dirt());
  tile(TILE.DIRT, dirt);
  tile(TILE.STONE, stone);
  tile(TILE.LOG, (i,j)=> hsl(28, 35, (i%4===0 ? 18 : 27) + rr()*7));
  tile(TILE.LOG_TOP, (i,j)=>{ const d=Math.max(Math.abs(i-7.5),Math.abs(j-7.5)); return d>6.5 ? hsl(28,35,24) : hsl(36,45,(Math.floor(d)%2?42:50)+rr()*4); });
  const plank = l=>(i,j)=> (j%4===3 || (i===((Math.floor(j/4)%2)?5:12) )) ? hsl(30,40,l-12) : hsl(32,45,l+rr()*6);
  tile(TILE.PLANK, plank(46));
  tile(TILE.DARK_PLANK, plank(28));
  tile(TILE.LEAVES, ()=> rr()<.18 ? hsl(110,45,14) : hsl(110+rr()*16, 50, 26+rr()*14));
  tile(TILE.LEAF_PINK, ()=> rr()<.15 ? hsl(330,40,45) : hsl(330+rr()*15, 70, 72+rr()*12));
  tile(TILE.CRAFT_TOP, (i,j)=> (i===0||j===0||i===15||j===15) ? hsl(28,40,22) : (i===5||i===10||j===5||j===10) ? hsl(28,40,30) : hsl(32,45,48+rr()*6));
  tile(TILE.CRAFT_SIDE, (i,j)=>{ if (j<2) return hsl(28,40,22);
    if ((i===4 && j>3 && j<13) || (j===5 && i>2 && i<7)) return hsl(0,0,70);      // a little hammer
    if ((i===11 && j>4 && j<13) || (i>9 && i<14 && j===4)) return hsl(0,0,58);    // and a saw
    return plank(44)(i,j); });
  tile(TILE.ORE_LOVE, ore(335,85,62));
  tile(TILE.ORE_GOLD, ore(46,90,55));
  tile(TILE.ORE_DIAMOND, ore(176,85,60));
  tile(TILE.WOOL, (i,j)=> hsl(335, 80, 74 + ((i+j*3)%5===0 ? -8 : 0) + rr()*6));
  tile(TILE.CREEPER, ()=> { const r=rr(); return r<.12 ? hsl(110,25,78) : r<.4 ? hsl(110,55,30) : hsl(105,50,42+rr()*10); });
  { const face = ["........","........",".XX..XX.",".XX..XX.","p..XX..p","..XXXX..","..XXXX..","..X..X.."];   // 8×8, doubled up; little pink cheeks because he’s friendly
    tile(TILE.CREEPER_FACE, (i,j)=>{ const f=face[j>>1][i>>1]; return f==="X" ? hsl(0,0,6) : f==="p" ? hsl(340,80,70) : (rr()<.12 ? hsl(110,25,78) : hsl(105,50,40+rr()*10)); }); }
  { const face = ["WWWWWWWW","WWWWWWWW","ssssssss","sEwsswEs","ssssssss","sssppsss","ssssssss","ssssssss"];
    tile(TILE.SHEEP_FACE, (i,j)=>{ const f=face[j>>1][i>>1]; return f==="W" ? hsl(335,80,72+rr()*6) : f==="E" ? hsl(0,0,8) : f==="w" ? hsl(0,0,96) : f==="p" ? hsl(345,60,62) : hsl(30,40,72+rr()*5); }); }
  tile(TILE.SKIN, ()=> hsl(30,40,70+rr()*6));
  tile(TILE.BED, (i,j)=> j<5 ? (i===0||i===15||j===0 ? hsl(0,0,80) : hsl(0,0,96)) : (j===5 ? hsl(335,60,55) : hsl(335,75,62+((i+j)%4===0?-6:0))));
  tile(TILE.GLASS, (i,j)=> (i===0||j===0||i===15||j===15) ? hsl(200,25,85) : ((i-j===4||i-j===5||i-j===-6) && i>2 && i<13) ? hsl(200,60,92) : hsl(45,90,72));   // warm light inside
  tile(TILE.TORCH, (i,j)=> hsl(30,40,30+rr()*10));
  tile(TILE.FLOWER_RED, ()=> hsl(352,85,52+rr()*8));
  tile(TILE.FLOWER_YELLOW, ()=> hsl(50,95,55+rr()*8));
  tile(TILE.COBBLE, (i,j)=>{ const cell=((i>>2)+(j>>2)*3)%4; return ((i%4===0)||(j%4===0)) && rr()<.7 ? hsl(0,0,30) : hsl(0,0,44+cell*5+rr()*6); });
  tile(TILE.DOOR, (i,j)=> (j>2&&j<7&&i>3&&i<12) ? hsl(45,90,70) : (i===0||i===15||j===0||j===15||j===8) ? hsl(28,40,20) : hsl(30,40,30+rr()*5));
  const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.generateMipmaps=false;
  return { canvas:c, tex:t };
})();
// a touch of self-light so the pixel colours still read at night
const bwMat = new THREE.MeshStandardMaterial({ map:bwAtlas.tex, emissiveMap:bwAtlas.tex, emissive:"#ffffff", emissiveIntensity:.3, roughness:.95, metalness:0 });

// a box whose faces show tiles: tiles = a tile number, or { top, bottom, side, front, back, left, right }
const _bwM = new THREE.Matrix4(), _bwQ = new THREE.Quaternion(), _bwE = new THREE.Euler();
function bwBox(w,h,d, x,y,z, tiles, ry=0){
  const g = new THREE.BoxGeometry(w,h,d).toNonIndexed(), T = typeof tiles==="number" ? { side:tiles } : tiles;
  const faces = [T.right??T.side, T.left??T.side, T.top??T.side, T.bottom??T.side, T.front??T.side, T.back??T.side], uv = g.attributes.uv, e=.004;
  for (let f=0; f<6; f++){ const tl=faces[f], c=tl%8, r=Math.floor(tl/8);
    for (let v=f*6; v<f*6+6; v++){ uv.setXY(v, (c + e + uv.getX(v)*(1-2*e))/8, 1 - (r + 1 - e - uv.getY(v)*(1-2*e))/4); } }
  _bwE.set(0,ry,0); g.applyMatrix4(_bwM.compose(new THREE.Vector3(x,y,z), _bwQ.setFromEuler(_bwE), new THREE.Vector3(1,1,1))); return g;
}
function bwMerge(list){
  const n = list.reduce((s,g)=>s+g.attributes.position.count, 0), pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let k=0;
  list.forEach(g=>{ pos.set(g.attributes.position.array, k*3); nor.set(g.attributes.normal.array, k*3); uv.set(g.attributes.uv.array, k*2); k+=g.attributes.position.count; g.dispose(); });
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos,3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor,3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv,2)); geo.computeBoundingSphere(); return geo;
}

/* ---------- the corner itself (local grid: +z faces the ring road, 1 block = 1 m) ---------- */
const BW_Y = groundH(BW.x, BW.z), BW_TOP = .02;
const bwG = region(new THREE.Group(), BW.x, BW.z, 14); bwG.position.set(BW.x, BW_Y, BW.z); bwG.rotation.y = BW.a + Math.PI; scene.add(bwG);
bwG.updateMatrixWorld(true);
const bwWorld = (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(bwG.matrixWorld);
const bwBlock = (lx, lz, r) => { const p=bwWorld(lx, lz); block(p.x, p.z, r); };
{
  const parts = [], glow = [], cube = (gx, gy, gz, tiles) => parts.push(bwBox(1,1,1, gx, BW_TOP+.5+gy, gz, tiles));
  const GRASSB = { top:TILE.GRASS, side:TILE.GRASS_SIDE, bottom:TILE.DIRT };
  // the grass floor: a 13×13 slab of grass blocks
  for (let i=-6;i<=6;i++) for (let j=-6;j<=6;j++) parts.push(bwBox(1,.3,1, i, BW_TOP-.15, j, GRASSB));
  // a few raised blocks at the edges, like real terrain
  [[-6,4,1],[-6,5,2],[-5,5,1],[6,-1,1],[6,0,1],[-1,-6,1]].forEach(([i,j,h])=>{ for (let y=0;y<h;y++) cube(i,y,j, y===h-1 ? GRASSB : TILE.DIRT); bwBlock(i,j,.75); });

  // 🏠 the little house (5×5, oak planks with log corners, a door, glowing windows, a stepped roof)
  for (let y=0;y<3;y++) for (let i=-6;i<=-2;i++) for (let j=-6;j<=-2;j++){
    const edgeX = i===-6||i===-2, edgeZ = j===-6||j===-2; if (!edgeX && !edgeZ) continue;
    if (j===-2 && i===-4 && y<2) continue;                                              // the doorway
    const win = y===1 && ((edgeX && !edgeZ && j===-4) || (j===-6 && i===-4));
    cube(i,y,j, edgeX&&edgeZ ? { side:TILE.LOG, top:TILE.LOG_TOP, bottom:TILE.LOG_TOP } : win ? TILE.GLASS : TILE.PLANK);
  }
  for (let i=-7;i<=-1;i++) for (let j=-7;j<=-1;j++) parts.push(bwBox(1,.5,1, i, BW_TOP+3.25, j, TILE.DARK_PLANK));          // roof with an overhang
  for (let i=-6;i<=-2;i++) for (let j=-6;j<=-2;j++) parts.push(bwBox(1,.5,1, i, BW_TOP+3.75, j, TILE.DARK_PLANK));
  for (let i=-5;i<=-3;i++) for (let j=-5;j<=-3;j++) parts.push(bwBox(1,.5,1, i, BW_TOP+4.25, j, TILE.DARK_PLANK));
  parts.push(bwBox(1,.5,1, -4, BW_TOP+4.75, -4, TILE.DARK_PLANK));
  for (let i=-5;i<=-3;i++) for (let j=-5;j<=-3;j++) parts.push(bwBox(1,.06,1, i, BW_TOP+.03, j, TILE.PLANK));             // wooden floor
  parts.push(bwBox(1,.56,2, -5, BW_TOP+.28, -4.5, { top:TILE.BED, side:TILE.WOOL, bottom:TILE.PLANK }, Math.PI));        // a pink bed for two
  parts.push(bwBox(1,.56,1, -3, BW_TOP+.28, -5, { top:TILE.CRAFT_TOP, side:TILE.PLANK }));                               // bedside chest-ish box
  parts.push(bwBox(1,2,.1, -3.45, BW_TOP+1, -1.55, TILE.DOOR, -Math.PI/2.3));                                              // the door, swung open
  glow.push([-4, 1.4, -4, "#ffc27a", 3.4, .55], [-4, 1.6, -1.2, "#ffb36b", 2.2, .35]);
  bwBlock(-4, -4, 3.2);

  // 🌳 a blocky tree with pink blossom leaves
  for (let y=0;y<5;y++) cube(4, y, -4, { side:TILE.LOG, top:TILE.LOG_TOP, bottom:TILE.LOG_TOP });
  for (let y=3;y<=6;y++){ const R = y<5 ? 2 : 1;
    for (let i=-R;i<=R;i++) for (let j=-R;j<=R;j++){ if (Math.abs(i)===R && Math.abs(j)===R && (y===4 || y>=5 || (i+j)%2===0)) continue; if (i===0 && j===0 && y<5) continue;
      if (y===6 && Math.abs(i)+Math.abs(j)>1) continue; cube(4+i, y, -4+j, (i*3+j+y)%4===0 ? TILE.LEAVES : TILE.LEAF_PINK); } }
  bwBlock(4, -4, .8);

  // 🛠️ crafting table and a little cobblestone wall with torches
  cube(-4, 0, 2, { top:TILE.CRAFT_TOP, side:TILE.CRAFT_SIDE, bottom:TILE.PLANK }); bwBlock(-4, 2, .75);
  [[-5,1],[-6,1],[-6,0]].forEach(([i,j])=>{ cube(i,0,j, TILE.COBBLE); bwBlock(i,j,.7); });
  // 🔥 torches (a stick and a glowing tip; real Minecraft torches stand on blocks, ours stand on the grass)
  const torches = [[-6,6],[6,6],[-2.4,-1.3],[-6.1,-.05],[2.4,-2.6],[6,3.6]];
  torches.forEach(([i,j],k)=>{ const y = k===3 ? 1 : 0;
    parts.push(bwBox(.13,.62,.13, i, BW_TOP+y+.31, j, TILE.TORCH));
    glow.push([i, y+.72, j, "#ffcf6b", 1.7, .9]); });
  // 🌷 flowers
  [[-1,5,0],[1.5,5.6,1],[3,5,0],[-3,4.6,1],[2,-.6,0],[-1.2,1,1],[0.4,-1.8,0],[5.6,-.2,1],[-5.4,3.4,0],[1,3.2,1],[-2,6,0]].forEach(([i,j,c])=>{
    parts.push(bwBox(.06,.3,.06, i, BW_TOP+.15, j, TILE.LEAVES)); parts.push(bwBox(.2,.2,.2, i, BW_TOP+.38, j, c ? TILE.FLOWER_YELLOW : TILE.FLOWER_RED)); });

  const mesh = new THREE.Mesh(bwMerge(parts), bwMat); mesh.castShadow = mesh.receiveShadow = true; bwG.add(mesh);
  // the glowing torch tips + soft glows (sprites, not real lights: cheap on phones)
  const tipParts = torches.map(([i,j],k)=>new THREE.BoxGeometry(.15,.15,.15).toNonIndexed().translate(i, BW_TOP+(k===3?1:0)+.68, j));
  bwG.add(new THREE.Mesh(bwMerge(tipParts), new THREE.MeshBasicMaterial({ color:"#ffd36b" })));
  glow.forEach(([i,y,j,c,s,o])=>{ const l=glowLight(c, s, o); l.position.set(i, BW_TOP+y, j); bwG.add(l); });
}

// 🪧 the wooden sign
{
  const writeSign = (x,w,h) => { x.fillStyle="#9c7446"; x.fillRect(0,0,w,h); for(let k=0;k<8;k++){ x.fillStyle=`rgba(60,35,15,${.08+(k*37%10)/100})`; x.fillRect(0,k*20,w,2); }
    x.strokeStyle="#5a3d22"; x.lineWidth=10; x.strokeRect(5,5,w-10,h-10); x.fillStyle="#1f140c"; x.textAlign="center";
    GAME.blockworld.sign.forEach((s,k)=>{ let f=36; do { x.font=`700 ${f}px 'VT323', monospace`; f-=2; } while (x.measureText(s).width > w-36 && f>12); x.fillText(s, w/2, 50+k*40); }); };
  const tex = canvasTex(256, 160, writeSign);
  tex.magFilter = THREE.NearestFilter;
  const sg = new THREE.Group(); sg.position.set(-2.4, BW_TOP, 5.2); sg.rotation.y = .25; bwG.add(sg);
  const post = new THREE.Mesh(bwBox(.14,1.1,.14, 0,.55,0, TILE.LOG), bwMat); sg.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6,1,.1), [M("#7a5a36"),M("#7a5a36"),M("#7a5a36"),M("#7a5a36"), new THREE.MeshStandardMaterial({ map:tex, emissiveMap:tex, emissive:"#ffffff", emissiveIntensity:.35, roughness:.9 }), M("#7a5a36")]);
  board.position.y = 1.45; sg.add(board); shadowy(sg); bwBlock(-2.4, 5.2, .45);
  // the sign text uses the pixel font once it has loaded
  if (document.fonts) document.fonts.load("34px VT323").then(()=>{ const c=tex.image; writeSign(c.getContext("2d"), c.width, c.height); tex.needsUpdate = true; }).catch(()=>{});
}

/* ---------- ⛏️ the ore pile: tap a block 3 times to mine it. Something is hidden in the middle… ---------- */
const BW_PILE = { x:4, z:2 };
const oreBlocks = [];
{
  const layout = [ // [x, y, z, tile] around the pile centre; the diamond sits in the middle, covered on every side
    [-1,0,-1,TILE.STONE],[0,0,-1,TILE.ORE_LOVE],[1,0,-1,TILE.STONE],
    [-1,0, 0,TILE.ORE_GOLD],[0,0,0,TILE.ORE_DIAMOND],[1,0,0,TILE.ORE_LOVE],
    [-1,0, 1,TILE.STONE],[0,0,1,TILE.ORE_LOVE],[1,0,1,TILE.COBBLE],
    [0,1,0,TILE.STONE],[-1,1,1,TILE.ORE_LOVE],[1,1,-1,TILE.ORE_GOLD] ];
  layout.forEach(([i,y,j,tl])=>{
    const m = new THREE.Mesh(bwBox(1,1,1, 0,0,0, tl), bwMat); m.castShadow = m.receiveShadow = true;
    m.position.set(BW_PILE.x+i, BW_TOP+.5+y, BW_PILE.z+j); bwG.add(m);
    const b = { m, i, y, j, tile:tl, hits:0, shake:0, home:m.position.clone() };
    m.userData.onClick = () => mineHit(b); clickables.push(m); oreBlocks.push(b);
  });
  bwBlock(BW_PILE.x, BW_PILE.z, 2.2);
}
// flying bits when a block is hit
const bwDust = (()=>{ const N=48, m=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.12,.12), new THREE.MeshStandardMaterial({ roughness:.9, emissive:"#222222" }), N);
  m.frustumCulled = false; const c=new THREE.Color("#ffffff"); for(let k=0;k<N;k++) m.setColorAt(k, c); scene.add(m);
  return { m, list:Array.from({length:N}, ()=>({ p:new THREE.Vector3(), v:new THREE.Vector3(), life:0, rot:0 })), next:0 }; })();
const DUST_COLOR = { [TILE.STONE]:"#8f8f8f", [TILE.COBBLE]:"#7b7b7b", [TILE.ORE_LOVE]:"#ff7fb0", [TILE.ORE_GOLD]:"#f4cd4a", [TILE.ORE_DIAMOND]:"#6ff0e8" };
function dustAt(p, color, n){ const c=new THREE.Color(color);
  for (let k=0;k<n;k++){ const d=bwDust.list[bwDust.next], idx=bwDust.next; bwDust.next=(bwDust.next+1)%bwDust.list.length;
    d.p.copy(p).add(new THREE.Vector3(rnd(-.4,.4), rnd(-.3,.4), rnd(-.4,.4))); d.v.set(rnd(-2,2), rnd(1.5,4.2), rnd(-2,2)); d.life=rnd(.6,1.1); d.rot=rnd(0,6);
    bwDust.m.setColorAt(idx, k%3 ? c : c.clone().multiplyScalar(.7)); }
  bwDust.m.instanceColor.needsUpdate = true; }
const pileKey = (i,y,j) => oreBlocks.find(b=>b.i===i && b.y===y && b.j===j && b.m.visible);
const exposed = b => !pileKey(b.i+1,b.y,b.j) || !pileKey(b.i-1,b.y,b.j) || !pileKey(b.i,b.y,b.j+1) || !pileKey(b.i,b.y,b.j-1) || !pileKey(b.i,b.y+1,b.j);
let noteIdx = 0, gotDiamond = false, pileRegrow = false;
// the block to mine with the button: the closest one she can actually reach
function mineTarget(){ const me = bwG.worldToLocal(her.position.clone()); let best=null, bd=1e9;
  oreBlocks.forEach(b=>{ if (!b.m.visible || !exposed(b)) return; const d=Math.hypot(b.m.position.x-me.x, b.m.position.z-me.z) + b.y*.6; if (d<bd){ bd=d; best=b; } }); return best; }
function mineHit(b){
  if (!b || !b.m.visible || !playing || frozen) return;
  if (her.position.distanceTo(bwWorld(b.m.position.x, b.m.position.z)) > 7){ say("Walk up to the ore pile, then mine it ⛏️", 3000); chime(440); return; }
  if (!exposed(b)){ say("That one is buried! Mine the blocks around it first ⛏️", 3000); return; }
  initAudio(); if (actx) actx.resume();
  b.hits++; b.shake = .22; const wp = b.m.getWorldPosition(new THREE.Vector3());
  dustAt(wp, DUST_COLOR[b.tile], 6); crunch(b.hits);
  if (b.hits < 3) return;
  // broken!
  b.m.visible = false; const ci = clickables.indexOf(b.m); if (ci>=0) clickables.splice(ci,1);
  dustAt(wp, DUST_COLOR[b.tile], 16); burst(wp.clone().add(new THREE.Vector3(0,.4,0)), 10, DUST_COLOR[b.tile], false, .6);
  if (b.tile === TILE.ORE_DIAMOND){
    gotDiamond = true; pileRegrow = true; toast(GAME.blockworld.diamond, 7000); hearts(30); launchFireworks(4);
    burst(wp, 40, "#6ff0e8", false, 1.6); chime(1319); chime(1568,.12); chime(2093,.25); achieve("diamond");
  } else {
    const notes = GAME.blockworld.notes; toast("⛏️ " + notes[noteIdx++ % notes.length], 4800); chime(988 + (noteIdx%5)*80);
  }
}
function crunch(k){
  noiseSfx(.13, 1400 - k*250, 500, .22, "lowpass"); thud(1);
}
// short bursts of filtered noise: block crunches, the creeper’s hiss, the pop
function noiseSfx(dur, f0, f1, vol, type="bandpass", rise=false){
  if (!actx) return; try {
    const len=Math.floor(dur*actx.sampleRate), buf=actx.createBuffer(1,len,actx.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const s=actx.createBufferSource(); s.buffer=buf; const fl=actx.createBiquadFilter(); fl.type=type; const n=actx.currentTime;
    fl.frequency.setValueAtTime(f0, n); fl.frequency.exponentialRampToValueAtTime(Math.max(40,f1), n+dur);
    const g=actx.createGain(); if (rise){ g.gain.setValueAtTime(.001, n); g.gain.exponentialRampToValueAtTime(vol, n+dur*.95); g.gain.linearRampToValueAtTime(0, n+dur); }
    else { g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.001, n+dur); }
    s.connect(fl); fl.connect(g); g.connect(actx.destination); s.start(); s.stop(n+dur+.05); return s; } catch(e){}
}

/* ---------- 💥 the friendly Creeper: he hisses… and pops into hearts ---------- */
const creeperMat = bwMat.clone();
function blockyLegs(g, mat, w, h, xs, zs, tile){
  return xs.flatMap(x=>zs.map(z=>{ const p=new THREE.Group(); p.position.set(x,h,z); const m=new THREE.Mesh(bwBox(w,h,w, 0,-h/2,0, tile), mat); m.castShadow=true; p.add(m); g.add(p); return p; }));
}
const creeper = (()=>{
  const g = new THREE.Group(), s=.86;
  const legs = blockyLegs(g, creeperMat, .26, .4, [-.13,.13], [-.15,.15], TILE.CREEPER);
  const body = new THREE.Mesh(bwMerge([ bwBox(.5,.78,.3, 0,.4+.39,0, TILE.CREEPER), bwBox(.56,.56,.56, 0,1.18+.28,0, { side:TILE.CREEPER, front:TILE.CREEPER_FACE }) ]), creeperMat);
  body.castShadow = true; g.add(body); g.scale.setScalar(s); bwG.add(g);
  body.userData.onClick = () => { if (creeper.state==="walk" || creeper.state==="idle") creeperHiss(); }; clickables.push(body);
  return { g, body, legs, state:"idle", t:0, cool:2, target:new THREE.Vector3(0,0,2), pos:new THREE.Vector3(0,0,2), yaw:0, hiss:null };
})();
// 🐑 the pink sheep (pink sheep really exist in Minecraft, and they’re very rare)
const sheep = (()=>{
  const g = new THREE.Group();
  const legs = blockyLegs(g, bwMat, .17, .42, [-.22,.22], [-.36,.36], TILE.SKIN);
  const body = new THREE.Mesh(bwMerge([ bwBox(.72,.58,1.02, 0,.42+.29,0, TILE.WOOL), bwBox(.42,.42,.42, 0,.92,.62, { side:TILE.SKIN, front:TILE.SHEEP_FACE, top:TILE.WOOL }) ]), bwMat);
  body.castShadow = true; g.add(body); bwG.add(g);
  body.userData.onClick = () => sheepHello(true); clickables.push(body);
  return { g, body, legs, state:"idle", t:0, cool:0, target:new THREE.Vector3(1,0,0), pos:new THREE.Vector3(1.5,0,0), yaw:2, hop:0, met:false };
})();
// where they like to wander (the open middle of the corner)
const roam = () => new THREE.Vector3(rnd(-1.2, 2.2), 0, rnd(-.6, 4.4));
function creeperHiss(){ const c=creeper; if (c.state!=="walk" && c.state!=="idle") return; initAudio(); if (actx) actx.resume();
  c.state="hiss"; c.t=0; c.hiss = noiseSfx(1.5, 2200, 5200, .16, "bandpass", true); }
function creeperPop(){ const c=creeper, wp=c.body.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.9,0));
  c.state="gone"; c.t=0; c.g.visible=false; creeperMat.emissiveIntensity=.3;
  burst(wp, 46, "#ff5f8f", true, 2); burst(wp, 20, "#7fdc6a", false, 1.4); dustAt(wp, "#5fb04a", 18); hearts(20);
  thud(6); noiseSfx(.6, 1600, 120, .35, "lowpass"); chime(784,.1); chime(988,.22); chime(1319,.34);
  toast(GAME.blockworld.creeper, 6000); achieve("creeper"); }
function sheepHello(clicked){ const s=sheep; if (s.cool>0 && !clicked) return; s.cool=7; s.hop=.5;
  initAudio(); if (actx) actx.resume(); note(370,0,.32,.05,"square"); note(340,.16,.42,.05,"square"); note(320,.32,.5,.04,"square");
  burst(s.body.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.2,0)), 16, "#ff9ec0", true, .9);
  if (!s.met || clicked){ s.met=true; toast(GAME.blockworld.sheep, 5500); achieve("sheep"); } }
function walkMob(m, dt, t, speed){
  const d = m.target.clone().sub(m.pos); d.y=0; const L=d.length();
  if (m.state==="walk"){
    if (L < .15){ m.state="idle"; m.t=rnd(1.5,4); }
    else { m.pos.addScaledVector(d, Math.min(1, speed*dt/L)); const want=Math.atan2(d.x,d.z); let dy=want-m.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); m.yaw += dy*Math.min(1,dt*5); }
  } else if (m.state==="idle"){ m.t-=dt; if (m.t<=0){ m.target.copy(roam()); m.state="walk"; } }
  const sw = m.state==="walk" ? Math.sin(t*9)*.55 : 0;
  m.legs.forEach((l,k)=>{ l.rotation.x = (k===0||k===3 ? 1 : -1) * sw; });
  m.g.position.set(m.pos.x, BW_TOP, m.pos.z); m.g.rotation.y = m.yaw;
}

/* ---------- per frame ---------- */
let bwWelcomed = false;
const _bwMe = new THREE.Vector3();
function updateBlockworld(dt, t){
  const dB = Math.hypot(her.position.x-BW.x, her.position.z-BW.z);
  if (pileRegrow && dB > 28){ pileRegrow=false; oreBlocks.forEach(b=>{ b.hits=0; b.m.visible=true; if (!clickables.includes(b.m)) clickables.push(b.m); }); }
  if (!bwG.visible) return;
  if (!bwWelcomed && playing && dB < 8.5){ bwWelcomed=true; say(GAME.blockworld.welcome, 7000); achieve("world"); chime(659); chime(784,.12); chime(988,.24); }
  // flying bits
  let any=false;
  bwDust.list.forEach((d,k)=>{ if (d.life<=0) return; any=true; d.life-=dt; d.v.y-=11*dt; d.p.addScaledVector(d.v, dt); if (d.p.y < BW_Y+.05){ d.p.y=BW_Y+.05; d.v.multiplyScalar(.4); d.v.y=Math.abs(d.v.y)*.3; }
    _wo.position.copy(d.p); _wo.rotation.set(d.rot+t*3, d.rot, 0); _wo.scale.setScalar(Math.max(0, Math.min(1, d.life*2))); _wo.updateMatrix(); bwDust.m.setMatrixAt(k, _wo.matrix); });
  if (any || bwDust.wasAny){ bwDust.m.instanceMatrix.needsUpdate = true; } bwDust.wasAny = any;
  oreBlocks.forEach(b=>{ if (b.shake>0){ b.shake-=dt; const k=b.shake*.35; b.m.position.set(b.home.x+rnd(-k,k), b.home.y+rnd(-k,k)*.5, b.home.z+rnd(-k,k)); b.m.scale.setScalar(1-b.shake*.3); if (b.shake<=0){ b.m.position.copy(b.home); b.m.scale.setScalar(1); } } });

  const me = bwG.worldToLocal(_bwMe.copy(her.position));
  // the creeper
  const c = creeper; c.cool -= dt;
  if (c.state==="walk" || c.state==="idle"){
    walkMob(c, dt, t, .75); creeperMat.emissiveIntensity=.3; c.g.scale.setScalar(.86);
    if (playing && !frozen && c.cool<=0 && Math.hypot(me.x-c.pos.x, me.z-c.pos.z) < (driving?3.2:2.4)) creeperHiss();
  } else if (c.state==="hiss"){
    c.t += dt; const d=Math.hypot(me.x-c.pos.x, me.z-c.pos.z);
    let dy=Math.atan2(me.x-c.pos.x, me.z-c.pos.z)-c.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); c.yaw+=dy*Math.min(1,dt*6); c.g.rotation.y=c.yaw;
    const flick = Math.sin(c.t*c.t*14) > 0, sw = 1 + c.t*.12 + (flick?.04:0);
    c.g.scale.set(.86*sw, .86*(1+c.t*.05), .86*sw); creeperMat.emissiveIntensity = flick ? .3+c.t*.9 : .3;
    if (d > 5.5 && c.t < 1.3){ c.state="idle"; c.t=1.5; c.cool=3; try { c.hiss && c.hiss.stop(); } catch(e){} }   // she walked away: he calms down
    else if (c.t >= 1.5) creeperPop();
  } else if (c.state==="gone"){
    c.t += dt; if (c.t > 7){ c.pos.copy(roam()); c.target.copy(c.pos); c.state="idle"; c.t=2; c.cool=4; c.g.visible=true; c.g.scale.setScalar(.01);
      burst(bwWorld(c.pos.x, c.pos.z).setY(BW_Y+1), 12, "#7fdc6a", false, .8); c.grow=0; }
  }
  if (c.grow !== undefined && c.grow < 1 && c.state!=="hiss"){ c.grow=Math.min(1, c.grow+dt*2.5); c.g.scale.setScalar(.86*c.grow); }
  // the sheep
  const s = sheep; s.cool -= dt; walkMob(s, dt, t, .55);
  if (s.hop>0){ s.hop-=dt; s.g.position.y = BW_TOP + Math.sin((.5-s.hop)/.5*Math.PI)*.35; }
  if (playing && !frozen && Math.hypot(me.x-s.pos.x, me.z-s.pos.z) < 2) sheepHello(false);
}

// spots used by the map, the interact button and the moments
const BW_SPOT = bwWorld(0, 5.6), BW_PILE_W = bwWorld(BW_PILE.x - 2.1, BW_PILE.z + .3), BW_TABLE = bwWorld(-4, 3.2), BW_DOOR = bwWorld(-4, -.7);

/* ---------- 🛠️ the crafting table ---------- */
let craftGrid = Array(9).fill(null), craftSel = "wool", craftedOnce = false;
const HEART_RECIPE = [1,0,1, 1,1,1, 0,1,0];
let bwAtlasURL = null;
const tileCss = tl => `background-image:url(${bwAtlasURL || (bwAtlasURL = bwAtlas.canvas.toDataURL())});background-size:800% 400%;background-position:${(tl%8)/7*100}% ${Math.floor(tl/8)/3*100}%`;
function openCrafting(){
  if (frozen || !playing) return; chime(659);
  const item = it => it==="wool" ? TILE.WOOL : TILE.ORE_DIAMOND;
  openPanel("craft", `<p class="chapter">Crafting Table</p><h3>Craft something for us</h3>
    <div class="mcwin">
      <div class="mcgrid">${craftGrid.map((_,k)=>`<button type="button" class="mcslot${HEART_RECIPE[k]?" ghost":""}" data-k="${k}" aria-label="Crafting slot ${k+1}"></button>`).join("")}</div>
      <div class="mcarrow" aria-hidden="true">➜</div>
      <button type="button" class="mcslot mcout" id="mcOut" aria-label="Result"></button>
    </div>
    <p class="mclabel">Your items</p>
    <div class="mcinv">
      <button type="button" class="mcslot mcitem" data-it="wool" aria-label="Pink wool"><i style="${tileCss(TILE.WOOL)}"></i><small>64</small></button>
      ${gotDiamond ? `<button type="button" class="mcslot mcitem" data-it="diamond" aria-label="Diamond"><i style="${tileCss(TILE.ORE_DIAMOND)}"></i><small>1</small></button>` : `<span class="mcslot mclocked" title="Mine the ore pile to find this">?</span>`}
    </div>
    <p class="mchint">Pick an item, then tap the squares. Hint: hearts are made of pink wool… in the shape of a heart.${gotDiamond ? " And a diamond fits perfectly in the middle 💎" : " (Something shiny is hiding in the ore pile ⛏️)"}</p>`);
  const box=$("#pbox"), out=$("#mcOut");
  const draw = () => {
    box.querySelectorAll(".mcgrid .mcslot").forEach(b=>{ const it=craftGrid[+b.dataset.k]; b.innerHTML = it ? `<i style="${tileCss(item(it))}"></i>` : ""; b.classList.toggle("filled", !!it); });
    box.querySelectorAll(".mcitem").forEach(b=>b.classList.toggle("on", b.dataset.it===craftSel));
    const ok = craftGrid.every((it,k)=> HEART_RECIPE[k] ? (it==="wool" || (k===4 && it==="diamond")) : !it);
    const dia = ok && craftGrid[4]==="diamond";
    out.innerHTML = ok ? `<span class="mcheart">${dia?"💎":"💗"}</span>` : ""; out.classList.toggle("ready", ok); out.dataset.dia = dia ? 1 : "";
  };
  box.querySelectorAll(".mcitem").forEach(b=>b.onclick=()=>{ craftSel=b.dataset.it; chime(880); draw(); });
  box.querySelectorAll(".mcgrid .mcslot").forEach(b=>b.onclick=()=>{ const k=+b.dataset.k;
    if (craftGrid[k]===craftSel) craftGrid[k]=null; else { if (craftSel==="diamond") craftGrid=craftGrid.map(v=>v==="diamond"?null:v); craftGrid[k]=craftSel; }
    note(520+k*40, 0, .12, .06, "square"); draw(); });
  out.onclick = () => { if (!out.classList.contains("ready")) return; const dia=!!out.dataset.dia;
    craftGrid = Array(9).fill(null); closePanel(); craftedOnce = true;
    toast(dia ? GAME.blockworld.craftedDiamond : GAME.blockworld.crafted, 6500); hearts(dia?45:25); chime(784); chime(988,.12); chime(1319,.24); if (dia) chime(1568,.36);
    burst(BW_TABLE.clone().setY(BW_Y+1.5), dia?40:26, dia?"#6ff0e8":"#ff5f8f", true, 1.2); achieve("craft"); if (dia){ achieve("craftdia"); launchFireworks(5); } };
  draw();
}
function setRespawn(){
  chime(523); chime(659,.15); chime(784,.3); toast(GAME.blockworld.bed, 6000);
  burst(bwWorld(-5, -4.5).setY(BW_Y+1), 20, "#ff9ec0", true, .8); achieve("home");
}
