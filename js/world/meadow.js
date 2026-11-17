// Heart Meadow: gallery board, jukebox and dance floor.

/* ============================ BIGGER WORLD: ZONES ============================ */
const zr = (a, k) => coastR0(a) * k; // zones stay where they were on the original (meadow) island
const ZONES = {
  gallery:   P(.95, zr(.95,.72)),
  jukebox:   P(2.2, zr(2.2,.7)),
  fireworks: P(2.62, zr(2.62,.6)),
  map:       P(4.6, zr(4.6,.68)),
};
const faceCenter = v => Math.atan2(-v.x, -v.z);
const clickables = [];
function canvasTex(w, h, draw){ const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d"); draw(x,w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function roundRect(x, X, Y, W, H, r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); }
const SERIF = "'Cormorant Garamond', Georgia, serif", HAND = "'Caveat', 'Segoe Print', cursive";

/* ---------- dummy photos ---------- */
const THEMES = [["#ffb199","#ff6f91","sea"],["#2b2163","#c06c84","city"],["#a1c4fd","#e0f0ff","mount"],["#0d0b26","#4b3b8f","stars"],["#ffd194","#d1913c","cafe"],
  ["#89f7fe","#66a6ff","sea"],["#f6d365","#fda085","hills"],["#30cfd0","#330867","city"],["#fbc2eb","#a6c1ee","garden"],["#5b6476","#2b2f3a","rain"],["#ff9a9e","#fecfef","hills"],["#1e3c72","#6a5acd","stars"]];
function dummyPhoto(i, title){
  const c=document.createElement("canvas"); c.width=640; c.height=420; const x=c.getContext("2d");
  const [a,b,type]=THEMES[i%THEMES.length];
  const g=x.createLinearGradient(0,0,0,420); g.addColorStop(0,a); g.addColorStop(1,b); x.fillStyle=g; x.fillRect(0,0,640,420);
  const night = type==="stars"||type==="city"||type==="rain";
  x.fillStyle = night ? "rgba(255,246,220,.95)" : "rgba(255,250,235,.9)"; x.beginPath(); x.arc(470+((i*37)%90),95,night?34:46,0,7); x.fill();
  if (night){ x.fillStyle="#fff"; for(let s=0;s<70;s++){ x.globalAlpha=Math.random()*.8+.2; x.fillRect((s*97+i*31)%640,(s*53)%230,2,2);} x.globalAlpha=1; }
  x.save();
  if (type==="sea"){ x.fillStyle="#2f6fa5"; x.fillRect(0,270,640,150); x.strokeStyle="rgba(255,255,255,.55)"; x.lineWidth=3; for(let r=0;r<5;r++){ x.beginPath(); for(let k=0;k<=640;k+=10) x.lineTo(k,290+r*24+Math.sin(k/28+r)*5); x.stroke(); } x.fillStyle="#f1d9a8"; x.fillRect(0,385,640,35); }
  else if (type==="hills"||type==="garden"){ x.fillStyle=type==="garden"?"#5d9b6d":"#7d6aa8"; x.beginPath(); x.moveTo(0,420); x.quadraticCurveTo(160,230,330,320); x.quadraticCurveTo(480,250,640,330); x.lineTo(640,420); x.fill();
    if (type==="garden") for(let f=0;f<60;f++){ x.fillStyle=["#ff8fb0","#fff","#f4cd84","#c9a8ff"][f%4]; x.beginPath(); x.arc((f*53)%640, 340+(f*29)%80, 5, 0, 7); x.fill(); } }
  else if (type==="city"){ for(let k=0;k<16;k++){ const w=36+(k*13)%30, h=90+(k*47)%150, X=k*42-10; x.fillStyle="#1d1838"; x.fillRect(X,420-h-40,w,h+40);
      x.fillStyle="#ffd98a"; for(let wy=420-h-30; wy<390; wy+=18) for(let wx=X+6; wx<X+w-6; wx+=12) if(((wx+wy+k)%5)<2) x.fillRect(wx,wy,5,8); } }
  else if (type==="mount"){ x.fillStyle="#6a6fa8"; x.beginPath(); x.moveTo(-40,420); x.lineTo(180,150); x.lineTo(380,420); x.fill(); x.fillStyle="#555b96"; x.beginPath(); x.moveTo(250,420); x.lineTo(470,180); x.lineTo(700,420); x.fill();
    x.fillStyle="#fff"; x.beginPath(); x.moveTo(180,150); x.lineTo(150,195); x.lineTo(210,195); x.fill(); x.beginPath(); x.moveTo(470,180); x.lineTo(440,220); x.lineTo(500,220); x.fill(); }
  else if (type==="cafe"){ x.fillStyle="#7a4b3a"; x.fillRect(0,300,640,120); x.fillStyle="#f8f0e6"; [[220,280],[400,285]].forEach(([X,Y])=>{ x.fillRect(X,Y,50,40); x.beginPath(); x.arc(X+56,Y+18,10,0,7); x.strokeStyle="#f8f0e6"; x.lineWidth=5; x.stroke(); }); }
  else if (type==="stars"){ x.fillStyle="#191540"; x.beginPath(); x.moveTo(0,420); x.quadraticCurveTo(320,300,640,400); x.lineTo(640,420); x.fill(); }
  else if (type==="rain"){ x.strokeStyle="rgba(200,220,255,.5)"; x.lineWidth=2; for(let r=0;r<90;r++){ const X=(r*71)%660, Y=(r*43)%420; x.beginPath(); x.moveTo(X,Y); x.lineTo(X-8,Y+22); x.stroke(); } x.fillStyle="#22283a"; x.fillRect(0,360,640,60); }
  x.restore();
  // the two of us
  const cx=300+((i*41)%60);
  [[cx-22,"#2b2340"],[cx+22,"#3a2b4f"]].forEach(([X,col],k)=>{ x.fillStyle=col; x.beginPath(); x.arc(X,322,15,0,7); x.fill(); x.beginPath(); x.moveTo(X-18,400); x.lineTo(X-12,340); x.lineTo(X+12,340); x.lineTo(X+18,400); x.fill(); });
  x.strokeStyle="#2b2340"; x.lineWidth=6; x.beginPath(); x.moveTo(cx-10,360); x.lineTo(cx+10,360); x.stroke();
  x.fillStyle="#ff5f8f"; x.save(); x.translate(cx,290); x.scale(1.6,1.6); x.beginPath(); x.moveTo(0,11); x.bezierCurveTo(-14,1,-12,-11,-5,-11); x.bezierCurveTo(-2,-11,0,-8,0,-6); x.bezierCurveTo(0,-8,2,-11,5,-11); x.bezierCurveTo(12,-11,14,1,0,11); x.fill(); x.restore();
  x.fillStyle="rgba(28,24,56,.55)"; x.fillRect(0,0,640,44); x.fillStyle="#fff"; x.font=`600 24px ${SERIF}`; x.fillText(title || ("Moment "+(i+1)), 16, 30);
  x.font=`22px ${HAND}`; x.textAlign="right"; x.fillText("your photo goes here", 624, 30);
  return c;
}
function photoSource(item, i){
  if (item.photo){ const img=new Image(); img.src=item.photo; return { url:item.photo, img }; }
  const c=dummyPhoto(i, item.title); return { url:c.toDataURL("image/jpeg",.85), canvas:c };
}
const galPhotos = GAME.gallery.map((g,i)=>photoSource(g,i));
// real photos are framed for the wide board: the WHOLE photo is shown, centred on a soft blurred copy of itself
// (so tall/portrait photos aren't cropped or stretched)
const galTex = galPhotos.map(p=>{ if (p.canvas) return new THREE.CanvasTexture(p.canvas); const t=new THREE.Texture(p.img);
  p.img.onload=()=>{ const im=p.img, W=1024, H=Math.round(1024*3.66/5.6), c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
    const cover=Math.max(W/im.width, H/im.height), fit=Math.min(W/im.width, H/im.height);
    x.filter="blur(18px) brightness(.55)"; x.drawImage(im, (W-im.width*cover)/2, (H-im.height*cover)/2, im.width*cover, im.height*cover); x.filter="none";
    const w=im.width*fit, h=im.height*fit; x.shadowColor="rgba(0,0,0,.5)"; x.shadowBlur=24; x.drawImage(im, (W-w)/2, (H-h)/2, w, h);
    t.image=c; t.needsUpdate=true; }; return t; });
const placePhotos = GAME.places.map((pl,i)=>photoSource({ title:pl.name, photo:pl.photo }, i+3));
let galIdx = 0;

/* ---------- 3D gallery ---------- */
const galG = new THREE.Group(); galG.position.set(ZONES.gallery.x, groundH(ZONES.gallery.x, ZONES.gallery.z), ZONES.gallery.z); galG.rotation.y = faceCenter(ZONES.gallery); scene.add(galG);
let galScreen, galCaption, galThumbs=[];
{
  const wood=M("#e88aa6"), cream=M("#fff3e6");
  [-3.1,3.1].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.32,5.6,.32),wood); p.position.set(x,2.8,0); galG.add(p); });
  const top=new THREE.Mesh(new THREE.BoxGeometry(6.6,.9,.3),wood); top.position.set(0,5.25,0); galG.add(top);
  const titleT=canvasTex(1024,128,(x,w,h)=>{ x.fillStyle="#c96a88"; x.fillRect(0,0,w,h); x.fillStyle="#fff3e6"; x.font=`600 78px ${SERIF}`; x.textAlign="center"; x.fillText("Our Moments", w/2, 92); });
  const tm=new THREE.Mesh(new THREE.PlaneGeometry(6.4,.8), new THREE.MeshBasicMaterial({map:titleT})); tm.position.set(0,5.25,.16); galG.add(tm);
  const back=new THREE.Mesh(new THREE.BoxGeometry(6.0,3.9,.16),M("#2b2340")); back.position.set(0,2.65,-.02); galG.add(back);
  galScreen=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.66), new THREE.MeshBasicMaterial({map:galTex[0]})); galScreen.position.set(0,2.65,.08); galG.add(galScreen);
  galCaption=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.42), new THREE.MeshBasicMaterial({transparent:true})); galCaption.position.set(0,4.55,.17); galG.add(galCaption);
  // arrows
  [-1,1].forEach(s=>{ const t=canvasTex(128,128,(x,w,h)=>{ x.fillStyle="#b45cf0"; roundRect(x,4,4,120,120,22); x.fill(); x.fillStyle="#fff"; x.save(); x.translate(64,64); x.scale(s,1); x.beginPath(); x.moveTo(-30,0); x.lineTo(4,-30); x.lineTo(4,-12); x.lineTo(34,-12); x.lineTo(34,12); x.lineTo(4,12); x.lineTo(4,30); x.fill(); x.restore(); });
    const a=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.25), [M("#9a45d8"),M("#9a45d8"),M("#9a45d8"),M("#9a45d8"),new THREE.MeshBasicMaterial({map:t}),M("#9a45d8")]);
    a.position.set(s*3.35,2.9,.25); galG.add(a); a.userData.onClick=()=>galNav(s); clickables.push(a); });
  // thumbnails tower
  const tower=new THREE.Group(); tower.position.set(4.6,0,-.4); tower.rotation.y=-.25; galG.add(tower);
  [-.75,.75].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.18,4.8,.18),wood); p.position.set(x,2.4,0); tower.add(p); });
  for(let k=0;k<4;k++){ const f=new THREE.Mesh(new THREE.BoxGeometry(1.4,.95,.08),cream); f.position.set(0,4.1-k*1.12,0); tower.add(f);
    const th=new THREE.Mesh(new THREE.PlaneGeometry(1.26,.82), new THREE.MeshBasicMaterial({map:galTex[(k+1)%galTex.length]})); th.position.set(0,4.1-k*1.12,.05); tower.add(th); galThumbs.push(th); }
  // chalkboard sign
  const sign=new THREE.Group(); sign.position.set(-4.4,0,.6); sign.rotation.y=.35; galG.add(sign);
  const chalk=canvasTex(256,320,(x,w,h)=>{ x.fillStyle="#2a2440"; x.fillRect(0,0,w,h); x.strokeStyle="#c96a88"; x.lineWidth=14; x.strokeRect(0,0,w,h);
    x.fillStyle="#d9c7ff"; x.font=`44px ${HAND}`; ["NEXT  →","PREV  ←","OPEN  ↵","EXIT  esc"].forEach((s,i)=>x.fillText(s,28,70+i*66)); });
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.65,.06),[M("#c96a88"),M("#c96a88"),M("#c96a88"),M("#c96a88"),new THREE.MeshBasicMaterial({map:chalk}),M("#c96a88")]);
  board.position.set(0,1.05,0); board.rotation.x=-.18; sign.add(board);
  const leg=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,.05),M("#a8536f")); leg.position.set(0,.95,-.32); leg.rotation.x=.25; sign.add(leg);
  // little table with candles and a book
  const tbl=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,.9),M("#b7708a")); tbl.position.set(.4,.85,1.3); galG.add(tbl);
  [[-.6,1.6],[1.3,1.6],[-.6,1.0],[1.3,1.0]].forEach(([x,z])=>{ const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.8,.1),M("#8a4a64")); l.position.set(x,.42,z); galG.add(l); });
  const book=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.5),M("#fff3e6")); book.position.set(0,.95,1.3); book.rotation.y=.2; galG.add(book);
  [[.9,1.25],[1.25,1.45]].forEach(([x,z])=>{ const cdl=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.3,8),M("#fff3e6")); cdl.position.set(x,1.06,z); galG.add(cdl);
    const fl=sprite("#ffb36b",.5,.9); fl.position.set(x,1.3,z); galG.add(fl); });
  shadowy(galG); galScreen.castShadow=false;
  const L=glowLight("#ffd0e0", 7, .22); L.position.set(0,3,1.2); galG.add(L);
  for(let k=-2;k<=2;k++){ const gx=ZONES.gallery.x + Math.cos(galG.rotation.y)*k*1.5, gz=ZONES.gallery.z - Math.sin(galG.rotation.y)*k*1.5; block(gx,gz,.8); }
}
function galCaptionUpdate(){
  const g=GAME.gallery[galIdx];
  galCaption.material.map = canvasTex(1024,96,(x,w,h)=>{ x.fillStyle="#b45cf0"; roundRect(x,0,0,w,h,20); x.fill(); x.fillStyle="#fff"; x.font=`600 54px ${SERIF}`; x.textAlign="center"; x.fillText(`${galIdx+1}/${GAME.gallery.length} · ${g.title}`, w/2, 66); });
  galCaption.material.needsUpdate = true;
}
function galNav(d){
  galIdx = (galIdx + d + GAME.gallery.length) % GAME.gallery.length; galScreen.material.map = galTex[galIdx]; galScreen.material.needsUpdate=true;
  galThumbs.forEach((th,k)=>{ th.material.map = galTex[(galIdx+k+1)%galTex.length]; th.material.needsUpdate=true; });
  galCaptionUpdate(); chime(880 + d*60); galAuto = 0;
  if (panelKind==="gallery") renderGallery();
}
galCaptionUpdate();
let galAuto = 0;

