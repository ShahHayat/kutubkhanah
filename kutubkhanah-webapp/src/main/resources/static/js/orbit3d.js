/*
 * Home page hero: a slowly turning ring of the catalog's books around an open book.
 * Ported from the "Kutub Khanah — Storefront" design. Loaded as an ES module (see the import map in layout.html).
 * Exposes window.KK3D.mountOrbit(canvas, books, onHover, opts) → { dispose }
 */
import * as THREE from 'three';

const SERIF = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const FOIL = '#E4C47F';

function mountOrbit(canvas, BOOKS, onHover, opts) {
  opts = opts || {};
  if (!canvas || !BOOKS || !BOOKS.length) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  const host = canvas.parentElement;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  let seed = 11;
  function rnd() { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toTex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; }
  function radial(stops, size) { const c = mk(size, size), g = c.getContext('2d'); const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach((s) => gr.addColorStop(s[0], s[1])); g.fillStyle = gr; g.fillRect(0, 0, size, size); return c; }

  function paintSpine(c, b, mr) {
    const W = c.width, H = c.height, g = c.getContext('2d');
    const foil = mr ? 'rgb(0,70,215)' : FOIL;
    g.fillStyle = mr ? 'rgb(0,215,0)' : b.cloth; g.fillRect(0, 0, W, H);
    if (!mr) {
      for (let x = 0; x < W; x += 2) { g.fillStyle = 'rgba(255,240,215,' + (0.012 + rnd() * 0.022) + ')'; g.fillRect(x, 0, 1, H); }
      for (let y = 0; y < H; y += 3) { g.fillStyle = 'rgba(0,0,0,' + (0.025 + rnd() * 0.035) + ')'; g.fillRect(0, y, W, 1); }
      const s = g.createLinearGradient(0, 0, W, 0);
      s.addColorStop(0, 'rgba(0,0,0,0.5)'); s.addColorStop(0.2, 'rgba(0,0,0,0.05)'); s.addColorStop(0.5, 'rgba(255,236,200,0.08)'); s.addColorStop(0.8, 'rgba(0,0,0,0.05)'); s.addColorStop(1, 'rgba(0,0,0,0.5)');
      g.fillStyle = s; g.fillRect(0, 0, W, H);
    }
    g.fillStyle = foil;
    const lw = Math.max(2, Math.round(W * 0.016));
    [0.04, 0.052, 0.948 - lw / H, 0.96 - lw / H].forEach((p) => g.fillRect(W * 0.12, Math.round(H * p), W * 0.76, lw));
    const d = W * 0.075; g.save(); g.translate(W / 2, H * 0.095); g.rotate(Math.PI / 4); g.fillRect(-d / 2, -d / 2, d, d); g.restore();
    g.save(); g.translate(W / 2, H * 0.5); g.rotate(Math.PI / 2);
    let fs = Math.round(W * 0.44);
    g.font = 'italic 500 ' + fs + 'px ' + SERIF;
    while (g.measureText(b.title).width > H * 0.66 && fs > 8) { fs -= 2; g.font = 'italic 500 ' + fs + 'px ' + SERIF; }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(b.title, 0, fs * 0.05);
    g.restore();
    g.font = '500 ' + Math.round(W * 0.14) + 'px ' + MONO; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(b.code, W / 2, H * 0.895);
  }
  function edgeCanvas(vertical) {
    const c = mk(512, 512), g = c.getContext('2d');
    g.fillStyle = '#ECE1C7'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) { g.fillStyle = 'rgba(120,96,60,' + (0.05 + rnd() * 0.13) + ')'; if (vertical) g.fillRect(i, 0, 1, 512); else g.fillRect(0, i, 512, 1); }
    return c;
  }
  function pageCanvas() {
    const W = 1024, H = 1412, c = mk(W, H), g = c.getContext('2d');
    g.fillStyle = '#F2E8D0'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 12000; i++) { g.fillStyle = 'rgba(120,90,50,' + (rnd() * 0.05) + ')'; g.fillRect(rnd() * W, rnd() * H, 1.6, 1.6); }
    const s = g.createLinearGradient(0, 0, W * 0.3, 0);
    s.addColorStop(0, 'rgba(70,45,15,0.5)'); s.addColorStop(0.35, 'rgba(70,45,15,0.12)'); s.addColorStop(1, 'rgba(70,45,15,0)');
    g.fillStyle = s; g.fillRect(0, 0, W * 0.3, H);
    const e = g.createLinearGradient(W * 0.88, 0, W, 0); e.addColorStop(0, 'rgba(90,60,25,0)'); e.addColorStop(1, 'rgba(90,60,25,0.16)'); g.fillStyle = e; g.fillRect(W * 0.88, 0, W * 0.12, H);
    const cx = W * 0.56;
    g.fillStyle = 'rgba(96,70,38,0.6)';
    g.save(); g.translate(cx, 168); g.rotate(Math.PI / 4); g.fillRect(-8, -8, 16, 16); g.restore();
    g.fillRect(cx - 110, 167, 80, 2); g.fillRect(cx + 30, 167, 80, 2);
    const L = 180, R = 930; let y = 262, indent = true;
    g.fillStyle = 'rgba(78,58,32,0.40)';
    while (y < H - 150) {
      let x = indent ? L + 54 : L;
      const short = rnd() < 0.13;
      const end = short ? L + (R - L) * (0.3 + rnd() * 0.45) : R;
      while (x < end - 24) { const w = Math.min(20 + rnd() * 84, end - x); g.fillRect(x, y, w, 10); x += w + 14; }
      indent = short; y += short ? 68 : 44;
    }
    return c;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.background = new THREE.Color(0x0a0806);
  function panel(w, h, x, y, z, k, col) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); }
  panel(8, 4, 0, 7, 5, 5, 0xffe3b5); panel(4, 6, -8, 2, -1, 1.6, 0xb9c6ff); panel(5, 5, 7, 1, 6, 3, 0xffcf8f); panel(10, 2, 0, -3, 6, 0.6, 0xffd9a8);
  const envRT = pm.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;

  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x120d08, 0.45));
  const key = new THREE.DirectionalLight(0xffe0b0, 2.0); key.position.set(4, 8, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb2ff, 0.8); rim.position.set(-7, 3, -6); scene.add(rim);
  const glowL = new THREE.PointLight(0xffc27a, 4, 7, 2); glowL.position.set(0, 0.9, 0); scene.add(glowL);

  const world = new THREE.Group(); scene.add(world);
  world.rotation.z = -0.035;
  const ring = new THREE.Group(); world.add(ring);
  const R = 3.35, BASE = -0.6;

  const pagesMat = new THREE.MeshStandardMaterial({ map: toTex(edgeCanvas(true), true), color: 0x9e988c, roughness: 0.92, metalness: 0, envMapIntensity: 0.35 });
  const bookMeshes = [];
  BOOKS.forEach((b, i) => {
    const thick = 0.27 + rnd() * 0.11, h = 1.02 + rnd() * 0.26, depth = 0.74 + rnd() * 0.08;
    const cw = 192, ch = Math.min(2048, Math.round(cw * h / thick));
    const cc = mk(cw, ch), mr = mk(cw, ch);
    paintSpine(cc, b, false); paintSpine(mr, b, true);
    const mapT = toTex(cc, true), mrT = toTex(mr, false);
    const spineMat = new THREE.MeshStandardMaterial({ map: mapT, roughnessMap: mrT, metalnessMap: mrT, roughness: 1, metalness: 1, envMapIntensity: 1.15 });
    const cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.cloth), roughness: 0.8, metalness: 0, envMapIntensity: 0.6 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(thick, h, depth), [cloth, cloth, pagesMat, pagesMat, spineMat, pagesMat]);
    const a = (i / BOOKS.length) * Math.PI * 2;
    mesh.position.set(Math.sin(a) * R, BASE + h / 2, Math.cos(a) * R);
    mesh.rotation.y = a; mesh.rotation.z = (rnd() - 0.5) * 0.05;
    mesh.userData = { b, baseY: BASE + h / 2, lift: 0, cc, mr, mapT, mrT };
    ring.add(mesh); bookMeshes.push(mesh);
  });

  function torus(r, tube, op, arc) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 400, arc || Math.PI * 2), new THREE.MeshBasicMaterial({ color: 0xC9A86A, transparent: true, opacity: op, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.y = BASE; world.add(m); return m; }
  torus(R, 0.007, 0.5); torus(2.15, 0.004, 0.2); torus(R + 1.0, 0.0045, 0.2);
  const arc = torus(R + 1.0, 0.009, 0.75, Math.PI * 1.35);
  const dotsN = 180, dp = new Float32Array(dotsN * 3);
  for (let k = 0; k < dotsN; k++) { const aa = k / dotsN * Math.PI * 2; dp[k * 3] = Math.cos(aa) * (R + 0.5); dp[k * 3 + 1] = BASE; dp[k * 3 + 2] = Math.sin(aa) * (R + 0.5); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dotTex = toTex(radial([[0, 'rgba(255,236,190,1)'], [0.25, 'rgba(255,214,140,0.55)'], [1, 'rgba(255,200,120,0)']], 64), true);
  world.add(new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.05, map: dotTex, color: 0xC9A86A, transparent: true, opacity: 0.6, depthWrite: false })));
  const nodes = new THREE.Group(); world.add(nodes);
  [0, 1, 2, 3].forEach((q) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xF1D9A0 })); const a2 = q * Math.PI / 2; s.position.set(Math.cos(a2) * (R + 1.0), BASE, Math.sin(a2) * (R + 1.0)); nodes.add(s); });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: toTex(radial([[0, 'rgba(214,176,110,0.34)'], [0.3, 'rgba(214,176,110,0.09)'], [0.7, 'rgba(214,176,110,0)']], 512), true), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = BASE - 0.004; world.add(floor);

  // The open book in the middle, with a page that turns every few seconds.
  const book = new THREE.Group(); world.add(book);
  const bookY = BASE + 0.22;
  book.position.set(0, bookY, 0);
  const PW = 1.42, PD = 1.96, PT = 0.14, N = 48, M = 10;
  function f(u) { return 0.32 * (1 - Math.exp(-u * 5.2)) - 0.06 * u * u; }
  function th(u) { const x = Math.min(1, u / 0.16); return PT * x * x * (3 - 2 * x); }
  const paperMat = new THREE.MeshStandardMaterial({ map: toTex(pageCanvas(), true), roughness: 0.95, side: THREE.DoubleSide, envMapIntensity: 0.35 });
  const edgeMat = new THREE.MeshStandardMaterial({ map: toTex(edgeCanvas(false), true), roughness: 0.95, side: THREE.DoubleSide, envMapIntensity: 0.35 });
  const boardMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#5A1F1B'), roughness: 0.72, side: THREE.DoubleSide, envMapIntensity: 0.7 });
  function grid(nu, nv, fn) {
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const r = fn(i / nu, j / nv); pos.push(r[0], r[1], r[2]); uv.push(r[3], r[4]); }
    for (let j2 = 0; j2 < nv; j2++) for (let i2 = 0; i2 < nu; i2++) { const a = j2 * (nu + 1) + i2, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  [1, -1].forEach((s) => {
    book.add(new THREE.Mesh(grid(N, M, (u, v) => [s * u * PW, f(u), PD / 2 - v * PD, u, v]), paperMat));
    [PD / 2, -PD / 2].forEach((z) => { book.add(new THREE.Mesh(grid(N, 1, (u, v) => [s * u * PW, f(u) - v * th(u), z, u, 1 - v * 0.25]), edgeMat)); });
    book.add(new THREE.Mesh(grid(M, 1, (u, v) => [s * PW, f(1) - v * PT, PD / 2 - u * PD, u, 1 - v * 0.25]), edgeMat));
    book.add(new THREE.Mesh(grid(N, 1, (u, v) => { const uu = Math.min(u * 1.04, 1); const x = u * 1.04 * PW; return [s * x, f(uu) - th(uu) - 0.02, (PD / 2 + 0.05) - v * (PD + 0.1), u, v]; }), boardMat));
  });
  const sheetGeo = grid(N, M, (u, v) => [u * PW, f(u), PD / 2 - v * PD, u, v]);
  const sheet = new THREE.Mesh(sheetGeo, paperMat); sheet.visible = false; book.add(sheet);
  const sp = sheetGeo.attributes.position;
  const th0 = Math.atan2(f(1), PW);
  function bendSheet(p) {
    const t0 = th0 + (Math.PI - 2 * th0) * p, c = 1.2 * Math.sin(Math.PI * p);
    let x = 0, y = 0.006; const ds = PW / N, xs = [0], ys = [y];
    for (let i = 0; i < N; i++) { const a = t0 - c * Math.pow(i / N, 1.3); x += Math.cos(a) * ds; y += Math.sin(a) * ds; xs.push(x); ys.push(y); }
    for (let j = 0; j <= M; j++) for (let i2 = 0; i2 <= N; i2++) { const kk = j * (N + 1) + i2; sp.setX(kk, xs[i2]); sp.setY(kk, ys[i2]); }
    sp.needsUpdate = true; sheetGeo.computeVertexNormals();
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: toTex(radial([[0, 'rgba(255,214,150,0.5)'], [0.28, 'rgba(255,190,110,0.14)'], [1, 'rgba(255,180,100,0)']], 256), true), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(5.2, 5.2, 1); glow.position.set(0, BASE + 0.95, 0); world.add(glow);

  // Dust motes drifting up through the light.
  const NP = opts.motes || 560, ppos = new Float32Array(NP * 3), pv = new Float32Array(NP), pa = new Float32Array(NP), pr = new Float32Array(NP);
  for (let q = 0; q < NP; q++) { const near = q < NP * 0.4; pr[q] = near ? Math.sqrt(rnd()) * 1.3 : 0.8 + Math.sqrt(rnd()) * 3.6; pa[q] = rnd() * Math.PI * 2; ppos[q * 3 + 1] = BASE + rnd() * 4.8; pv[q] = 0.05 + rnd() * (near ? 0.3 : 0.12); }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  world.add(new THREE.Points(pgeo, new THREE.PointsMaterial({ size: 0.065, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd79a, opacity: 0.9 })));
  function stepMotes(dt) {
    for (let q2 = 0; q2 < NP; q2++) {
      let yy = ppos[q2 * 3 + 1] + pv[q2] * dt; if (yy > BASE + 4.8) yy = BASE + 0.1;
      pa[q2] += dt * 0.05 * (1.6 - Math.min(pr[q2], 1.6) * 0.5);
      ppos[q2 * 3] = Math.cos(pa[q2]) * pr[q2]; ppos[q2 * 3 + 1] = yy; ppos[q2 * 3 + 2] = Math.sin(pa[q2]) * pr[q2];
    }
    pgeo.attributes.position.needsUpdate = true;
  }
  stepMotes(0);

  let W0 = 0, H0 = 0, dist = 15.8;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || (w === W0 && h === H0)) return;
    W0 = w; H0 = h; renderer.setSize(w, h, false); camera.aspect = w / h;
    dist = 15.8 * Math.max(1, 1.1 / camera.aspect);
    camera.updateProjectionMatrix();
  }
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, inside: false };
  function onMove(e) { const r = canvas.getBoundingClientRect(); ptr.cx = (e.clientX - r.left) / r.width * 2 - 1; ptr.cy = -((e.clientY - r.top) / r.height * 2 - 1); ptr.tx = ptr.cx; ptr.ty = ptr.cy; ptr.inside = true; }
  function onLeave() { ptr.tx = 0; ptr.ty = 0; ptr.inside = false; }
  canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave);
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let hovered = null;
  const reduce = !!opts.still || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const look = new THREE.Vector3(0, BASE + 0.4, 0);
  let t = 1.2, speed = 0.075, raf = 0, last = 0, visible = true;
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function update(dt) {
    t += dt;
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 2.5); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 2.5);
    const el = 0.31 + ptr.y * 0.05, az = ptr.x * 0.16;
    camera.position.set(Math.sin(az) * dist * Math.cos(el), look.y + Math.sin(el) * dist, Math.cos(az) * dist * Math.cos(el));
    camera.lookAt(look);
    if (ptr.inside) {
      v2.set(ptr.cx, ptr.cy); ray.setFromCamera(v2, camera);
      const hit = ray.intersectObjects(bookMeshes, false)[0], m = hit ? hit.object : null;
      if (m !== hovered) { hovered = m; canvas.style.cursor = m ? 'pointer' : ''; if (onHover) onHover(m ? m.userData.b : null); }
    } else if (hovered) { hovered = null; canvas.style.cursor = ''; if (onHover) onHover(null); }
    const target = hovered ? 0.008 : 0.075; speed += (target - speed) * Math.min(1, dt * 3);
    ring.rotation.y += dt * speed;
    bookMeshes.forEach((mm) => { const u = mm.userData; const lt = mm === hovered ? 0.22 : 0; u.lift += (lt - u.lift) * Math.min(1, dt * 6); mm.position.y = u.baseY + u.lift; });
    arc.rotation.z = -t * 0.12; nodes.rotation.y = t * 0.05;
    book.position.y = bookY + Math.sin(t * 0.9) * 0.025; book.rotation.y = Math.sin(t * 0.25) * 0.06;
    const cyc = t % 5.6, dur = 1.9;
    if (cyc < dur) { sheet.visible = true; bendSheet(ease(cyc / dur)); } else sheet.visible = false;
    stepMotes(dt);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    resize();
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
    update(dt);
    renderer.render(scene, camera);
  }
  function still() { resize(); update(0); sheet.visible = true; bendSheet(0.42); renderer.render(scene, camera); }
  let io = null;
  if (window.IntersectionObserver) { io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; last = 0; }); io.observe(canvas); }
  let ro = null;
  if (reduce) {
    still();
    if (window.ResizeObserver) { ro = new ResizeObserver(still); ro.observe(host); }
    canvas.addEventListener('pointermove', still);
  } else raf = requestAnimationFrame(frame);
  function repaint() { bookMeshes.forEach((mm) => { const u = mm.userData; paintSpine(u.cc, u.b, false); paintSpine(u.mr, u.b, true); u.mapT.needsUpdate = true; u.mrT.needsUpdate = true; }); if (reduce) still(); }
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('italic 500 40px "Cormorant Garamond"'), document.fonts.load('500 20px "JetBrains Mono"')]).then(repaint, () => {});

  return {
    hovered: () => (hovered ? hovered.userData.b : null),
    dispose() {
      cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect();
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('pointermove', still);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach((mt) => { ['map', 'roughnessMap', 'metalnessMap'].forEach((kk) => { if (mt[kk]) mt[kk].dispose(); }); mt.dispose(); }); });
      envRT.dispose(); pm.dispose(); renderer.dispose();
    }
  };
}

window.KK3D = Object.assign(window.KK3D || {}, { mountOrbit });
