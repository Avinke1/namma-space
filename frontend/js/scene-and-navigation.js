// ---- Scene ----
var cv = $('c'), R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.setClearColor(0x000000, 0);
R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
var S = new THREE.Scene(); S.background = new THREE.Color(0x070a12); S.fog = new THREE.Fog(0x070a12, 300, 900);
var cam = new THREE.PerspectiveCamera(45, 1, 0.3, 1500); cam.rotation.order = 'YXZ'; S.add(cam);
var torch = new THREE.PointLight(0xdbe8ff, 0.7, 70); torch.visible = false; cam.add(torch);
S.add(new THREE.HemisphereLight(0xbcd2ff, 0x1a2238, 0.95));
var sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(-120, 220, 90); S.add(sun);

function mat(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0 }); }
var WA = mat(0x3a5799), WB = mat(0x2f7a64), FA = mat(0x16264a), FB = mat(0x12332d), RA = mat(0x20366a), RB = mat(0x194a3d), PA = mat(0x1c2540), ST = mat(0x9a7424), GR = mat(0x0a0e18);
var CE = new THREE.MeshBasicMaterial({ color: 0x1d2b4d });
var EA = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.5 }), EB = new THREE.LineBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.5 });
var G = new THREE.Group(), Cg = new THREE.Group(), Gu = new THREE.Group(), GRP = G, YO = 0, FL = 0; S.add(G, Cg, Gu); Cg.visible = false; var CgB = new THREE.Group(); Cg.add(CgB);

var COL = [];
// box in map coordinates (x, y) with heights h0..h1; the map centre becomes the world origin
function box(x0, y0, x1, y1, h0, h1, m, ec, grp) {
  var g = new THREE.BoxGeometry(x1 - x0, h1 - h0, y1 - y0), me = new THREE.Mesh(g, m);
  me.position.set((x0 + x1) / 2 - 200, (h0 + h1) / 2 + YO, (y0 + y1) / 2 - 135); (grp || GRP).add(me);
  if (ec) { var l = new THREE.LineSegments(new THREE.EdgesGeometry(g), ec); l.position.copy(me.position); (grp || GRP).add(l); }
}
// wall along x (h=1, at y=c) or along y (h=0, at x=c), with door gaps that get a lintel above
function wall(h, c, a, b, gaps, t, m, ec) {
  var p = a;
  function put(s, e, h0, h1) { if (e - s < 0.01) return; var r = h ? [s, c - t/2, e, c + t/2] : [c - t/2, s, c + t/2, e]; box(r[0], r[1], r[2], r[3], h0, h1, m, ec); if (h0 === 0) COL.push(r.concat(FL)); }
  gaps.slice().sort(function (u, v) { return u - v; }).forEach(function (g) { put(p, g - DW/2, 0, H); put(g - DW/2, g + DW/2, DH, H); p = g + DW/2; });
  put(p, b, 0, H);
}
function room(r, door, m, e, fl) {
  var x = r[0], y = r[1], w = r[2], h = r[3];
  box(x, y, x + w, y + h, 0, 0.08, fl);
  wall(1, y, x, x + w, door.n ? [door.n] : [], 0.8, m, e); wall(1, y + h, x, x + w, door.s ? [door.s] : [], 0.8, m, e);
  wall(0, x, y, y + h, [], 0.8, m, e); wall(0, x + w, y, y + h, [], 0.8, m, e);
}

