/*
 * Book page: a hardcover you can drag to turn. Ported from the "Kutub Khanah — Storefront" design.
 * Loaded as an ES module (see the import map in layout.html).
 * Exposes window.KK3D.mountBook(canvas, book) → { dispose }
 */
import * as THREE from 'three';

const SERIF = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const URDU = '"Gulzar", "Noto Nastaliq Urdu", serif';
const FOIL = '#E4C47F';

function mountBook(canvas, b, opts) {
  opts = opts || {};
  if (!canvas || !b) return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  const host = canvas.parentElement;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  const aniso = renderer.capabilities.getMaxAnisotropy();
  let seed = 5;
  function rnd() { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toTex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; }
  function radial(stops, size) { const c = mk(size, size), g = c.getContext('2d'); const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach((s) => gr.addColorStop(s[0], s[1])); g.fillStyle = gr; g.fillRect(0, 0, size, size); return c; }
  function cloth(g, W, H, mr, col) {
    g.fillStyle = mr ? 'rgb(0,205,0)' : col; g.fillRect(0, 0, W, H);
    if (mr) return;
    for (let x = 0; x < W; x += 2) { g.fillStyle = 'rgba(255,240,215,' + (0.01 + rnd() * 0.02) + ')'; g.fillRect(x, 0, 1, H); }
    for (let y = 0; y < H; y += 2) { g.fillStyle = 'rgba(0,0,0,' + (0.02 + rnd() * 0.03) + ')'; g.fillRect(0, y, W, 1); }
    const v = g.createRadialGradient(W / 2, H * 0.45, W * 0.2, W / 2, H / 2, W * 0.95);
    v.addColorStop(0, 'rgba(255,240,210,0.05)'); v.addColorStop(1, 'rgba(0,0,0,0.38)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
  function spaced(g, text, x, y, sp) { let w = 0, i; for (i = 0; i < text.length; i++) w += g.measureText(text[i]).width + (i < text.length - 1 ? sp : 0); let cx = x - w / 2; g.textAlign = 'left'; for (i = 0; i < text.length; i++) { g.fillText(text[i], cx, y); cx += g.measureText(text[i]).width + sp; } }
  function wrap(g, text, maxW) { const words = String(text || '').split(' '), lines = []; let cur = ''; words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function diamond(g, x, y, d) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-d / 2, -d / 2, d, d); g.restore(); }
  function paintCover(c, mr) {
    const W = c.width, H = c.height, g = c.getContext('2d');
    cloth(g, W, H, mr, b.cloth);
    const foil = mr ? 'rgb(0,70,215)' : FOIL; g.fillStyle = foil; g.strokeStyle = foil;
    g.lineWidth = 5; g.strokeRect(70, 70, W - 140, H - 140);
    g.lineWidth = 2; g.strokeRect(92, 92, W - 184, H - 184);
    [[92, 92], [W - 92, 92], [92, H - 92], [W - 92, H - 92]].forEach((p) => diamond(g, p[0], p[1], 18));
    g.textBaseline = 'middle';
    g.font = '500 30px ' + MONO; spaced(g, 'N° ' + b.code, W / 2, 200, 9);
    let fs = 150; g.font = '500 ' + fs + 'px ' + SERIF;
    let lines = wrap(g, b.title, 720);
    while ((lines.length > 3 || lines.some((l) => g.measureText(l).width > 740)) && fs > 70) { fs -= 6; g.font = '500 ' + fs + 'px ' + SERIF; lines = wrap(g, b.title, 720); }
    const lh = fs * 1.02, top = H * 0.47 - (lines.length - 1) * lh / 2;
    diamond(g, W / 2, top - fs * 0.95, 16); g.fillRect(W / 2 - 120, top - fs * 0.95 - 1.5, 80, 3); g.fillRect(W / 2 + 40, top - fs * 0.95 - 1.5, 80, 3);
    g.textAlign = 'center';
    lines.forEach((l, i) => g.fillText(l, W / 2, top + i * lh));
    const after = top + (lines.length - 1) * lh + fs * 0.85;
    g.fillRect(W / 2 - 60, after, 120, 3);
    g.font = 'italic 500 60px ' + SERIF; g.fillText(b.author || '', W / 2, after + 80);
    g.direction = 'rtl'; g.font = '68px ' + URDU; g.textAlign = 'center'; g.fillText('کتب خانہ', W / 2, H - 250); g.direction = 'ltr';
    g.font = '500 22px ' + MONO; spaced(g, 'KUTUB KHANAH', W / 2, H - 165, 10);
  }
  function paintBack(c, mr) {
    const W = c.width, H = c.height, g = c.getContext('2d');
    cloth(g, W, H, mr, b.cloth);
    const foil = mr ? 'rgb(0,70,215)' : FOIL; g.fillStyle = foil; g.strokeStyle = foil;
    g.lineWidth = 2; g.strokeRect(92, 92, W - 184, H - 184);
    g.textBaseline = 'middle';
    diamond(g, W / 2, 260, 16);
    g.font = 'italic 500 48px ' + SERIF; g.textAlign = 'center';
    wrap(g, b.description || '', 700).slice(0, 12).forEach((l, i) => g.fillText(l, W / 2, 360 + i * 64));
    g.font = '500 26px ' + MONO; spaced(g, b.code, W / 2, H - 230, 12);
    g.fillRect(W / 2 - 110, H - 190, 220, 2);
  }
  function paintSpine(c, mr) {
    const W = c.width, H = c.height, g = c.getContext('2d');
    cloth(g, W, H, mr, b.cloth);
    if (!mr) { const s = g.createLinearGradient(0, 0, W, 0); s.addColorStop(0, 'rgba(0,0,0,0.35)'); s.addColorStop(0.5, 'rgba(255,236,200,0.06)'); s.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = s; g.fillRect(0, 0, W, H); }
    const foil = mr ? 'rgb(0,70,215)' : FOIL; g.fillStyle = foil;
    [0.035, 0.045, 0.952, 0.962].forEach((p) => g.fillRect(W * 0.14, H * p, W * 0.72, 4));
    diamond(g, W / 2, H * 0.085, 16);
    g.save(); g.translate(W / 2, H * 0.47); g.rotate(Math.PI / 2);
    let fs = 96; g.font = 'italic 500 ' + fs + 'px ' + SERIF;
    while (g.measureText(b.title).width > H * 0.56 && fs > 30) { fs -= 3; g.font = 'italic 500 ' + fs + 'px ' + SERIF; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.title, 0, 4);
    g.restore();
    g.save(); g.translate(W / 2, H * 0.84); g.rotate(Math.PI / 2); g.font = '500 30px ' + MONO; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.code, 0, 0); g.restore();
  }
  function edgeCanvas(vertical) { const c = mk(512, 512), g = c.getContext('2d'); g.fillStyle = '#EDE3CB'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 512; i += 2) { g.fillStyle = 'rgba(120,96,60,' + (0.04 + rnd() * 0.12) + ')'; if (vertical) g.fillRect(i, 0, 1, 512); else g.fillRect(0, i, 512, 1); } return c; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.background = new THREE.Color(0x0a0806);
  function panel(w, h, x, y, z, k, col) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); }
  panel(8, 3, 2, 7, 6, 5, 0xffe3b5); panel(3, 7, -8, 1, 2, 1.8, 0xb9c6ff); panel(4, 6, 7, 0, 5, 3.2, 0xffcf8f); panel(12, 1.5, 0, -2, 7, 0.8, 0xffd9a8);
  const envRT = pm.fromScene(envScene, 0.03); scene.environment = envRT.texture;
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x120d08, 0.4));
  const key = new THREE.DirectionalLight(0xffe2b8, 1.7); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xa8b8ff, 1.1); rim.position.set(-6, 3, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffd29a, 0.4); fill.position.set(-4, -1, 6); scene.add(fill);

  const BW = 2.0, BH = 3.0, BT = 0.5, bt = 0.045;
  const book = new THREE.Group(); scene.add(book);
  const jobs = [];
  function texPair(w, h, painter) { const c = mk(w, h), m = mk(w, h); painter(c, false); painter(m, true); const ct = toTex(c, true), mt = toTex(m, false); jobs.push(() => { painter(c, false); painter(m, true); ct.needsUpdate = true; mt.needsUpdate = true; }); return [ct, mt]; }
  const front = texPair(1024, 1536, paintCover), back = texPair(1024, 1536, paintBack), spine = texPair(256, 1536, paintSpine);
  function foilMat(p) { return new THREE.MeshStandardMaterial({ map: p[0], roughnessMap: p[1], metalnessMap: p[1], roughness: 1, metalness: 1, envMapIntensity: 1.2 }); }
  const clothMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.cloth), roughness: 0.8, envMapIntensity: 0.6 });
  const endMat = new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.9, envMapIntensity: 0.4 });
  const edgeV = new THREE.MeshStandardMaterial({ map: toTex(edgeCanvas(true), true), color: 0xd8ccb4, roughness: 0.92, envMapIntensity: 0.4 });
  const edgeH = new THREE.MeshStandardMaterial({ map: toTex(edgeCanvas(false), true), color: 0xd8ccb4, roughness: 0.92, envMapIntensity: 0.4 });
  const fb = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, bt), [clothMat, clothMat, clothMat, clothMat, foilMat(front), endMat]);
  fb.position.z = BT / 2 - bt / 2; book.add(fb);
  const bb = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, bt), [clothMat, clothMat, clothMat, clothMat, endMat, foilMat(back)]);
  bb.position.z = -BT / 2 + bt / 2; book.add(bb);
  const spm = new THREE.Mesh(new THREE.CylinderGeometry(BT / 2, BT / 2, BH, 48, 1, true, Math.PI, Math.PI), foilMat(spine));
  spm.position.x = -BW / 2; book.add(spm);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.07, BH - 0.1, BT - 2 * bt), [edgeV, edgeH, edgeH, edgeH, endMat, endMat]);
  pages.position.x = -0.035; book.add(pages);

  const BASEY = -BH / 2 + 0.06;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), new THREE.MeshBasicMaterial({ map: toTex(radial([[0, 'rgba(0,0,0,0.75)'], [0.45, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']], 256), false), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = BASEY; scene.add(shadow);
  const glowP = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: toTex(radial([[0, 'rgba(214,176,110,0.32)'], [0.35, 'rgba(214,176,110,0.08)'], [0.7, 'rgba(214,176,110,0)']], 512), true), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glowP.rotation.x = -Math.PI / 2; glowP.position.y = BASEY - 0.01; scene.add(glowP);
  function ringM(r, tube, op, arc) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 300, arc || Math.PI * 2), new THREE.MeshBasicMaterial({ color: 0xC9A86A, transparent: true, opacity: op, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.y = BASEY; scene.add(m); return m; }
  ringM(1.75, 0.006, 0.45); const arcR = ringM(2.3, 0.008, 0.7, Math.PI * 1.2); ringM(2.3, 0.004, 0.18);

  let W0 = 0, H0 = 0, dist = 10.4;
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h || (w === W0 && h === H0)) return; W0 = w; H0 = h; renderer.setSize(w, h, false); camera.aspect = w / h; dist = 10.4 * Math.max(1, 0.8 / camera.aspect); camera.updateProjectionMatrix(); }
  let rot = opts.angle != null ? opts.angle : 0.55; const base = rot; let vel = 0, drag = false, lastX = 0, idle = 3; const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  function down(e) { drag = true; lastX = e.clientX; vel = 0; try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } canvas.style.cursor = 'grabbing'; }
  function move(e) { const r = canvas.getBoundingClientRect(); ptr.tx = (e.clientX - r.left) / r.width * 2 - 1; ptr.ty = -((e.clientY - r.top) / r.height * 2 - 1); if (!drag) return; const dx = e.clientX - lastX; lastX = e.clientX; rot += dx * 0.01; vel = dx * 0.6; idle = 0; }
  function up() { drag = false; canvas.style.cursor = 'grab'; }
  function leave() { ptr.tx = 0; ptr.ty = 0; }
  canvas.style.cursor = 'grab'; canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('pointerleave', leave);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0, raf = 0, last = 0, visible = true;
  function update(dt) {
    t += dt; idle += dt;
    if (!drag) {
      rot += vel * dt; vel *= Math.pow(0.04, dt);
      if (idle > 2.2 && !reduce) { const nearest = base + Math.round((rot - base) / (Math.PI * 2)) * Math.PI * 2; const targ = nearest + Math.sin(t * 0.45) * 0.38; rot += (targ - rot) * Math.min(1, dt * 0.8); }
    }
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);
    book.rotation.set(-0.06 + ptr.y * 0.05, rot, 0);
    book.position.y = 0.08 + (reduce ? 0 : Math.sin(t * 1.1) * 0.03);
    arcR.rotation.z = -t * 0.15;
    const el = 0.17;
    camera.position.set(0, Math.sin(el) * dist + 0.1, Math.cos(el) * dist);
    camera.lookAt(0, -0.05, 0);
  }
  function frame(now) { raf = requestAnimationFrame(frame); if (!visible) return; resize(); const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now; update(dt); renderer.render(scene, camera); }
  let io = null; if (window.IntersectionObserver) { io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; last = 0; }); io.observe(canvas); }
  raf = requestAnimationFrame(frame);
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('500 40px "Cormorant Garamond"'), document.fonts.load('italic 500 40px "Cormorant Garamond"'), document.fonts.load('500 20px "JetBrains Mono"'), document.fonts.load('40px "Gulzar"', 'کتب')]).then(() => jobs.forEach((j) => j()), () => {});
  return {
    dispose() {
      cancelAnimationFrame(raf); if (io) io.disconnect();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('pointerleave', leave);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach((mt) => { ['map', 'roughnessMap', 'metalnessMap'].forEach((kk) => { if (mt[kk]) mt[kk].dispose(); }); mt.dispose(); }); });
      envRT.dispose(); pm.dispose(); renderer.dispose();
    }
  };
}

window.KK3D = Object.assign(window.KK3D || {}, { mountBook });
