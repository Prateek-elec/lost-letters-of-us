// Shared helpers, renderer, lights, sky dome, terrain and water.

const $ = s => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(pointer: coarse)").matches;
if (isTouch) document.body.classList.add("touch");
const total = GAME.chapters.length;
const SAVE = "lost-letters-fairy";
let solved = [], wishCount = 0;
try { const s = JSON.parse(localStorage.getItem(SAVE) || "{}"); solved = s.solved || []; } catch(e) {}
function save(){ try { localStorage.setItem(SAVE, JSON.stringify({ solved })); } catch(e){} }

$("#title .for").textContent = "For " + GAME.herName;
$("#title .lede").textContent = GAME.lede;
$("#keys").textContent = isTouch ? "Push the joystick where you want to drive · hold ⚡ for turbo · tap ♥ to honk" : "WASD / arrows to drive · Shift for turbo · E or click to use things · M map · P for a Polaroid";
if (solved.length) $("#start").textContent = "Return to the island";

/* ============================ RENDERER ============================ */
const canvas = $("#gl");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference:"high-performance" }); }
catch(e){ $("#title .lede").textContent = "This browser can’t show the 3D island. Open the link in Chrome or Safari on a phone or computer."; $("#start").hidden = true; throw e; }
// starting sharpness; the frame loop lowers it step by step if the frame rate drops (see `quality` in loop.js)
let pixelRatio = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2("#241d4f", .006); // thinner during the intro fly-over, .013 while playing
const camera = new THREE.PerspectiveCamera(55, 1, .1, 600);
const timeU = { value: 0 }, windU = { value: .6 }, carU = { value: new THREE.Vector3(0,-99,0) };
const waterTimeU = { value: 0 };   // stays 0 (still water) for people who prefer reduced motion

// sky dome
const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite:false, fog:false,
  uniforms: { top:{value:new THREE.Color("#0d0b26")}, mid:{value:new THREE.Color("#2b2163")}, bottom:{value:new THREE.Color("#7a4f8e")},
    uMoon:{ value:new THREE.Vector3(-120,110,-200).normalize() } },
  vertexShader:`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  // gradient sky + two soft nebula bands (pink and blue) + a warm glow around the moon
  fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform vec3 uMoon; varying vec3 vP;
    void main(){ vec3 d = normalize(vP); float h = d.y; vec3 c = h > 0. ? mix(mid, top, smoothstep(0.,.55,h)) : mix(mid, bottom, smoothstep(0.,-.15,h));
    c = mix(c, bottom, smoothstep(.18,0.,abs(h))*.6);
    float b1 = exp(-pow((h - .3 - .12*sin(d.x*2.3 + d.z*1.7))*5., 2.)) * smoothstep(-.2,.6,sin(d.x*1.3 - d.z*2.1 + 1.));
    float b2 = exp(-pow((h - .55 + .1*cos(d.z*2.6 - d.x))*7., 2.)) * smoothstep(-.3,.7,cos(d.x*2. + d.z*.9));
    c += vec3(.38,.13,.36)*b1*.22 + vec3(.12,.2,.42)*b2*.16;
    float m = max(dot(d, uMoon), 0.); c += vec3(1.,.82,.62)*pow(m,24.)*.2 + vec3(.55,.42,.75)*pow(m,5.)*.07;
    gl_FragColor = vec4(c,1.); }`
}));
scene.add(sky);

// lights
const hemi = new THREE.HemisphereLight("#8f86e8", "#1d2a40", .85); scene.add(hemi);   // a touch brighter: small lamps are glows now, not lights
const moonLight = new THREE.DirectionalLight("#cfd6ff", .85);
moonLight.position.set(-30, 45, -40); moonLight.castShadow = true;
moonLight.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
// the shadow box follows her and only spans ±22 m along the moonlight (the light sits ~67 m away),
// so the big island doesn't make every object render twice
const shadowCam = moonLight.shadow.camera; shadowCam.left = shadowCam.bottom = -30; shadowCam.right = shadowCam.top = 30; shadowCam.near = 45; shadowCam.far = 90;
moonLight.shadow.bias = -.0008; moonLight.shadow.normalBias = .03;
scene.add(moonLight); scene.add(moonLight.target);
const warm = new THREE.DirectionalLight("#ffb7a8", .25); warm.position.set(30, 12, 25); scene.add(warm);