var gnd = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), GR); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -0.6; S.add(gnd);
var grid = new THREE.GridHelper(1200, 120, 0x1b2740, 0x111a2c); grid.position.y = -0.58; S.add(grid);
box(30, 40, 190, 200, -0.5, 0, FA); box(210, 40, 370, 200, -0.5, 0, FB); box(190, 117, 210, 127, -0.5, 0, FA);
box(30, 219, 250, 231, -0.5, 0.03, PA); box(70, 200, 80, 219, -0.5, 0.03, PA); box(232.5, 200, 242.5, 219, -0.5, 0.03, PA);
function level(L) {
  FL = L; YO = L * 8; GRP = L ? Gu : G; var g = !L;
  wall(1, 40, 30, 190, [], 1.2, WA, EA); wall(1, 200, 30, 190, g ? [75] : [], 1.2, WA, EA); wall(0, 30, 40, 200, [], 1.2, WA, EA); wall(0, 190, 40, 200, g ? [122] : [], 1.2, WA, EA);
  wall(1, 40, 210, 370, [], 1.2, WB, EB); wall(1, 200, 210, 370, g ? [237.5] : [], 1.2, WB, EB); wall(0, 210, 40, 200, g ? [122] : [], 1.2, WB, EB); wall(0, 370, 40, 200, g ? [122] : [], 1.2, WB, EB);
  [[40,50],[78,50],[116,50]].forEach(function (r) { room([r[0], r[1], 35, 60], { s: r[0] + 17.5 }, WA, EA, RA); });
  room([110, 135, 70, 55], { n: 145 }, WA, EA, RA);
  [[220,50],[258,50],[296,50]].forEach(function (r) { room([r[0], r[1], 35, 60], { s: r[0] + 17.5 }, WB, EB, RB); });
  room([245, 160, 70, 35], { n: 275.5 }, WB, EB, RB);
  if (g) room([82, 160, 24, 35], { n: 94 }, WA, EA, RA);
}
level(0);
wall(1, 116.5, 190, 210, [], 0.8, WA, EA); wall(1, 127.5, 190, 210, [], 0.8, WA, EA);
[[191,193,0.5],[193,195,1],[195,205,1.5],[205,207,1],[207,209,0.5]].forEach(function (q) { box(q[0], 117, q[1], 127, -0.5, q[2], ST); });
// Staircases: 20 steps each, solid side walls, blockers so you can only enter at the foot (ground) or the top (upper floor)
STAIRS.forEach(function (q) {
  for (var i = 0; i < 20; i++) box(q[0], q[3] - 2.5 * (i + 1), q[2], q[3] - 2.5 * i, -0.5, 0.4 * (i + 1), ST);
  box(q[0] - 2, q[1], q[0], q[3], -0.5, 9, WA, EA); box(q[2], q[1], q[2] + 2, q[3], -0.5, 9, WA, EA);
  COL.push([q[0] - 2, q[1], q[0], q[3], 2], [q[2], q[1], q[2] + 2, q[3], 2], [q[0] - 2, q[3], q[2] + 2, q[3] + 3, 1], [q[0] - 2, q[1] - 4, q[2] + 2, q[1], 0]);
});
level(1); YO = 0; FL = 0; GRP = G;
[[30, 40, 190, 200, 34, 140, 54, 192], [210, 40, 370, 200, 214, 140, 234, 192]].forEach(function (b) {
  [[b[0], b[1], b[2], b[5]], [b[0], b[7], b[2], b[3]], [b[0], b[5], b[4], b[7]], [b[6], b[5], b[2], b[7]]].forEach(function (r) { box(r[0], r[1], r[2], r[3], 7.55, 8, CE, null, Gu); });
});
box(30, 40, 190, 200, 15, 15.4, CE, null, CgB); box(210, 40, 370, 200, 15, 15.4, CE, null, CgB); box(190, 116, 210, 128, H, H + 0.4, CE, null, CgB);

// ---- Labels ----
var Lb = new THREE.Group(), Tt = new THREE.Group(); S.add(Lb, Tt);
function label(t, w, col) {
  var c = document.createElement('canvas'); c.width = 512; c.height = 96; var g = c.getContext('2d');
  g.fillStyle = 'rgba(7,10,18,.85)'; g.fillRect(4, 10, 504, 76); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(4, 10, 504, 76);
  g.fillStyle = '#e2e8f0'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 40px "IBM Plex Sans", system-ui, sans-serif'; var m = g.measureText(t).width;
  if (m > 470) g.font = '600 ' + Math.floor(40 * 470 / m) + 'px "IBM Plex Sans", system-ui, sans-serif';
  g.fillText(t, 256, 49);
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true })); sp.scale.set(w, w * 96 / 512, 1); return sp;
}
function buildLabels() {
  var off = { 'A-ENT': [0, -5], 'EXIT-E': [-8, 0] };
  LOC.forEach(function (l) {
    var p = N[l.id], o = off[l.id] || [0, 0], t = label(l.label, l.id === 'GATE' ? 14 : 17, (l.id[0] === 'B' || l.id === 'EXIT-E') ? '#34d399' : '#60a5fa');
    t.position.set(p[0] - 200 + o[0], (l.id === 'GATE' ? 4.5 : 5.4) + 8 * (l.fl || 0), p[1] - 135 + o[1]); t.userData = { x: p[0], y: p[1], fl: l.fl || 0 }; Lb.add(t);
  });
  var a = label('Academic Block A', 44, '#60a5fa'); a.position.set(-90, 18, -103); Tt.add(a);
  var b = label('Library & Labs Block B', 44, '#34d399'); b.position.set(90, 18, -103); Tt.add(b);
  var s = label('3 steps up, 3 down', 11, '#f59e0b'); s.position.set(0, 5.6, -13); Lb.add(s);
}
Promise.resolve(document.fonts && document.fonts.load('600 40px "IBM Plex Sans"')).catch(function () {}).then(buildLabels);