/* ---------- jukebox & dance floor ---------- */
const jukeG = new THREE.Group(); jukeG.position.set(ZONES.jukebox.x, groundH(ZONES.jukebox.x,ZONES.jukebox.z), ZONES.jukebox.z); jukeG.rotation.y = faceCenter(ZONES.jukebox); scene.add(jukeG);
const danceTiles = [], jukeLights = [];
let jukeLight;
{
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.6,1),M("#5a2d6e")); body.position.y=.8; jukeG.add(body);
  const arch=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,1,20,1,false,-Math.PI/2,Math.PI),M("#5a2d6e")); arch.rotation.z=Math.PI/2; arch.rotation.y=Math.PI/2; arch.position.y=1.6; jukeG.add(arch);
  [.82,.62,.42].forEach((r,k)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,8,24,Math.PI), E(k%2?"#ff5fa2":"#ffd36b",2)); t.position.set(0,1.6,.52); jukeG.add(t); jukeLights.push(t); });
  [-.75,.75].forEach(x=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(.08,1.5,.08),E("#ffd36b",2)); s.position.set(x,.8,.52); jukeG.add(s); jukeLights.push(s); });
  const grille=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.5), new THREE.MeshBasicMaterial({map:canvasTex(256,128,(x,w,h)=>{ x.fillStyle="#2a1530"; x.fillRect(0,0,w,h); x.fillStyle="#ff9ec0"; for(let i=0;i<10;i++) x.fillRect(14+i*24,20,12,88); })}));
  grille.position.set(0,.55,.51); jukeG.add(grille);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(1,.4), E("#ffb36b",1.4)); screen.position.set(0,1.2,.51); jukeG.add(screen);
  // speakers
  [-1.9,1.9].forEach(x=>{ const sp=new THREE.Mesh(new THREE.BoxGeometry(.9,1.5,.8),M("#2a1d38")); sp.position.set(x,.75,0); jukeG.add(sp);
    [1.05,.45].forEach((y,k)=>{ const cone=new THREE.Mesh(new THREE.CylinderGeometry(k?.28:.2,k?.28:.2,.1,16),M("#5b4a70")); cone.rotation.x=Math.PI/2; cone.position.set(x,y,.42); jukeG.add(cone); cone.userData.speaker=true; jukeLights.push(cone); }); });
  // dance floor (5x5) in front
  for(let i=0;i<5;i++) for(let j=0;j<5;j++){ const m=new THREE.Mesh(new THREE.BoxGeometry(.95,.08,.95), new THREE.MeshStandardMaterial({ color:"#3a2b55", emissive:"#ff5fa2", emissiveIntensity:.15, roughness:.4 }));
    m.position.set((i-2)*1,.05,2.2+j*1); m.userData.ij=[i,j]; jukeG.add(m); danceTiles.push(m); }
  // neon heart sign on a pole
  const pts=[]; for(let k=0;k<=40;k++){ const a=k/40*Math.PI*2; const hx=16*Math.pow(Math.sin(a),3), hy=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a); pts.push(new THREE.Vector3(hx*.045,hy*.045,0)); }
  const neon=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),80,.05,6,true), E("#ff5fa2",2.4)); neon.position.set(-3.3,3.2,.6); jukeG.add(neon); jukeLights.push(neon);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.6,6),M("#2a1d38")); pole.position.set(-3.3,1.3,.6); jukeG.add(pole);
  // diner booth
  const booth=new THREE.Group(); booth.position.set(3.6,0,1.6); booth.rotation.y=-Math.PI/2; jukeG.add(booth);
  [-1,1].forEach(s=>{ const seatB=new THREE.Mesh(new THREE.BoxGeometry(1.4,.45,.6),M("#e2475f")); seatB.position.set(0,.3,s*.85); booth.add(seatB);
    const backB=new THREE.Mesh(new THREE.BoxGeometry(1.4,1,.25),M("#e2475f")); backB.position.set(0,.75,s*1.15); booth.add(backB);
    [-.35,0,.35].forEach(x=>{ const st=new THREE.Mesh(new THREE.BoxGeometry(.14,1.02,.27),M("#fff3e6")); st.position.set(x,.76,s*1.15); booth.add(st); }); });
  const tableT=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,.8),M("#fff3e6")); tableT.position.y=.78; booth.add(tableT);
  const tleg=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.75,6),M("#9a9ab0")); tleg.position.y=.38; booth.add(tleg);
  [["#e2475f",-.2],["#f4cd84",.0]].forEach(([c,x])=>{ const b=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.26,8),M(c)); b.position.set(x,.95,0); booth.add(b); });
  const milk=new THREE.Mesh(new THREE.CylinderGeometry(.08,.06,.28,10),M("#ffc0d6")); milk.position.set(.3,.96,.1); booth.add(milk);
  [-.03,.05].forEach(o=>{ const straw=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.3,4),M("#ff5f8f")); straw.position.set(.3+o,1.18,.1); straw.rotation.z=o*4; booth.add(straw); });
  shadowy(jukeG); danceTiles.forEach(t=>{ t.castShadow=false; });
  jukeLight = glowLight("#ff7ab8", 8, .3); jukeLight.position.set(0,2.2,2.5); jukeG.add(jukeLight);
  body.userData.onClick = ()=>changeSong(); clickables.push(body, arch);
  arch.userData.onClick = body.userData.onClick;
  const jw = (lx,lz)=>new THREE.Vector3(lx,0,lz).applyAxisAngle(UP, jukeG.rotation.y).add(jukeG.position);
  [[0,0,1.1],[-1.9,0,.7],[1.9,0,.7],[-3.3,.6,.25],[3.6,1.6,1.4]].forEach(([lx,lz,r])=>{ const p=jw(lx,lz); block(p.x,p.z,r); });
}
const DANCE = new THREE.Vector3(0,0,4.2).applyAxisAngle(UP, jukeG.rotation.y).add(jukeG.position);
const noteTex = canvasTex(64,64,(x)=>{ x.fillStyle="#fff"; x.font=`48px Georgia`; x.textAlign="center"; x.fillText("♪",32,48); });
const notes3d = []; for(let k=0;k<8;k++){ const s=sprite("#ff9ec0",.6,0,noteTex); s.material.blending=THREE.NormalBlending; s.userData.p=k/8; jukeG.add(s); notes3d.push(s); }
