// The telescope: real constellations, satellites and meteor showers.

/* ---------- the telescope on Stargazer Hill: real constellations, satellites and meteor showers ----------
   Star positions are real: [right ascension (hours), declination (degrees), magnitude (smaller = brighter), colour] */
const SKY = [
  { name:"Orion", nick:"The Hunter", fact:"Find the three stars in a row: that’s his belt. Red Betelgeuse is his shoulder and blue-white Rigel his foot.",
    stars:{ Betelgeuse:[5.919,7.41,.5,"#ffb27a"], Rigel:[5.242,-8.20,.1,"#bcd4ff"], Bellatrix:[5.419,6.35,1.6,"#cfe0ff"], Saiph:[5.796,-9.67,2.1,"#cfe0ff"],
      Alnitak:[5.679,-1.94,1.8,"#cfe0ff"], Alnilam:[5.604,-1.20,1.7,"#cfe0ff"], Mintaka:[5.533,-.30,2.2,"#cfe0ff"], Meissa:[5.585,9.93,3.4] },
    lines:[["Meissa","Betelgeuse"],["Meissa","Bellatrix"],["Betelgeuse","Alnitak"],["Bellatrix","Mintaka"],["Alnitak","Alnilam"],["Alnilam","Mintaka"],["Alnitak","Saiph"],["Mintaka","Rigel"]] },
  { name:"Taurus", nick:"The Bull", fact:"Orange Aldebaran is the bull’s eye, and the little Pleiades star cluster rides on his shoulder.",
    stars:{ Aldebaran:[4.599,16.51,.9,"#ffc58a"], Elnath:[5.438,28.61,1.7], "ζ Tau":[5.627,21.14,3.0], "γ Tau":[4.330,15.63,3.6], "δ Tau":[4.382,17.54,3.8], "ε Tau":[4.477,19.18,3.5], "λ Tau":[4.011,12.49,3.4],
      Alcyone:[3.791,24.11,2.9,"#cfe0ff"], Atlas:[3.819,24.05,3.6,"#cfe0ff"], Electra:[3.747,24.11,3.7,"#cfe0ff"], Maia:[3.763,24.37,3.9,"#cfe0ff"], Merope:[3.772,23.95,4.1,"#cfe0ff"], Taygeta:[3.754,24.47,4.3,"#cfe0ff"] },
    lines:[["Aldebaran","ζ Tau"],["Aldebaran","γ Tau"],["γ Tau","λ Tau"],["γ Tau","δ Tau"],["δ Tau","ε Tau"],["ε Tau","Elnath"]] },
  { name:"Gemini", nick:"The Twins", fact:"Castor and Pollux, two bright stars side by side forever. A little like us.",
    stars:{ Castor:[7.577,31.89,1.6], Pollux:[7.755,28.03,1.1,"#ffd9a0"], Alhena:[6.629,16.40,1.9], Mebsuta:[6.732,25.13,3.0], Tejat:[6.383,22.51,2.9,"#ffc58a"], Propus:[6.248,22.51,3.3], Wasat:[7.335,21.98,3.5] },
    lines:[["Castor","Pollux"],["Castor","Mebsuta"],["Mebsuta","Tejat"],["Tejat","Propus"],["Pollux","Wasat"],["Wasat","Alhena"]] },
  { name:"Canis Major", nick:"The Great Dog", fact:"Home of Sirius, the brightest star in the whole night sky, only 8.6 light-years away.",
    stars:{ Sirius:[6.752,-16.72,-1.46,"#dfe8ff"], Mirzam:[6.378,-17.96,2.0], Wezen:[7.140,-26.39,1.8,"#fff1d0"], Adhara:[6.977,-28.97,1.5], Aludra:[7.402,-29.30,2.4] },
    lines:[["Mirzam","Sirius"],["Sirius","Wezen"],["Wezen","Adhara"],["Wezen","Aludra"]] },
  { name:"Leo", nick:"The Lion", fact:"A backwards question mark makes the lion’s mane. It ends at bright Regulus, the lion’s heart.",
    stars:{ Regulus:[10.139,11.97,1.4], "η Leo":[10.122,16.76,3.5], Algieba:[10.333,19.84,2.0,"#ffd9a0"], Adhafera:[10.278,23.42,3.4], "μ Leo":[9.879,26.01,3.9], "ε Leo":[9.764,23.77,3.0], Zosma:[11.235,20.52,2.6], Chertan:[11.237,15.43,3.3], Denebola:[11.818,14.57,2.1] },
    lines:[["Regulus","η Leo"],["η Leo","Algieba"],["Algieba","Adhafera"],["Adhafera","μ Leo"],["μ Leo","ε Leo"],["Algieba","Zosma"],["Zosma","Denebola"],["Denebola","Chertan"],["Chertan","Regulus"],["Zosma","Chertan"]] },
  { name:"Ursa Major", nick:"The Big Dipper", fact:"Follow the two stars at the end of the cup, from Merak to Dubhe, and they point the way to Polaris, the North Star.",
    stars:{ Dubhe:[11.062,61.75,1.8,"#ffd9a0"], Merak:[11.031,56.38,2.4], Phecda:[11.897,53.69,2.4], Megrez:[12.257,57.03,3.3], Alioth:[12.900,55.96,1.8], Mizar:[13.399,54.93,2.2], Alkaid:[13.792,49.31,1.9] },
    lines:[["Dubhe","Merak"],["Merak","Phecda"],["Phecda","Megrez"],["Megrez","Dubhe"],["Megrez","Alioth"],["Alioth","Mizar"],["Mizar","Alkaid"]] },
  { name:"Cassiopeia", nick:"The Queen", fact:"Her bright ‘W’ sits on the other side of the North Star from the Big Dipper.",
    stars:{ Caph:[.153,59.15,2.3], Schedar:[.675,56.54,2.2,"#ffc58a"], "γ Cas":[.945,60.72,2.5,"#cfe0ff"], Ruchbah:[1.430,60.24,2.7], Segin:[1.907,63.67,3.4] },
    lines:[["Caph","Schedar"],["Schedar","γ Cas"],["γ Cas","Ruchbah"],["Ruchbah","Segin"]] },
  { name:"Cygnus", nick:"The Swan", fact:"A swan flying along the Milky Way. Its tail, Deneb, is one corner of the Summer Triangle.",
    stars:{ Deneb:[20.690,45.28,1.3], Sadr:[20.370,40.26,2.2], Gienah:[20.770,33.97,2.5], "δ Cyg":[19.750,45.13,2.9], Albireo:[19.512,27.96,3.1,"#ffd9a0"] },
    lines:[["Deneb","Sadr"],["Sadr","Albireo"],["δ Cyg","Sadr"],["Sadr","Gienah"]] },
  { name:"Lyra", nick:"The Lyre", fact:"Vega, one of the brightest stars we can see, is another corner of the Summer Triangle.",
    stars:{ Vega:[18.616,38.78,0,"#dfe8ff"], "ζ Lyr":[18.746,37.61,4.3], Sheliak:[18.835,33.36,3.5], Sulafat:[18.982,32.69,3.3], "δ Lyr":[18.908,36.90,4.3] },
    lines:[["Vega","ζ Lyr"],["ζ Lyr","Sheliak"],["Sheliak","Sulafat"],["Sulafat","δ Lyr"],["δ Lyr","ζ Lyr"]] },
  { name:"Scorpius", nick:"The Scorpion", fact:"Its glowing red heart is Antares, a name that means ‘rival of Mars’.",
    stars:{ Antares:[16.490,-26.43,1.0,"#ff9a6a"], Acrab:[16.091,-19.81,2.6], Dschubba:[16.006,-22.62,2.3], "π Sco":[15.981,-26.11,2.9], "σ Sco":[16.353,-25.59,2.9], "τ Sco":[16.598,-28.22,2.8],
      "ε Sco":[16.836,-34.29,2.3,"#ffd9a0"], "μ Sco":[16.864,-38.05,3.0], "ζ Sco":[16.910,-42.36,3.6], "η Sco":[17.203,-43.24,3.3], Sargas:[17.622,-43.00,1.9], "ι Sco":[17.793,-40.13,3.0], "κ Sco":[17.708,-39.03,2.4], Shaula:[17.560,-37.10,1.6] },
    lines:[["Acrab","Dschubba"],["Dschubba","π Sco"],["Dschubba","σ Sco"],["σ Sco","Antares"],["Antares","τ Sco"],["τ Sco","ε Sco"],["ε Sco","μ Sco"],["μ Sco","ζ Sco"],["ζ Sco","η Sco"],["η Sco","Sargas"],["Sargas","ι Sco"],["ι Sco","κ Sco"],["κ Sco","Shaula"]] },
  { name:"Crux", nick:"The Southern Cross", fact:"The smallest of all 88 constellations, and one of the most loved in the southern sky.",
    stars:{ Acrux:[12.443,-63.10,.8,"#bcd4ff"], Mimosa:[12.795,-59.69,1.3,"#bcd4ff"], Gacrux:[12.519,-57.11,1.6,"#ff9a6a"], Imai:[12.252,-58.75,2.8] },
    lines:[["Acrux","Gacrux"],["Mimosa","Imai"]] },
];
// other famous bright stars, drawn and named but not part of the tour
const SKY_EXTRA = { Polaris:[2.530,89.26,2.0,"#fff1d0"], Arcturus:[14.261,19.18,-.05,"#ffc58a"], Spica:[13.420,-11.16,1.0,"#bcd4ff"], Altair:[19.846,8.87,.8], Capella:[5.278,46.00,.1,"#fff1d0"],
  Procyon:[7.655,5.22,.4], Fomalhaut:[22.961,-29.62,1.2], Canopus:[6.399,-52.70,-.7], "Alpha Centauri":[14.661,-60.83,-.3,"#fff1d0"], Hadar:[14.064,-60.37,.6,"#bcd4ff"] };