// ---- Pins and route ribbon ----
var PinG = new THREE.Group(); S.add(PinG);
function pin(id, c) {
  var p = N[id], g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: c });
  var st = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.2, 8), m); st.position.y = 2.1;
  var b = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), m); b.position.y = 4.8;
  var rg = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.3, 24), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
  rg.rotation.x = -Math.PI / 2; rg.position.y = 0.15; g.add(st, b, rg); g.position.set(p[0] - 200, hAt(p[0], p[1], FLN[id] || 0), p[1] - 135); return g;
}
function setPins() { while (PinG.children.length) PinG.remove(PinG.children[0]); PinG.add(pin($('st').value, 0x10b981), pin($('ds').value, 0xf43f5e)); }

var tc = document.createElement('canvas'); tc.width = 16; tc.height = 32; var tg = tc.getContext('2d'); tg.fillStyle = '#7db4ff'; tg.fillRect(0, 0, 16, 18);
var rt = new THREE.CanvasTexture(tc); rt.wrapT = THREE.RepeatWrapping;
var rm = new THREE.MeshBasicMaterial({ map: rt, transparent: true, side: THREE.DoubleSide, depthWrite: false }), rib = null;
function buildRibbon() {
  if (rib) { S.remove(rib); rib.geometry.dispose(); rib = null; }
  if (!pts) return;
  var q = [], i, j;
  for (i = 0; i < pts.length - 1; i++) {
    var a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2));
    for (j = 0; j < n; j++) q.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, j / n < 0.5 ? a[2] : b[2]]);
  }
  q.push(pts[pts.length - 1]);
  var pos = [], uv = [], ix = [], d = 0;
  q.forEach(function (p, i) {
    var a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * 0.9, ny = dx / l * 0.9;
    if (i) d += Math.hypot(p[0] - q[i - 1][0], p[1] - q[i - 1][1]);
    var y = hAt(p[0], p[1], p[2]) + 0.16;
    pos.push(p[0] - 200 + nx, y, p[1] - 135 + ny, p[0] - 200 - nx, y, p[1] - 135 - ny); uv.push(0, d / 5, 1, d / 5);
    if (i < q.length - 1) { var k = 2 * i; ix.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  });
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix);
  rib = new THREE.Mesh(g, rm); S.add(rib);
}

// ---- Route state ----
var route = null, pts = null, cum = [], total = 0, mode = 'orbit';
function res(t, d, b, err) {
  $('res').className = 'rounded-lg bg-slate-900 border p-3 space-y-1 text-sm ' + (err ? 'border-rose-500/40' : 'border-blue-500/30');
  $('r-t').textContent = t; $('r-t').parentNode.className = 'flex justify-between items-center font-semibold ' + (err ? 'text-rose-300' : 'text-blue-300');
  $('r-d').textContent = d; $('r-d').style.display = d ? '' : 'none'; $('r-b').textContent = b;
}
function compute() {
  var a = $('st').value, b = $('ds').value, sf = $('sf').checked;
  route = null; pts = null; total = 0; setPins();
  if (CUR !== 'apex' && !CL().some(function (l) { return l.id !== 'GATE'; })) { buildRibbon(); res('Add your first room', '', 'Use “Scan a new room” above to build rooms for this place.', 0); return false; }
  if (a === b) { buildRibbon(); res('Choose two different points', '', 'The start and destination are the same place.', 1); return false; }
  var r = astar(a, b, sf);
  if (!r) { buildRibbon(); res('No route found', '', sf ? 'No step-free route exists between these points.' : 'These points are not connected.', 1); return false; }
  route = r; pts = r.path.map(pt); cum = [0];
  for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]));
  total = cum[cum.length - 1]; buildRibbon();
  var m = Math.round(total * M_PER), mins = Math.max(1, Math.round(m / WALKMIN));
  var via = CUR !== 'apex' ? 'the main path' : r.path.indexOf('P1') >= 0 ? 'the outdoor courtyard and ramped entrance' : r.steps ? 'the Block A to Block B linkway (3 steps)' : 'the ground-floor corridor';
  res('Route computed', m + ' meters', 'About ' + mins + (mins === 1 ? ' min' : ' mins') + ' on foot via ' + via + (sf ? '. Step-free.' : '.'), 0);
  return true;
}
function at(s) {
  var i = 0; while (i < cum.length - 2 && cum[i + 1] < s) i++;
  var a = pts[i], b = pts[i + 1], f = clamp((s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), 0, 1);
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, yaw: Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])) };
}

