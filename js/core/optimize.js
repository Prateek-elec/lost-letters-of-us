// Performance: once the island is built, merge the hundreds of small objects that never move
// (mushrooms, crystals, beach rocks, stepping stones, meadow trees — everything listed in STATIC)
// into a few big meshes, one per look. The graphics card then draws ~30 things instead of ~600.
// The original pieces are only hidden (not deleted), so colliders and camera checks keep working.

function mergeStatic(roots){
  scene.updateMatrixWorld(true);
  const buckets = new Map();
  roots.forEach(root => root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.visible) return;
    const m = o.material;
    if (!m.isMeshStandardMaterial || m.map || m.transparent) return;
    const key = [m.color.getHex(), m.emissive.getHex(), m.emissiveIntensity, m.roughness, m.metalness, m.flatShading, m.side, o.castShadow, o.receiveShadow].join("|");
    let b = buckets.get(key); if (!b){ b = { mat:m, list:[] }; buckets.set(key, b); }
    b.list.push(o);
  }));
  let hidden = 0, made = 0;
  buckets.forEach(b => {
    if (b.list.length < 2) return;
    const parts = b.list.map(o => { const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld); return g; });
    const n = parts.reduce((s,g) => s + g.attributes.position.count, 0), pos = new Float32Array(n*3), nor = new Float32Array(n*3);
    let k = 0;
    parts.forEach(g => { pos.set(g.attributes.position.array, k*3); if (g.attributes.normal) nor.set(g.attributes.normal.array, k*3); k += g.attributes.position.count; g.dispose(); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, b.mat);
    mesh.castShadow = b.list[0].castShadow; mesh.receiveShadow = b.list[0].receiveShadow; mesh.matrixAutoUpdate = false;
    scene.add(mesh); made++;
    b.list.forEach(o => { o.visible = false; hidden++; });
  });
  return { hidden, made };
}
const mergedStatic = mergeStatic(STATIC);

// Objects that DO move as a whole (the car, flower pots, gift boxes) or simply have many little parts
// (the gallery board, benches, the map table…) are merged INSIDE their own group: every lit part becomes
// one mesh (colours kept per vertex) and every glowing part another, so the group still moves, wobbles
// and gets knocked over exactly as before. Parts with `userData.dynamic` (animated bits) are left alone.
function mergeLocal(group){
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert(), lit = [], glow = [], c = new THREE.Color();
  let cast = false;
  group.traverse(o => {
    if (o === group || !o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.visible) return;
    for (let p = o; p && p !== group; p = p.parent) if (p.userData.dynamic) return;
    const m = o.material;
    if (!m.isMeshStandardMaterial || m.map || m.transparent || m.side === THREE.DoubleSide) return;
    const glowing = m.emissiveIntensity > .4 && m.emissive.getHex() !== 0;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone());
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    c.copy(glowing ? m.emissive : m.color); if (glowing) c.multiplyScalar(Math.min(1.6, .55 + m.emissiveIntensity*.5));
    (glowing ? glow : lit).push({ g, r:c.r, gg:c.g, b:c.b, flat:m.flatShading, rough:m.roughness, metal:m.metalness });
    cast = cast || o.castShadow; o.visible = false;
  });
  const build = (list, makeMat) => {
    if (!list.length) return;
    const n = list.reduce((s,p) => s + p.g.attributes.position.count, 0), pos = new Float32Array(n*3), nor = new Float32Array(n*3), col = new Float32Array(n*3);
    let k = 0;
    list.forEach(p => { const cnt=p.g.attributes.position.count; pos.set(p.g.attributes.position.array, k*3); if (p.g.attributes.normal) nor.set(p.g.attributes.normal.array, k*3);
      for (let i=0;i<cnt;i++){ col[(k+i)*3]=p.r; col[(k+i)*3+1]=p.gg; col[(k+i)*3+2]=p.b; } k += cnt; p.g.dispose(); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos,3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor,3)); geo.setAttribute("color", new THREE.BufferAttribute(col,3));
    const mesh = new THREE.Mesh(geo, makeMat(list[0])); mesh.castShadow = cast; mesh.receiveShadow = true; group.add(mesh);
  };
  build(lit,  p => new THREE.MeshStandardMaterial({ vertexColors:true, flatShading:p.flat, roughness:p.rough, metalness:p.metal }));
  build(glow, () => new THREE.MeshBasicMaterial({ vertexColors:true }));
}
// mark the animated bits so they stay separate
carBody.userData.balloon.userData.dynamic = true;
hillStar.userData.dynamic = true; fountainHeart.userData.dynamic = true;
lantPaper.forEach(p => p.userData.dynamic = true); floatLanterns.forEach(l => l.userData.dynamic = true);
[carBody, galG, mapG, hillG, lantG, lagoonG, villageG, pierG, ...props.map(p => p.mesh)].forEach(mergeLocal);
scene.children.forEach(o => { if (o.isGroup && o.userData.bench) mergeLocal(o); });
