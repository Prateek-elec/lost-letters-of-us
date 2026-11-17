// Bloom and post-processing.

/* ============================ POST FX ============================ */
let composer = null, bloomOn = false;
function setupComposer(){
  if (!THREE.EffectComposer || !THREE.UnrealBloomPass) return;
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bp = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isTouch ? .55 : .65, .45, .86);
  composer.addPass(bp);
  // a gentle cinematic grade: plum in the shadows, a little richer colour, a soft vignette at the edges
  if (THREE.ShaderPass) composer.addPass(new THREE.ShaderPass({
    uniforms: { tDiffuse:{ value:null }, uVig:{ value:.32 } },
    vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`uniform sampler2D tDiffuse; uniform float uVig; varying vec2 vUv;
      void main(){ vec4 t = texture2D(tDiffuse, vUv); vec3 c = t.rgb; float l = dot(c, vec3(.299,.587,.114));
        c += vec3(.03, 0., .028) * (1. - smoothstep(0., .5, l));        // plum shadows
        c = mix(vec3(l), c, 1.1);                                        // +10% colour
        c = (c - .5) * 1.04 + .5;                                         // a touch of contrast
        c *= mix(1., smoothstep(.95, .3, distance(vUv, vec2(.5))), uVig); // soft vignette
        gl_FragColor = vec4(c, t.a); }` }));
  bloomOn = true;
}
try { setupComposer(); } catch(e){ composer = null; }