// ---- Camera: orbit overview and guided first-person walk ----
var az = 0.7, el = 0.8, rad = window.innerWidth < window.innerHeight ? 620 : 360, gR = rad, tgt = new V3(), gT = new V3();
var yaw = 0, pitch = 0, camY = EYE, P = { x: 0, y: 0 }, dragging = false, ptrs = {}, lastNear = '', W = 0, Hh = 0, keys = {}, jx = 0, jy = 0, gdT = 0, dstId = '', TOUCH = window.matchMedia('(pointer:coarse)').matches || window.innerWidth < 900;
var ON = 'px-3 py-2 bg-blue-600 text-white font-medium', OFF = 'px-3 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800';

cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.clientX, e.clientY]; dragging = true; });
cv.addEventListener('pointermove', function (e) {
  var p = ptrs[e.pointerId]; if (!p) return;
  var dx = e.clientX - p[0], dy = e.clientY - p[1], ids = Object.keys(ptrs);
  if (ids.length === 2) {
    var o = ptrs[ids[0] == e.pointerId ? ids[1] : ids[0]], d0 = Math.hypot(p[0] - o[0], p[1] - o[1]), d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]);
    if (mode === 'orbit' && d1 > 0) gR = clamp(gR * d0 / d1, 60, 700);
  } else if (mode === 'orbit') { az -= dx * 0.006; el = clamp(el + dy * 0.005, 0.12, 1.5); }
  else { yaw += dx * 0.004; pitch = clamp(pitch + dy * 0.004, -1.2, 1.2); }
  ptrs[e.pointerId] = [e.clientX, e.clientY];
});
function endPtr(e) { delete ptrs[e.pointerId]; dragging = Object.keys(ptrs).length > 0; }
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', function (e) { e.preventDefault(); if (mode === 'orbit') gR = clamp(gR * (1 + Math.sign(e.deltaY) * 0.1), 60, 700); }, { passive: false });

