// The Last Door: the finale, the celebration when a letter is found, and the floating hearts.

// override win to add 3D celebration
const _win = win;
win = function(i){ justWon = i; const p=landmarks[i].pos.clone().add(new THREE.Vector3(0,2,0)); burst(p, 36); chime(784); chime(988,.12); chime(1175,.24); _win(i); };

function startFinale(){
  finaleOn = true; frozen = true; $("#interact").classList.remove("show"); current = null; tagBox.classList.add("off");
  if (GAME.finaleSong) playSongFile(GAME.finaleSong);   // your song for this moment (set in story.js)
  chime(523); chime(659,.2); chime(784,.4); chime(1047,.6);
  doorOpening = true;
  // she stands in front of the door, he appears from the light
  const front = new THREE.Vector3(DOOR.x, 0, DOOR.z+2.6);
  driving = false; C.vel.set(0,0,0); her.quaternion.identity();
  her.position.set(front.x, walkH(front.x,front.z), front.z); her.rotation.set(0, Math.PI, 0);
  // Lumi whisks Prateek away… he'll walk out through the door
  burst(him.position.clone().add(new THREE.Vector3(0,1,0)), 24, "#ffe39a", false, 1); himInCar = false; him.visible = false; updateWalkBtn();
  setTimeout(()=>{ him.visible = true; him.position.set(DOOR.x, groundH(DOOR.x,DOOR.z)+.6, DOOR.z-.2); him.rotation.y = 0; himWalk = 1; burst(new THREE.Vector3(DOOR.x, 2.5, DOOR.z+.3), 26, "#ffc070", false, 1.4);
    mcChat(GAME.blockworld.joined); achieve("finale"); }, 1600);
  setTimeout(()=>{ burst(new THREE.Vector3(DOOR.x, 2.2, DOOR.z+1.9), 36); for(let i=0;i<14;i++) lantern(DOOR.x+rnd(-6,6), rnd(1,3), DOOR.z+rnd(-6,6), true); hearts(30); fwCool=0; launchFireworks(10); }, 3400);
  setTimeout(()=>{
    const F=GAME.finale;
    openScene(`<div class="letter">
      <p class="chapter">${esc(GAME.door.place)}</p>
      <h3>You found every letter</h3>
      <p class="story">The five hidden words come together…</p>
      <div class="sentence">${GAME.chapters.map(c=>`<span>${esc(c.word)}</span>`).join("")}</div>
      <div id="after" hidden>
        ${F.photo ? `<div class="polaroid" style="width:220px;transform:rotate(2deg)"><div class="ph" style="aspect-ratio:3/4"><img src="${F.photo}" alt=""></div></div>` : ""}
        <div class="reveal"><p class="chapter">${esc(F.revealLabel)}</p><p class="big">${esc(F.revealDate)}</p></div>
        <h3>${esc(F.title)}, ${esc(GAME.herName)}</h3>
        <div class="body">${esc(F.text)}</div>
        <p class="hand" style="text-align:right;font-size:26px;line-height:1.2;color:var(--rose-deep);margin:0">${GAME.yourName.length > 30 ? "" : "— "}${esc(GAME.yourName)}</p>
        <div class="row" style="justify-content:center"><button class="btn ghost" id="stay" type="button">Take him for a drive 🚗💗</button></div>
      </div>
    </div>`);
    const words=sheet.querySelectorAll(".sentence span");
    words.forEach((w,k)=>setTimeout(()=>{ w.classList.add("in"); chime(mtof(72+[0,4,7,12,16][k]||0)); }, 500+k*550));
    setTimeout(()=>{ $("#after").hidden=false; hearts(50); const s=$("#stay"); if(s) s.onclick=()=>{ $("#scene").classList.add("off"); frozen=false; finaleOn=false; tagBox.classList.remove("off"); himInCar=true; driving=true; updateWalkBtn(); camYaw=C.heading+Math.PI;
      say("He’s riding with you now 💗 Take him for a drive!", 5000); honk(); }; }, 700+words.length*550);
  }, 6200);
}
let doorOpening = false, doorT = 0, himWalk = 0;

function hearts(n){
  if(reduce) return;
  const box=$("#hearts");
  for(let i=0;i<n;i++){
    const h=document.createElement("span"); h.className="heart"; h.textContent="♥";
    h.style.left=Math.random()*100+"%"; h.style.fontSize=(12+Math.random()*22)+"px"; h.style.opacity=.4+Math.random()*.6;
    h.style.animationDuration=(4+Math.random()*4)+"s"; h.style.animationDelay=(Math.random()*1.5)+"s";
    box.appendChild(h); setTimeout(()=>h.remove(),10000);
  }
}