const skyV = (ra,dec)=>{ const a=ra/12*Math.PI, d=dec*Math.PI/180; return [Math.cos(d)*Math.cos(a), Math.cos(d)*Math.sin(a), Math.sin(d)]; };
const skyStars = [], skyBg = [];
SKY.forEach((c,ci)=>{ c.v={}; let sx=0,sy=0,sz=0;
  for(const [n,s] of Object.entries(c.stars)){ const st={ v:skyV(s[0],s[1]), mag:s[2], col:s[3]||"#fff6e8", name:n, con:ci, ph:Math.random()*6 }; c.v[n]=st; skyStars.push(st); sx+=st.v[0]; sy+=st.v[1]; sz+=st.v[2]; }
  c.ra=Math.atan2(sy,sx); c.dec=Math.asin(sz/Math.hypot(sx,sy,sz)); });
for(const [n,s] of Object.entries(SKY_EXTRA)) skyStars.push({ v:skyV(s[0],s[1]), mag:s[2], col:s[3]||"#fff6e8", name:n, con:-1, ph:Math.random()*6 });
{ // faint background stars, plus the Milky Way band (along the real galactic plane)
  for(let i=0;i<(isTouch?1300:2000);i++){ const u=rnd(-1,1), a=rnd(0,6.283), s=Math.sqrt(1-u*u); skyBg.push({ v:[s*Math.cos(a), s*Math.sin(a), u], mag:6.4-2.6*Math.pow(Math.random(),3), ph:Math.random()*6 }); }
  const ngp=skyV(12.857,27.13), gc=skyV(17.761,-28.94), dot=gc[0]*ngp[0]+gc[1]*ngp[1]+gc[2]*ngp[2];
  let ax=gc[0]-dot*ngp[0], ay=gc[1]-dot*ngp[1], az=gc[2]-dot*ngp[2]; const al=Math.hypot(ax,ay,az); ax/=al; ay/=al; az/=al;
  const bx=ngp[1]*az-ngp[2]*ay, by=ngp[2]*ax-ngp[0]*az, bz=ngp[0]*ay-ngp[1]*ax, gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
  const onBand=(th,off)=>{ const x=ax*Math.cos(th)+bx*Math.sin(th)+ngp[0]*off, y=ay*Math.cos(th)+by*Math.sin(th)+ngp[1]*off, z=az*Math.cos(th)+bz*Math.sin(th)+ngp[2]*off, l=Math.hypot(x,y,z); return [x/l,y/l,z/l]; };
  for(let i=0;i<(isTouch?900:1500);i++){ const th = i%2 ? rnd(0,6.283) : gauss()*1.6; skyBg.push({ v:onBand(th, gauss()*.12), mag:rnd(5.6,6.9), ph:Math.random()*6 }); }
  SKY.glow=[]; for(let k=0;k<90;k++){ const th=k/90*6.283; SKY.glow.push({ v:onBand(th, gauss()*.03), w:.45+.55*Math.max(0,Math.cos(th)) }); }
}
let scopeOpen = false;
const sc = { idx:0, ra:0, dec:0, slew:null, last:0, lineA:0, events:[], drag:null };
function scopeInfo(){ const c=SKY[sc.idx]; $("#scName").textContent=c.name; $("#scFact").innerHTML=`<b>${esc(c.nick)}.</b> ${esc(c.fact)}`; $("#scCount").textContent=`${sc.idx+1} / ${SKY.length}`; }
function scopeGo(d){ sc.idx=(sc.idx+d+SKY.length)%SKY.length; const c=SKY[sc.idx]; sc.slew={ ra0:sc.ra, dec0:sc.dec, ra1:c.ra, dec1:c.dec, k:0 }; scopeInfo(); chime(988+d*40); }
let scEvTimer=null;
function scopeEvent(text){ const el=$("#scEvent"); el.textContent=text; el.classList.add("show"); clearTimeout(scEvTimer); scEvTimer=setTimeout(()=>el.classList.remove("show"), 4500); }
function openTelescope(){
  if (scopeOpen || finaleOn || fwShow.on || !playing) return;
  achieve("stars"); scopeOpen=true; frozen=true; C.vel.set(0,0,0); tagBox.classList.add("off"); $("#interact").classList.remove("show"); current=null; if (panelKind) closePanel();
  const t=clock.elapsedTime, c=SKY[sc.idx]; sc.ra=c.ra+.5; sc.dec=c.dec-.2; sc.slew={ ra0:sc.ra, dec0:sc.dec, ra1:c.ra, dec1:c.dec, k:0 }; sc.last=t; sc.events=[];
  sc.nextSat=t+rnd(4,7); sc.nextShower=t+rnd(11,15); sc.nextMeteor=t+rnd(5,8);
  scopeInfo(); $("#scLine").textContent = GAME.world.telescope + "  ·  drag to look around"; $("#scope").classList.remove("off"); chime(659); chime(988,.2);
}
function closeTelescope(){ if (!scopeOpen) return; scopeOpen=false; frozen=false; tagBox.classList.remove("off"); $("#scope").classList.add("off"); }
$("#scopeX").onclick=closeTelescope; $("#scPrev").onclick=()=>scopeGo(-1); $("#scNext").onclick=()=>scopeGo(1);
{ const cv=$("#scopec");
  cv.addEventListener("pointerdown", e=>{ sc.drag={ x:e.clientX, y:e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor="grabbing"; });
  cv.addEventListener("pointermove", e=>{ if (!sc.drag) return; const S=sc.S||400, dx=e.clientX-sc.drag.x, dy=e.clientY-sc.drag.y; sc.drag={ x:e.clientX, y:e.clientY }; sc.slew=null;
    sc.ra += dx/S/Math.max(.2,Math.cos(sc.dec)); sc.dec = Math.max(-1.45, Math.min(1.45, sc.dec + dy/S)); });
  const up=()=>{ sc.drag=null; cv.style.cursor=""; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); }
addEventListener("keydown", e=>{
  if (scopeOpen){ if (e.key==="Escape") closeTelescope(); else if (e.key==="ArrowRight"){ e.preventDefault(); scopeGo(1); } else if (e.key==="ArrowLeft"){ e.preventDefault(); scopeGo(-1); } }
  else if (fwShow.on && e.key==="Escape") endShow();
});
function addMeteor(t, from, dir, delay=0){ sc.events.push({ kind:"meteor", t0:t+delay, dur:rnd(.5,.85), p:from, d:dir, sp:rnd(1.3,1.9), len:rnd(.22,.38) }); }
function drawScope(t){
  const cv=$("#scopec"), dpr=Math.min(devicePixelRatio,2), W=innerWidth, H=innerHeight, x=cv.getContext("2d");
  if (cv.width!==Math.round(W*dpr) || cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  x.setTransform(dpr,0,0,dpr,0,0);
  const dt=Math.min(.1, t-sc.last); sc.last=t;
  const R=Math.min(W*.46, H*.36), cx=W/2, cy=H*.41, S=R/Math.tan(26*Math.PI/180); sc.S=S;
  // glide to the chosen constellation
  if (sc.slew){ const s=sc.slew; s.k=Math.min(1, s.k+dt/1.8); const e=s.k<.5?4*s.k*s.k*s.k:1-Math.pow(-2*s.k+2,3)/2;
    let dra=s.ra1-s.ra0; while(dra>Math.PI) dra-=6.283; while(dra<-Math.PI) dra+=6.283; sc.ra=s.ra0+dra*e; sc.dec=s.dec0+(s.dec1-s.dec0)*e; if (s.k>=1) sc.slew=null; }
  sc.lineA += ((sc.slew ? 0 : 1) - sc.lineA)*Math.min(1, dt*2.5);
  const ca=Math.cos(sc.ra), sa=Math.sin(sc.ra), cd=Math.cos(sc.dec), sd=Math.sin(sc.dec);
  const proj=v=>{ const d=v[0]*cd*ca+v[1]*cd*sa+v[2]*sd; if (d<.3) return null; const ex=-v[0]*sa+v[1]*ca, ny=-v[0]*sd*ca-v[1]*sd*sa+v[2]*cd; return [cx-ex/d*S, cy-ny/d*S]; };
  x.fillStyle="#03020f"; x.fillRect(0,0,W,H);
  x.save(); x.beginPath(); x.arc(cx,cy,R,0,6.283); x.clip();
  const bg=x.createRadialGradient(cx,cy,0,cx,cy,R); bg.addColorStop(0,"#120d35"); bg.addColorStop(1,"#070520"); x.fillStyle=bg; x.fillRect(cx-R,cy-R,R*2,R*2);
  // Milky Way glow
  x.globalCompositeOperation="lighter";
  SKY.glow.forEach(g=>{ const p=proj(g.v); if (!p) return; const r=S*.2, gr=x.createRadialGradient(p[0],p[1],0,p[0],p[1],r);
    gr.addColorStop(0,`rgba(170,160,255,${.07*g.w})`); gr.addColorStop(1,"rgba(170,160,255,0)"); x.fillStyle=gr; x.fillRect(p[0]-r,p[1]-r,r*2,r*2); });
  // faint stars
  skyBg.forEach(s=>{ const p=proj(s.v); if (!p) return; const a=Math.max(.08,(6.9-s.mag)/3.5)*(.7+.3*Math.sin(t*2.3+s.ph)), r=.5+(6.9-s.mag)*.28;
    x.fillStyle=`rgba(235,235,255,${a})`; x.fillRect(p[0]-r/2,p[1]-r/2,r,r); });
  x.globalCompositeOperation="source-over";
  // constellation lines: the chosen one glows, the others are faint
  SKY.forEach((c,ci)=>{ const on=ci===sc.idx; x.strokeStyle = on ? `rgba(255,170,200,${.85*sc.lineA})` : "rgba(190,180,255,.16)"; x.lineWidth = on ? 1.8 : 1;
    x.beginPath(); c.lines.forEach(([a,b])=>{ const p=proj(c.v[a].v), q=proj(c.v[b].v); if (p&&q){ x.moveTo(p[0],p[1]); x.lineTo(q[0],q[1]); } }); x.stroke(); });
  // named stars, sized by brightness (a label is skipped if it would sit on top of another one)
  const labels=[];
  skyStars.forEach(s=>{ const p=proj(s.v); if (!p) return; const r=Math.max(1, (4.6-s.mag)*1.1), tw=.8+.2*Math.sin(t*3+s.ph);
    if (s.mag<2.2){ const g=x.createRadialGradient(p[0],p[1],0,p[0],p[1],r*4); g.addColorStop(0,s.col); g.addColorStop(1,"rgba(0,0,0,0)"); x.globalAlpha=.35*tw; x.fillStyle=g; x.fillRect(p[0]-r*4,p[1]-r*4,r*8,r*8); }
    x.globalAlpha=tw; x.fillStyle=s.col; x.beginPath(); x.arc(p[0],p[1],r*.6,0,6.283); x.fill(); x.globalAlpha=1;
    if (((s.con===sc.idx && s.mag<2.6) || (s.con<0 && s.mag<1.2)) && !labels.some(l=>Math.abs(l[0]-p[0])<60 && Math.abs(l[1]-p[1])<16)){ labels.push(p); x.fillStyle = s.con===sc.idx ? `rgba(255,236,200,${.85*sc.lineA})` : "rgba(220,214,255,.45)";
      x.font=`italic 13px ${SERIF}`; x.textAlign="left"; x.fillText(s.name, p[0]+r+4, p[1]-r-2); } });
  // names of the other constellations in view (the chosen one is named below the eyepiece)
  SKY.forEach((c,ci)=>{ if (ci===sc.idx) return; const p=proj(skyV(c.ra/Math.PI*12, c.dec*180/Math.PI)); if (!p) return;
    x.font=`italic 15px ${SERIF}`; x.textAlign="center"; x.fillStyle="rgba(200,190,255,.42)"; x.fillText(c.name, p[0], p[1]); });
  // satellites and meteors (in eyepiece coordinates: 1 = the rim)
  if (t>sc.nextSat){ sc.nextSat=t+rnd(18,30); const a=rnd(0,6.283), b=a+Math.PI+rnd(-.6,.6);
    sc.events.push({ kind:"sat", t0:t, dur:rnd(8,11), p:[Math.cos(a)*1.05, Math.sin(a)*1.05], q:[Math.cos(b)*1.05, Math.sin(b)*1.05], flare:Math.random()<.5 ? rnd(.3,.7) : -1 });
    scopeEvent("🛰️ A satellite is gliding across the sky…"); }
  if (t>sc.nextShower){ sc.nextShower=t+rnd(28,45); const a=rnd(0,6.283), rad=[Math.cos(a)*.95, Math.sin(a)*.95]; let dl=0;
    for(let k=0;k<16;k++){ dl+=rnd(.12,.42); const tx=rnd(-.6,.6), ty=rnd(-.6,.6), dx=tx-rad[0], dy=ty-rad[1], l=Math.hypot(dx,dy), s=rnd(.1,.45); addMeteor(t, [rad[0]+dx/l*s, rad[1]+dy/l*s], [dx/l, dy/l], dl); }
    scopeEvent("☄️ A meteor shower! Quick, make a wish…"); chime(1175); chime(1568,.25); }
  if (t>sc.nextMeteor){ sc.nextMeteor=t+rnd(6,12); const a=rnd(0,6.283); addMeteor(t, [rnd(-.6,.6), rnd(-.6,.6)], [Math.cos(a), Math.sin(a)]); }
  sc.events = sc.events.filter(ev=>{ const k=(t-ev.t0)/ev.dur; if (k<0) return true; if (k>1) return false;
    if (ev.kind==="sat"){ const px=cx+(ev.p[0]+(ev.q[0]-ev.p[0])*k)*R, py=cy+(ev.p[1]+(ev.q[1]-ev.p[1])*k)*R, fl=ev.flare>0 ? Math.max(0,1-Math.abs(k-ev.flare)*12) : 0;
      x.fillStyle=`rgba(255,255,255,${.75+.25*Math.sin(t*6)})`; x.beginPath(); x.arc(px,py,1.6+fl*3,0,6.283); x.fill();
      if (fl>0){ const g=x.createRadialGradient(px,py,0,px,py,18*fl); g.addColorStop(0,"rgba(255,255,255,.8)"); g.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=g; x.fillRect(px-20,py-20,40,40); } }
    else { const hx=cx+(ev.p[0]+ev.d[0]*ev.sp*k*ev.dur)*R, hy=cy+(ev.p[1]+ev.d[1]*ev.sp*k*ev.dur)*R, L=ev.len*R*Math.min(1,k*3), a=Math.sin(k*Math.PI);
      const g=x.createLinearGradient(hx-ev.d[0]*L, hy-ev.d[1]*L, hx, hy); g.addColorStop(0,"rgba(180,220,255,0)"); g.addColorStop(1,`rgba(255,255,255,${a})`);
      x.strokeStyle=g; x.lineWidth=2; x.lineCap="round"; x.beginPath(); x.moveTo(hx-ev.d[0]*L, hy-ev.d[1]*L); x.lineTo(hx,hy); x.stroke();
      x.fillStyle=`rgba(255,255,255,${a})`; x.beginPath(); x.arc(hx,hy,1.8,0,6.283); x.fill(); }
    return true; });
  // eyepiece: darker edges, faint crosshair, a brass rim
  const vg=x.createRadialGradient(cx,cy,R*.72,cx,cy,R); vg.addColorStop(0,"rgba(3,2,15,0)"); vg.addColorStop(1,"rgba(3,2,15,.9)"); x.fillStyle=vg; x.fillRect(cx-R,cy-R,R*2,R*2);
  x.strokeStyle="rgba(255,255,255,.05)"; x.lineWidth=1; x.beginPath(); x.moveTo(cx-R,cy); x.lineTo(cx+R,cy); x.moveTo(cx,cy-R); x.lineTo(cx,cy+R); x.stroke();
  x.restore();
  x.lineWidth=9; x.strokeStyle="#241d4f"; x.beginPath(); x.arc(cx,cy,R+4,0,6.283); x.stroke();
  x.lineWidth=1.5; x.strokeStyle="rgba(244,205,132,.45)"; x.beginPath(); x.arc(cx,cy,R+9,0,6.283); x.stroke();
}