var stream = null, offY = 0, devYaw = 0, lastStep = 0, qrT = 0;
function toast(t) { var e = $('toast'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.add('hidden'); }, 8000); }
function vis() {
  var a = CUR === 'apex', up = a && ($('uf').checked || mode !== 'orbit'); G.visible = a && mode !== 'ar'; Gu.visible = up && mode !== 'ar'; Tt.visible = a && mode === 'orbit';
  Lb.children.forEach(function (sp) { var u = sp.userData, f = u.fl || 0; if ((u.c || 'apex') !== CUR) { sp.visible = false; return; } sp.visible = mode === 'ar' ? (f === FLR && Math.hypot(u.x - P.x, u.y - P.y) < 80) : (!f || up); });
}
function onOri(e) { if (mode !== 'ar' || e.alpha == null) return; arOk = true; devYaw = e.alpha * Math.PI / 180; yaw = devYaw + offY; pitch = clamp((e.beta - 90) * Math.PI / 180, -1.3, 1.3); }
function onMot(e) {
  var a = e.accelerationIncludingGravity, t = performance.now(); if (!a || mode !== 'ar') return;
  if (Math.hypot(a.x, a.y, a.z) > 12.5 && t - lastStep > 380) { lastStep = t; var dx = -Math.sin(yaw) * 1.4, dy = -Math.cos(yaw) * 1.4; if (!blocked(P.x + dx, P.y, 1.6)) P.x += dx; if (!blocked(P.x, P.y + dy, 1.6)) P.y += dy; }
}
function scan(r, manual) {
  if (!r.length) return; var v = String(r[0].rawValue).trim().toLowerCase().replace('apex:', '');
  var hit = CL().filter(function (l) { return l.id.toLowerCase() === v || l.label.toLowerCase() === v; })[0];
  if (!hit) { if (manual) toast('No room matches that code. Try a name like Central Library or an ID like B0-01.'); return; }
  if ($('st').value !== hit.id) { $('st').value = hit.id; respawn(); toast('Located: ' + hit.label); } else if (manual) toast('You are already at ' + hit.label);
}
// ---- QR reading: native BarcodeDetector where available, jsQR fallback (iOS Safari, Firefox), typed code as last resort ----
var arOk = false, qc = document.createElement('canvas'), qx = qc.getContext('2d', { willReadFrequently: true });
function camMsg(err) {
  var n = err && err.name;
  if (!window.isSecureContext || !navigator.mediaDevices) return 'The camera needs a secure page. Open this link directly in Chrome or Safari on your phone, not inside another app.';
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'Camera permission was denied. Allow Camera for this site in your browser settings, then try again.';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No usable camera was found on this device.';
  if (n === 'NotReadableError') return 'The camera is busy. Close other apps using it and try again.';
  return 'The camera could not start (' + (n || 'error') + ').';
}
function loadJsQR(cb) {
  if (window.jsQR) return cb(true);
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'; s.onload = function () { cb(!!window.jsQR); }; s.onerror = function () { cb(false); }; document.head.appendChild(s);
}
function jsDecode() {
  var v = $('vid'); if (!window.jsQR || !v.videoWidth) return;
  var w = Math.min(480, v.videoWidth), h = Math.round(w * v.videoHeight / v.videoWidth); qc.width = w; qc.height = h; qx.drawImage(v, 0, 0, w, h);
  var c = jsQR(qx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' }); if (c && c.data) scan([{ rawValue: c.data }]);
}
function startQR() {
  clearInterval(qrT);
  function fallback() {
    toast('Loading QR reader… or tap Room code to type where you are.');
    loadJsQR(function (ok) {
      if (!stream) return;
      if (!ok) { toast('QR reader could not load. Tap Room code to type where you are.'); return; }
      toast('Scan a room-sign QR, or tap Room code to type where you are.'); qrT = setInterval(jsDecode, 500);
    });
  }
  function native() { var bd = new BarcodeDetector({ formats: ['qr_code'] }); qrT = setInterval(function () { bd.detect($('vid')).then(scan).catch(function () {}); }, 700); toast('Scan a room-sign QR to set where you are, then walk and follow the arrow'); }
  if (!('BarcodeDetector' in window)) return fallback();
  if (BarcodeDetector.getSupportedFormats) BarcodeDetector.getSupportedFormats().then(function (f) { f.indexOf('qr_code') >= 0 ? native() : fallback(); }, fallback); else native();
}
function startCam() {
  var DO = window.DeviceOrientationEvent, DM = window.DeviceMotionEvent;
  if (DM && DM.requestPermission) DM.requestPermission().catch(function () {});
  var perm = DO && DO.requestPermission ? DO.requestPermission().catch(function () { return 'error'; }) : Promise.resolve('granted');
  return perm.then(function (ps) { if (ps === 'denied') toast('Motion sensor access was denied, so the path cannot follow where you point. Allow it in Safari settings, or use Walkthrough mode.'); return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); }).then(function (m) {
    stream = m; $('vid').srcObject = m; $('vid').play().catch(function () {});
    window.addEventListener('deviceorientation', onOri); window.addEventListener('devicemotion', onMot);
    arOk = false; startQR();
    setTimeout(function () { if (mode === 'ar' && !arOk) toast('No motion sensor data after 4 seconds. Use Walkthrough mode, or tap Room code to set your position.'); }, 4000);
  });
}
function stopCam() {
  if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; clearInterval(qrT); $('vid').srcObject = null; $('qrp').classList.add('hidden');
  window.removeEventListener('deviceorientation', onOri); window.removeEventListener('devicemotion', onMot);
}
function setMode(m) {
  if (m === 'ar') { if (!route && !compute()) return; startCam().then(function () { apply('ar'); }, function (err) { toast(camMsg(err) + ' Walkthrough mode works without a camera.'); }); return; }
  if (m === 'walk' && !route && !compute()) return;
  stopCam(); apply(m);
}
function apply(m) {
  mode = m; var w = m !== 'orbit', a = m === 'ar';
  $('m-o').className = m === 'orbit' ? ON : OFF; $('m-w').className = m === 'walk' ? ON : OFF; $('m-c').className = a ? ON : OFF;
  $('bar').classList.toggle('hidden', !w); $('hint').classList.toggle('hidden', w); $('arbar').classList.toggle('hidden', !a); $('camfab').classList.toggle('hidden', m !== 'orbit'); $('vid').classList.toggle('hidden', !a);
  Cg.visible = m === 'walk'; Tt.visible = !w; torch.visible = m === 'walk';
  [G, gnd, grid, MYG].forEach(function (o) { o.visible = !a; }); S.background = a ? null : new THREE.Color(0x070a12);
  cam.fov = a ? 62 : w ? 72 : 45; cam.updateProjectionMatrix(); S.fog.near = a ? 900 : w ? 40 : 300; S.fog.far = a ? 1400 : w ? 190 : 900;
  $('mm').classList.toggle('hidden', !w); $('joy').classList.toggle('hidden', !(w && TOUCH)); $('go').textContent = w ? 'Restart from start' : 'Start walkthrough';
  if (w) { respawn(); camY = hAt(P.x, P.y, FLR) + EYE; keys = {}; if (window.innerWidth < 640) collapse(true); } else compute();
}
function collapse(b) { $('pbody').classList.toggle('hidden', b); $('ptoggle').textContent = b ? 'Show' : 'Hide'; }

