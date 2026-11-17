// The Map of Us table.

/* ---------- love map ---------- */
const _la = GAME.places.map(p=>p.lat), _lo = GAME.places.map(p=>p.lon);
const latMin = Math.min(..._la)-1.6, latMax = Math.max(..._la)+1.6, lonMin = Math.min(..._lo)-1.6, lonMax = Math.max(..._lo)+1.6;
const MAPC = Math.cos((latMin+latMax)/2*Math.PI/180), MAPK = Math.min(500/((lonMax-lonMin)*MAPC), 560/(latMax-latMin));
const MOX = (560-(lonMax-lonMin)*MAPC*MAPK)/2, MOY = (620-(latMax-latMin)*MAPK)/2;
const mproj = (lat,lon) => [ MOX+(lon-lonMin)*MAPC*MAPK, MOY+(latMax-lat)*MAPK ];
const gridLons = [], gridLats = []; for(let l=Math.ceil(lonMin); l<=lonMax; l+=2) gridLons.push(l); for(let l=Math.ceil(latMin); l<=latMax; l+=2) gridLats.push(l);
function hav(a,b){ const R=6371, r=Math.PI/180, dLa=(b.lat-a.lat)*r, dLo=(b.lon-a.lon)*r; const h=Math.sin(dLa/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
// a city's label goes ABOVE its pin when another pin sits just below it, or right beside it (so labels never overlap)
function labelAbove(i){
  const [X,Y]=mproj(GAME.places[i].lat, GAME.places[i].lon);
  return GAME.places.some((p,j)=>{ if (j===i) return false; const [x2,y2]=mproj(p.lat,p.lon), dx=Math.abs(x2-X), dy=y2-Y;
    return (dx<70 && dy>0 && dy<66) || (j<i && dx<80 && Math.abs(dy)<22); });
}
function drawMap(x, W, H, opts={}){
  const g=x.createRadialGradient(W/2,H/2,50,W/2,H/2,W*.75); g.addColorStop(0,"#fbf1dc"); g.addColorStop(1,"#e9d2a8"); x.fillStyle=g; x.fillRect(0,0,W,H);
  x.save(); const s=Math.min(W/560,H/620); x.translate((W-560*s)/2,(H-620*s)/2); x.scale(s,s);
  x.strokeStyle="rgba(150,110,80,.18)"; x.lineWidth=1; gridLons.forEach(lon=>{ const [X]=mproj(latMin,lon); x.beginPath(); x.moveTo(X,0); x.lineTo(X,620); x.stroke(); });
  gridLats.forEach(lat=>{ const [,Y]=mproj(lat,lonMin); x.beginPath(); x.moveTo(0,Y); x.lineTo(560,Y); x.stroke(); });
  // route
  const pts=GAME.places.map(p=>mproj(p.lat,p.lon));
  x.strokeStyle="#c96a88"; x.lineWidth=3; x.setLineDash([8,8]); x.beginPath();
  pts.forEach(([X,Y],i)=>{ if(!i) x.moveTo(X,Y); else { const [pX,pY]=pts[i-1]; x.quadraticCurveTo((pX+X)/2-(Y-pY)*.25,(pY+Y)/2+(X-pX)*.25,X,Y); } }); x.stroke(); x.setLineDash([]);
  pts.forEach(([X,Y],i)=>{ x.fillStyle="#ff5f8f"; x.save(); x.translate(X,Y-14); x.scale(1.25,1.25); x.beginPath(); x.moveTo(0,11); x.bezierCurveTo(-14,1,-12,-11,-5,-11); x.bezierCurveTo(-2,-11,0,-8,0,-6); x.bezierCurveTo(0,-8,2,-11,5,-11); x.bezierCurveTo(12,-11,14,1,0,11); x.fill(); x.restore();
    x.fillStyle="#fff"; x.font=`700 15px ${SERIF}`; x.textAlign="center"; x.fillText(i+1, X, Y-12);
    if (opts.labels){ x.fillStyle="#5a3a4a"; x.font=`22px ${HAND}`; x.fillText(GAME.places[i].city, X, labelAbove(i) ? Y-38 : Y+18); } });
  // compass
  x.translate(500,560); x.fillStyle="#b07a5a"; x.beginPath(); x.moveTo(0,-34); x.lineTo(8,0); x.lineTo(0,34); x.lineTo(-8,0); x.fill(); x.font=`700 18px ${SERIF}`; x.textAlign="center"; x.fillText("N",0,-40);
  x.restore();
  x.fillStyle="#5a3a4a"; x.font=`600 ${Math.round(W/14)}px ${SERIF}`; x.textAlign="left"; x.fillText("The Map of Us", W*.05, H*.09);
}
const mapG = new THREE.Group(); mapG.position.set(ZONES.map.x, groundH(ZONES.map.x,ZONES.map.z), ZONES.map.z); mapG.rotation.y = faceCenter(ZONES.map); scene.add(mapG);
{
  const top=new THREE.Mesh(new THREE.BoxGeometry(3.6,.14,3.9),M("#a77a6a")); top.position.y=1.05; mapG.add(top);
  [[-1.6,-1.75],[1.6,-1.75],[-1.6,1.75],[1.6,1.75]].forEach(([x,z])=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,1,6),M("#7a4f45")); l.position.set(x,.5,z); mapG.add(l); });
  const mt=canvasTex(1024,1100,(x,w,h)=>drawMap(x,w,h,{labels:true}));
  const sheetM=new THREE.Mesh(new THREE.PlaneGeometry(3.3,3.6), new THREE.MeshBasicMaterial({map:mt})); sheetM.rotation.x=-Math.PI/2; sheetM.position.y=1.13; mapG.add(sheetM);
  // 3D pins
  GAME.places.forEach(pl=>{ const [X,Y]=mproj(pl.lat,pl.lon); const s=Math.min(1024/560,1100/620); const px=((1024-560*s)/2+X*s)/1024, py=((1100-620*s)/2+Y*s)/1100;
    const pin=new THREE.Group(); pin.position.set((px-.5)*3.3, 1.13, (py-.5)*3.6);
    const stick=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.45,4),M("#fff3e6")); stick.position.y=.22; pin.add(stick);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),E("#ff5f8f",1.1)); head.position.y=.46; pin.add(head); mapG.add(pin); });
  const lamp=glowLight("#ffe0b0", 5, .22); lamp.position.set(0,2.2,0); mapG.add(lamp);
  const globe=new THREE.Mesh(new THREE.SphereGeometry(.35,16,12), M("#6fb7d6",{flatShading:false})); globe.position.set(-1.4,1.55,-1.6); mapG.add(globe);
  shadowy(mapG); sheetM.castShadow=false;
  top.userData.onClick=()=>openMap(); sheetM.userData.onClick=top.userData.onClick; clickables.push(top, sheetM);
  block(ZONES.map.x, ZONES.map.z, 2.3);
}