const M = (c, o={}) => new THREE.MeshStandardMaterial({ color:c, flatShading:true, roughness:.85, metalness:0, ...o });
const E = (c, i=1) => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i, flatShading:true, roughness:.6 });
function shadowy(o){ o.traverse(m=>{ if(m.isMesh){ m.castShadow = true; m.receiveShadow = true; } }); return o; }
// things that never move are listed here and merged into a few big meshes once the island is built (core/optimize.js)
const STATIC = [];

function glowTex(){
  const c=document.createElement("canvas"); c.width=c.height=128; const x=c.getContext("2d");
  const g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(.25,"rgba(255,255,255,.5)"); g.addColorStop(1,"rgba(255,255,255,0)");
  x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c);
}
function heartTex(){
  const c=document.createElement("canvas"); c.width=c.height=128; const x=c.getContext("2d");
  x.fillStyle="#fff"; x.translate(64,70); x.scale(4.2,4.2); x.beginPath();
  x.moveTo(0,11); x.bezierCurveTo(-14,1,-12,-11,-5,-11); x.bezierCurveTo(-2,-11,0,-8,0,-6); x.bezierCurveTo(0,-8,2,-11,5,-11); x.bezierCurveTo(12,-11,14,1,0,11); x.fill();
  return new THREE.CanvasTexture(c);
}
const GLOW = glowTex(), HEART = heartTex();
function sprite(color, size, opacity=1, map=GLOW){
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent:true, opacity, depthWrite:false, blending:THREE.AdditiveBlending }));
  s.scale.set(size,size,1); return s;
}
// A soft glow that stands in for a small lamp. Real point lights make EVERY pixel slower to draw,
// so lamps use this instead. It has an `intensity` like a light, so animated lamps keep working.
function glowLight(color, size, opacity){
  const s = sprite(color, size, opacity);
  Object.defineProperty(s, "intensity", { get(){ return s.material.opacity/opacity; }, set(v){ s.material.opacity = Math.min(1, v*opacity); } });
  return s;
}

/* ============================ TERRAIN ============================ */
// The island is 2× wider than the first version (WORLD_K was 1.5). The old island is now the
// central "meadow"; coastR0() is its old shoreline, which the ring road follows.
const WORLD_K = 3;
function coastR(a){ return WORLD_K*(20.5 + 1.6*Math.sin(3*a+.4) + 1.1*Math.sin(5*a+1.3) + .6*Math.sin(9*a)); }
function coastR0(a){ return coastR(a)*1.5/WORLD_K; }
const ringR = a => coastR0(a) + 2;
const PA = (a, r) => ({ x:Math.sin(a)*r, z:Math.cos(a)*r, a, r });
function smooth(e0,e1,x){ const t=Math.min(1,Math.max(0,(x-e0)/(e1-e0))); return t*t*(3-2*t); }

// new areas in the outer ring (angle, distance from the middle)
const HILL = PA(.9, 43), HILL_H = 5.5;              // Stargazer Hill
const LAGOON = { ...PA(2.3, 48.5), d:48.5, r:6.5 }; // Moon Lagoon (water + bridge); r = its radius
const FOREST = PA(3.3, 38);                         // Firefly Forest
const VILLAGE = PA(4.6, 44);                        // Fairy Village
const FALLS = { ...PA(1.62, 45), d:45, r:3.4 };     // Whispering Falls: pool centre (r = pool radius); cliff behind it
const FALLS_ROCK = PA(1.62, 50.5);                  // the rocky mound the water pours from
const LANT = PA(0.42, 44);                          // Lantern Meadow: release sky lanterns together
const BW = PA(5.34, 44);                            // ⛏️ Our Block World (the Minecraft corner)
const PIER = (()=>{ const a=6.0, R=coastR(a); return { a, dx:Math.sin(a), dz:Math.cos(a), u0:R*.88, u1:R+16, half:2, lane:1.2, h:.8 }; })();
const BRIDGE = { dx:Math.sin(LAGOON.a), dz:Math.cos(LAGOON.a), half:LAGOON.r+2.8, w:2, lane:1.15 };