function respawn() {
  compute(); if (!route) return;
  FLR = FLN[$('st').value] || 0; P.x = N[$('st').value][0]; P.y = N[$('st').value][1]; yaw = at(0.001).yaw; pitch = 0; gdT = 0; dstId = $('ds').value;
}
function blocked(x, y, r) { for (var i = 0; i < COL.length; i++) { var c = COL[i]; if ((c[4] === 2 || c[4] === FLR) && (c[6] || 'apex') === CUR && x > c[0] - r && x < c[2] + r && y > c[1] - r && y < c[3] + r) return true; } return false; }
function los(x0, y0, x1, y1) { var n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.5); for (var i = 1; i < n; i++) { var f = i / n; if (blocked(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, 0.4)) return false; } return true; }
// Live directions: route from wherever you stand, through the best visible waypoint
function guide() {
  var best = null, bd = 1e9;
  Object.keys(N).forEach(function (id) {
    var p = N[id], d = Math.hypot(p[0] - P.x, p[1] - P.y);
    if ((FLN[id] || 0) !== FLR || !inCamp(id) || !los(P.x, P.y, p[0], p[1])) return;
    var r = id === dstId ? { path: [id], units: 0 } : astar(id, dstId, $('sf').checked);
    if (r && d + r.units < bd) { bd = d + r.units; best = r; }
  });
  if (!best) { pts = null; total = 0; buildRibbon(); return; }
  pts = [[P.x, P.y, FLR]].concat(best.path.map(pt)); cum = [0];
  for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  total = cum[cum.length - 1]; buildRibbon();
}
function walk(dt) {
  var f = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) + jy, sx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + jx;
  if (keys.arrowleft) yaw += 1.8 * dt; if (keys.arrowright) yaw -= 1.8 * dt;
  var l = Math.hypot(f, sx); if (l > 1) { f /= l; sx /= l; }
  var v = (keys.shift ? 26 : 13) * dt, dx = (-Math.sin(yaw) * f + Math.cos(yaw) * sx) * v, dy = (-Math.cos(yaw) * f - Math.sin(yaw) * sx) * v;
  if (!blocked(P.x + dx, P.y, 1.6)) P.x += dx; if (!blocked(P.x, P.y + dy, 1.6)) P.y += dy;
  P.x = clamp(P.x, -40, 700); P.y = clamp(P.y, -20, 360);
  var rr = ramp(P.x, P.y); if (rr >= 0) FLR = rr >= 4 ? 1 : 0;
  camY += (hAt(P.x, P.y, FLR) + EYE + (l > 0.1 ? Math.sin(performance.now() / 120) * 0.05 : 0) - camY) * (1 - Math.exp(-dt * 9));
  cam.position.set(P.x - 200, camY, P.y - 135); cam.rotation.set(pitch, yaw, 0);
  gdT -= dt; if (gdT <= 0) { gdT = 0.3; guide(); }
  var a, b;
  if (!pts) { a = 'Head to a corridor'; b = 'No route from here'; }
  else {
    var wp = pts[pts.length - 1], i, near = null, nd = 14, dn = N[dstId];
    for (i = 1; i < pts.length; i++) if (Math.hypot(pts[i][0] - P.x, pts[i][1] - P.y) > 4) { wp = pts[i]; break; }
    var rel = Math.atan2(-(wp[0] - P.x), -(wp[1] - P.y)) - yaw; rel = ((rel + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    var arrived = Math.hypot(dn[0] - P.x, dn[1] - P.y) < 5 && (FLN[dstId] || 0) === FLR;
    a = arrived ? 'You have arrived' : Math.abs(rel) < 0.4 ? 'Go straight' : Math.abs(rel) > 2.3 ? 'Turn around' : rel > 0 ? 'Turn left' : 'Turn right';
    var df = FLN[dstId] || 0; if (!arrived && df !== FLR) a += df > FLR ? ' · go upstairs' : ' · go downstairs';
    if (fh(P.x, P.y) > 0 && FLR === 0 && P.x > 189 && P.x < 211) a += ' · mind the steps';
    $('arrow').style.transform = 'rotate(' + (-rel * 180 / Math.PI) + 'deg)';
    CL().forEach(function (o) { var d = Math.hypot(N[o.id][0] - P.x, N[o.id][1] - P.y); if (d < nd && (o.fl || 0) === FLR) { nd = d; near = o.label; } });
    b = Math.round(total * M_PER) + ' m to ' + $('ds').selectedOptions[0].textContent + (near ? ' · near ' + near : '') + (FLR ? ' · Floor 1' : ' · Ground');
  }
  if (a + b !== lastNear) { $('h-a').textContent = a; $('h-b').textContent = b; lastNear = a + b; }
}

// Mini map: walls drawn once, route and position every frame
var mmc = $('mm').getContext('2d');
function mmView() {
  if (CUR === 'apex') return { s: 0.6, x: 0, y: 0, x1: 0 };
  var x0 = 30, x1 = 130, y0 = 215, y1 = 262;
  Object.keys(RM).forEach(function (k) { if (RM[k].cp !== CUR) return; RM[k].m.forEach(function (p) { x1 = Math.max(x1, p[0] + 8); y1 = Math.max(y1, p[1] + 8); }); });
  return { s: Math.min(240 / (x1 - x0), 216 / (y1 - y0), 1.2), x: x0, y: y0, x1: x1 };
}
function mkMM(f) {
  var cc = document.createElement('canvas'); cc.width = 240; cc.height = 216; var g = cc.getContext('2d'), a = CUR === 'apex'; MMV = mmView();
  g.fillStyle = '#0b0f19'; g.fillRect(0, 0, 240, 216); g.setTransform(MMV.s, 0, 0, MMV.s, -MMV.x * MMV.s, -MMV.y * MMV.s);
  if (a) {
    g.fillStyle = '#16264a'; g.fillRect(30, 40, 160, 160); g.fillStyle = '#12332d'; g.fillRect(210, 40, 160, 160); if (!f) { g.fillStyle = '#9a7424'; g.fillRect(190, 117, 20, 10); }
    g.fillStyle = '#b45309'; STAIRS.forEach(function (q) { g.fillRect(q[0], q[1], q[2] - q[0], q[3] - q[1]); });
  } else if (!f) { g.fillStyle = '#1c2540'; g.fillRect(30, 219, MMV.x1 - 30, 12); }
  g.fillStyle = '#94a3b8'; COL.forEach(function (c) { if ((c[4] === 2 || c[4] === f) && (c[6] || 'apex') === CUR) g.fillRect(c[0], c[1], c[2] - c[0], c[3] - c[1]); });
  Object.keys(RM).forEach(function (k) { if (!f && RM[k].cp === CUR) mmRoom(g, RM[k].m); }); return cc;
}
var mmS = [0, 1].map(mkMM);
function dot(g, id, c) { if ((FLN[id] || 0) !== FLR) return; g.fillStyle = c; g.beginPath(); g.arc(N[id][0], N[id][1], 4.5, 0, 7); g.fill(); }
function drawMap() {
  var g = mmc; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(mmS[FLR], 0, 0); g.save(); g.setTransform(MMV.s, 0, 0, MMV.s, -MMV.x * MMV.s, -MMV.y * MMV.s);
  if (pts) { g.strokeStyle = '#60a5fa'; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); }
  dot(g, $('st').value, '#10b981'); dot(g, dstId, '#f43f5e');
  g.translate(P.x, P.y); g.rotate(-yaw);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-16, -30); g.lineTo(16, -30); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-5, 6); g.lineTo(5, 6); g.fill(); g.restore();
}
(function () {
  var j = $('joy'), k = $('knob'), id = null;
  function mv(e) { var r = j.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2, m = r.width / 2 - 8, l = Math.hypot(dx, dy) || 1, c = Math.min(1, l / m); dx = dx / l * c * m; dy = dy / l * c * m; k.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; jx = dx / m; jy = -dy / m; }
  j.addEventListener('pointerdown', function (e) { id = e.pointerId; j.setPointerCapture(id); mv(e); });
  j.addEventListener('pointermove', function (e) { if (e.pointerId === id) mv(e); });
  function end(e) { if (e.pointerId !== id) return; id = null; jx = jy = 0; k.style.transform = ''; }
  j.addEventListener('pointerup', end); j.addEventListener('pointercancel', end);
})();

