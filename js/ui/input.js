// Keyboard, joystick, mouse/touch camera and clicks.

/* ============================ INPUT ============================ */
const keys = {};
addEventListener("keydown", e=>{
  if (e.target.tagName === "INPUT") return;
  if (sitting && ["escape","f","e"].includes(e.key.toLowerCase())){ e.preventDefault(); endMoment(); return; }   // stand up / end the ride
  keys[e.key.toLowerCase()] = true;
  if ((e.key==="e"||e.key==="E"||e.key==="Enter") && playing && $("#scene").classList.contains("off") && current){ e.preventDefault(); doInteract(); }
  if ((e.key==="h"||e.key==="H") && playing && !frozen && driving) honk();
  if (e.key===" " && playing){ e.preventDefault(); if (fwShow.on) bigBurst(); }
  const k = e.key.toLowerCase();
  if (k==="m" && playing && !finaleOn && !scopeOpen && !fwShow.on && $("#scene").classList.contains("off") && !snapOpen){ if (panelKind==="island") closePanel(); else if (!panelKind) openIslandMap(); }
  if (k==="p" && playing) takeSnapshot();
  if (k==="f" && playing && !snapOpen && $("#scene").classList.contains("off") && !panelKind) toggleWalk();
});
addEventListener("keyup", e=>{ keys[e.key.toLowerCase()] = false; });
addEventListener("blur", ()=>{ for (const k in keys) keys[k]=false; });

// joystick
const joy = $("#joy"), knob = joy.querySelector(".knob"); let joyVec = {x:0,y:0}, joyId = null;
joy.addEventListener("pointerdown", e=>{ joyId=e.pointerId; joy.setPointerCapture(e.pointerId); moveJoy(e); });
joy.addEventListener("pointermove", e=>{ if(e.pointerId===joyId) moveJoy(e); });
const endJoy = ()=>{ joyId=null; joyVec={x:0,y:0}; knob.style.transform=""; };
// turbo: hold Shift on a keyboard, or hold ⚡ on a phone
let boostHeld = false; const boostBtn = $("#boost");
boostBtn.addEventListener("pointerdown", e=>{ boostHeld=true; boostBtn.setPointerCapture(e.pointerId); boostBtn.classList.add("on"); });
const endBoost = ()=>{ boostHeld=false; boostBtn.classList.remove("on"); };
boostBtn.addEventListener("pointerup", endBoost); boostBtn.addEventListener("pointercancel", endBoost);
joy.addEventListener("pointerup", endJoy); joy.addEventListener("pointercancel", endJoy);
function moveJoy(e){ const r=joy.getBoundingClientRect(); let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
  const m=Math.hypot(dx,dy), max=42; if(m>max){dx=dx/m*max;dy=dy/m*max;} knob.style.transform=`translate(${dx}px,${dy}px)`; joyVec={x:dx/max,y:dy/max}; walkTarget=null; }

// camera orbit & tap-to-walk
let camYaw = 0, camPitch = .38, camDist = isTouch ? 8.5 : 7.2, drag = null, dragMoved = 0, pinchD = null, walkTarget = null;
const pointers = new Map();
canvas.addEventListener("pointerdown", e=>{ pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); canvas.setPointerCapture(e.pointerId);
  if (pointers.size===1){ drag={x:e.clientX,y:e.clientY}; dragMoved=0; } else { drag=null; const [a,b]=[...pointers.values()]; pinchD=Math.hypot(a.x-b.x,a.y-b.y); } });
canvas.addEventListener("pointermove", e=>{
  if(!pointers.has(e.pointerId)) return; pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if (pointers.size===2 && pinchD){ const [a,b]=[...pointers.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); camDist=Math.min(16,Math.max(4,camDist*pinchD/d)); pinchD=d; return; }
  if (!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; dragMoved+=Math.abs(dx)+Math.abs(dy); drag={x:e.clientX,y:e.clientY};
  if (dragMoved>6) lastDragT = clock.elapsedTime; camYaw -= dx*.006; camPitch = Math.min(1.1, Math.max(.12, camPitch + dy*.004));
});
canvas.addEventListener("pointerup", e=>{ pointers.delete(e.pointerId); if(pointers.size<2) pinchD=null;
  if (drag && dragMoved<6 && playing) tapWorld(e.clientX,e.clientY, e.pointerType==="mouse"); drag=null; });
canvas.addEventListener("pointercancel", e=>{ pointers.delete(e.pointerId); drag=null; pinchD=null; });
canvas.addEventListener("wheel", e=>{ e.preventDefault(); camDist=Math.min(16,Math.max(4,camDist*(1+e.deltaY*.001))); }, {passive:false});

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
// the place (letter spot, well, gallery…) under the mouse/finger, if any
function clickedSpot(x,y){
  ndc.set(x/innerWidth*2-1, -(y/innerHeight)*2+1); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObject(terrain)[0]; if (!h || h.distance > 60) return null;
  let best=null, bd=1e9;
  interactables.forEach(it=>{ if (!it.r) return; const tp=it.tagPos||it.pos; const d=Math.min(Math.hypot(h.point.x-it.pos.x, h.point.z-it.pos.z), Math.hypot(h.point.x-tp.x, h.point.z-tp.z));
    if (d<4.5 && d<bd){ bd=d; best=it; } });
  return best;
}
// mouse: clicks only use things (the car is driven with the keyboard). Touch: tap the ground to drive there.
function tapWorld(x,y, mouse){
  if (!$("#scene").classList.contains("off") || panelKind) return;
  // mouse: use whatever the glowing cursor is drawn to
  if (mouse && hover){
    if (hover.click){ hover.click.userData.onClick(); return; }
    if (hover.spot===current){ doInteract(); return; }
    say(`Drive a little closer to <b>${esc(hover.spot.name)}</b>, then click it again ✨`, 3500); chime(440); return;
  }
  ndc.set(x/innerWidth*2-1, -(y/innerHeight)*2+1); ray.setFromCamera(ndc, camera);
  const c = ray.intersectObjects(clickables, false)[0];
  if (c && c.distance < 40 && c.object.userData.onClick){ c.object.userData.onClick(); return; }
  const spot = clickedSpot(x,y);
  if (spot && spot===current){ doInteract(); return; }
  if (spot && mouse){ say(`Drive a little closer to <b>${esc(spot.name)}</b>, then click it again ✨`, 3500); chime(440); return; }
  if (mouse) return;
  const h = ray.intersectObject(terrain)[0];
  if (h){ walkTarget = h.point.clone(); burst(h.point.clone().add(new THREE.Vector3(0,.1,0)), 6, "#ffe39a", false, .4); }
}