function groundH(x,z){
  const r = Math.hypot(x,z), a = Math.atan2(x,z), R = coastR(a), rn = r / R;
  let base;
  if (rn < .84) base = .9;
  else if (rn < 1) base = .9 - smooth(.84,1,rn)*.85;
  else base = .05 - (rn-1)*14;
  const dh = Math.hypot(x-HILL.x, z-HILL.z), dv = Math.hypot(x-VILLAGE.x, z-VILLAGE.z), db = Math.hypot(x-BW.x, z-BW.z);
  const hills = (.75*Math.sin(x*.21+.5)*Math.cos(z*.17) + .35*Math.sin(x*.47+z*.31)) * smooth(.82,.55,rn) * smooth(3.5,8,r)
    * smooth(6,16,dh) * smooth(9,14,dv) * smooth(11,16,db);
  const dm = Math.hypot(x-FALLS_ROCK.x, z-FALLS_ROCK.z);
  let h = base + Math.max(hills, -.3) + HILL_H*Math.exp(-dh*dh/112) * smooth(1.02,.9,rn) + 3.2*Math.exp(-dm*dm/26) * smooth(1.04,.92,rn);
  const dl = Math.hypot(x-LAGOON.x, z-LAGOON.z);
  if (dl < LAGOON.r+2.5){ const lag = smooth(LAGOON.r+2.5, LAGOON.r-1, dl); h = h*(1-lag) - 1.3*lag; }
  const dp = Math.hypot(x-FALLS.x, z-FALLS.z);
  if (dp < FALLS.r+2.2){ const lag = smooth(FALLS.r+2.2, FALLS.r-.8, dp); h = h*(1-lag) - 1*lag; }
  return Math.max(h, -3);
}
function stepsH(x,z){ const r=Math.hypot(x-DOOR.x, z-DOOR.z); return r<2.75 ? .6 : r<3.55 ? .28 : 0; }
// walking height: the ground, the Last Door steps, or the lagoon bridge / pier deck when on them
function walkH(x,z){ return Math.max(groundH(x,z) + stepsH(x,z), bridgeH(x,z), pierH(x,z)); }
function isSand(x,z){ const r=Math.hypot(x,z); return r/coastR(Math.atan2(x,z)) > .86; }