var last = 0;
function frame(t) {
  var dt = Math.min(0.05, (t - last) / 1000); last = t;
  var w = cv.clientWidth, h = cv.clientHeight;
  if (w !== W || h !== Hh) { W = w; Hh = h; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  if (mode === 'orbit') {
    var k = 1 - Math.exp(-dt * 6); rad += (gR - rad) * k; tgt.lerp(gT, k);
    cam.position.set(tgt.x + rad * Math.cos(el) * Math.sin(az), tgt.y + rad * Math.sin(el), tgt.z + rad * Math.cos(el) * Math.cos(az)); cam.lookAt(tgt);
  } else { walk(dt); drawMap(); }
  vis(); rt.offset.y -= dt * 0.6;
  R.render(S, cam); requestAnimationFrame(frame);
}

// ---- UI wiring ----
['st', 'ds'].forEach(function (id) {
  LOC.forEach(function (l) { var o = document.createElement('option'); o.value = l.id; o.textContent = l.label; $(id).appendChild(o); });
  $(id).addEventListener('change', onChange);
});
$('st').value = 'A-ENT'; $('ds').value = 'B0-01'; $('sf').addEventListener('change', onChange);
function onChange(e) {
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  if (mode !== 'walk') { compute(); return; }
  if (e && e.target && e.target.id === 'ds') { compute(); dstId = $('ds').value; gdT = 0; } else respawn();
}
$('swap').onclick = function () { var t = $('st').value; $('st').value = $('ds').value; $('ds').value = t; onChange(); };
$('go').onclick = function () { if (mode === 'walk') respawn(); else setMode('walk'); };
$('m-o').onclick = function () { setMode('orbit'); }; $('m-w').onclick = function () { setMode('walk'); };
$('ptoggle').onclick = function () { collapse(!$('pbody').classList.contains('hidden')); };
document.querySelectorAll('.foc').forEach(function (b) {
  b.onclick = function () {
    setMode('orbit'); var f = b.getAttribute('data-f');
    if (f === 'A') { gT.set(-90, 0, -15); gR = 190; } else if (f === 'B') { gT.set(90, 0, -15); gR = 190; } else focusCampus();
  };
});
document.addEventListener('keydown', function (e) {
  if (mode !== 'walk' || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  var k = e.key.toLowerCase(); keys[k] = true; if (k.indexOf('arrow') === 0) e.preventDefault();
});
document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', function () { keys = {}; });
$('m-o').className = ON; $('m-w').className = OFF; $('m-c').className = OFF;
LOC.forEach(function (l) { var o = document.createElement('option'); o.value = l.label; $('rooms').appendChild(o); });
$('m-c').onclick = $('camfab').onclick = function () { setMode('ar'); }; $('ax').onclick = function () { setMode('orbit'); };
$('al').onclick = function () {
  var w = pts && (pts.filter(function (p, i) { return i && Math.hypot(p[0] - P.x, p[1] - P.y) > 4; })[0] || pts[pts.length - 1]); if (!w) return;
  offY = Math.atan2(-(w[0] - P.x), -(w[1] - P.y)) - devYaw; toast('Aligned: the blue path now matches the way you face');
};
$('q').addEventListener('input', function () {
  var v = this.value.trim().toLowerCase(); if (!v) return;
  var h = CL().filter(function (l) { return l.label.toLowerCase().indexOf(v) >= 0 || l.id.toLowerCase() === v; })[0]; if (!h) return;
  $('ds').value = h.id; compute(); if (mode !== 'orbit') { dstId = h.id; gdT = 0; }
});