const terrainGeo = new THREE.PlaneGeometry(150, 150, isTouch?130:200, isTouch?130:200); terrainGeo.rotateX(-Math.PI/2);
{
  const p = terrainGeo.attributes.position, col = [], c = new THREE.Color();
  const grassA = new THREE.Color("#2f6b6b"), grassB = new THREE.Color("#3f5795"), grassC = new THREE.Color("#5a7fa8"), sand = new THREE.Color("#a99a86"), wet = new THREE.Color("#5f5f8a"),
    lilac = new THREE.Color("#8a7fc4"), moss = new THREE.Color("#244f5e");
  for(let i=0;i<p.count;i++){
    const x=p.getX(i), z=p.getZ(i), h=groundH(x,z); p.setY(i,h);
    const r=Math.hypot(x,z), rn=r/coastR(Math.atan2(x,z));
    const n = .5+.5*Math.sin(x*.55+Math.cos(z*.4)*2)*Math.cos(z*.37);
    const dl = Math.hypot(x-LAGOON.x, z-LAGOON.z), df = Math.hypot(x-FOREST.x, z-FOREST.z);
    if (rn > .86) c.copy(sand).lerp(wet, smooth(.95,1.02,rn));
    else c.copy(grassA).lerp(grassB, n).lerp(grassC, Math.min(1, Math.max(0,h-.9)*.45)).lerp(lilac, smooth(3.5,6,h)*.6)
      .lerp(moss, smooth(16,8,df)*.7).lerp(sand, smooth(.8,.86,rn)*.6);
    if (dl < LAGOON.r+3) c.lerp(sand, smooth(LAGOON.r+3, LAGOON.r+1, dl)*.8).lerp(wet, smooth(LAGOON.r+1, LAGOON.r-1, dl));
    const dp = Math.hypot(x-FALLS.x, z-FALLS.z), dm = Math.hypot(x-FALLS_ROCK.x, z-FALLS_ROCK.z);
    if (dm < 7) c.lerp(wet, smooth(7, 3, dm)*.75);
    if (dp < FALLS.r+2) c.lerp(moss, smooth(FALLS.r+2, FALLS.r, dp)*.6);
    col.push(c.r,c.g,c.b);
  }
  terrainGeo.setAttribute("color", new THREE.Float32BufferAttribute(col,3));
  terrainGeo.computeVertexNormals();
}
const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ vertexColors:true, flatShading:true, roughness:.95 }));
terrain.receiveShadow = true; scene.add(terrain);

// water: the waves are moved on the graphics card (no per-frame work on the CPU), with moonlight glints
// and a soft sheen at grazing angles. Same wave formula as waveH() in outer-areas.js (lily pads float on it).
const waterGeo = new THREE.PlaneGeometry(260, 260, isTouch?70:100, isTouch?70:100); waterGeo.rotateX(-Math.PI/2);
const waterMat = new THREE.MeshStandardMaterial({ color:"#26337a", emissive:"#121a4a", emissiveIntensity:.6,
  roughness:.18, metalness:.55, flatShading:true, transparent:true, opacity:.92 });
waterMat.onBeforeCompile = sh => {
  sh.uniforms.uTime = waterTimeU; sh.uniforms.uMoonDir = { value: new THREE.Vector3(-120, 110, -200).normalize() };
  sh.vertexShader = "uniform float uTime;\nvarying vec3 vWPos;\n" + sh.vertexShader
    .replace("#include <begin_vertex>", `#include <begin_vertex>
      transformed.y += sin(position.x*.18+uTime*1.1)*.12 + cos(position.z*.22+uTime*.9)*.1 + sin((position.x+position.z)*.4+uTime*1.7)*.04;`)
    .replace("#include <project_vertex>", "#include <project_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.)).xyz;");
  sh.fragmentShader = "uniform vec3 uMoonDir;\nvarying vec3 vWPos;\n" + sh.fragmentShader
    .replace("#include <tonemapping_fragment>", `
      vec3 wn = normalize(cross(dFdx(vWPos), dFdy(vWPos))); if (wn.y < 0.) wn = -wn;
      vec3 vd = normalize(vWPos - cameraPosition), rf = reflect(vd, wn);
      float glint = pow(max(dot(rf, uMoonDir), 0.), 70.), sheen = pow(1. - max(dot(-vd, wn), 0.), 4.);
      gl_FragColor.rgb += vec3(1., .9, .72) * glint * 1.4 + vec3(.42, .34, .7) * sheen * .3;
      #include <tonemapping_fragment>`);
};
const water = new THREE.Mesh(waterGeo, waterMat);
water.position.y = -.15; water.receiveShadow = true; water.frustumCulled = false; scene.add(water);
const farSea = new THREE.Mesh(new THREE.RingGeometry(120, 900, 48, 1), new THREE.MeshStandardMaterial({ color:"#26337a", emissive:"#121a4a", emissiveIntensity:.6, roughness:.25, metalness:.5 }));
farSea.rotation.x = -Math.PI/2; farSea.position.y = -.2; scene.add(farSea);
// moon reflection
const moonPath = sprite("#ffe9c4", 1, .22); moonPath.scale.set(16, 70, 1); scene.add(moonPath);
