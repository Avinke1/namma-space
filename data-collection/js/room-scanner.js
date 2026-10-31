// Room scanner: phone sensors + camera -> corners, door, ceiling height -> room record { k, name, pts, h, door, c }.
// Uses globals from the other parts: $, clamp, mode, setMode, toast, camMsg, MY, MYK, CUR, addRoom, afterRooms, focusRoom.
// ---- Room scanner ----
var SC = { on: false, step: 0, stream: null, buf: [], cor: [], door: null, h: 0, c0: 0, camH: 1.4, name: '', sensor: false, t0: 0, nullSince: 0, sSince: 0, ready: false, iv: 0, errKind: '', mute: false, warnT: 0 };
function sto(t) { var e = $('sto'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(sto.t); sto.t = setTimeout(function () { e.classList.add('hidden'); }, 6000); }
// direction the back camera points: x east, y north, z up
function dirVec(a, b, g) { var r = Math.PI / 180, ca, sa, cb, sb, cg, sg; a *= r; b *= r; g *= r; ca = Math.cos(a); sa = Math.sin(a); cb = Math.cos(b); sb = Math.sin(b); cg = Math.cos(g); sg = Math.sin(g); return [-ca * sg - sa * sb * cg, -sa * sg + ca * sb * cg, -cb * cg]; }
function avg() { var n = SC.buf.length, x = 0, y = 0, z = 0; if (!n) return null; SC.buf.forEach(function (v) { x += v[0]; y += v[1]; z += v[2]; }); return [x / n, y / n, z / n]; }
function floorPt(v) { if (!v) return null; var h = Math.hypot(v[0], v[1]); if (v[2] > -0.08 || h < 0.05) return null; var d = SC.camH * h / -v[2]; return d > 25 ? null : [d * v[0] / h, -d * v[1] / h, d]; }
function ceilH(v) { if (!v || !SC.c0) return null; var h = Math.hypot(v[0], v[1]); return v[2] < 0.1 || h < 0.05 ? null : SC.camH + SC.c0 * v[2] / h; }
function sortPts(P) { return P.slice().sort(function (a, b) { return Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]); }); }
function readout() {
  var v = avg(), f, t; if (!v || SC.step < 1 || SC.step > 3) return;
  if (SC.step === 3) { f = ceilH(v); t = f ? 'Ceiling about ' + f.toFixed(1) + ' m high' : 'Tilt the phone up to the ceiling edge'; }
  else { f = floorPt(v); t = f ? 'Floor point ' + f[2].toFixed(1) + ' m away' : 'Tilt the phone down to the floor'; }
  $('rd' + SC.step).textContent = t;
}
function onSO(e) {
  if (e.alpha == null || e.beta == null) { if (!SC.nullSince) SC.nullSince = performance.now(); return; }
  SC.nullSince = 0; if (SC.errKind === 'sensor') { SC.mute = false; hideErr(); }
  SC.sensor = true; SC.buf.push(dirVec(e.alpha, e.beta, e.gamma || 0)); if (SC.buf.length > 8) SC.buf.shift(); readout(); }
function drawPlan() {
  var c = $('plan'), g = c.getContext('2d'), w = c.width, P = SC.cor, all = P.concat(SC.door ? [SC.door] : []), m = 1.5, s, o = w / 2;
  g.fillStyle = 'rgba(7,10,18,.88)'; g.fillRect(0, 0, w, w); all.forEach(function (p) { m = Math.max(m, Math.abs(p[0]), Math.abs(p[1])); }); s = (o - 16) / m;
  var Q = sortPts(P); g.strokeStyle = '#a78bfa'; g.lineWidth = 3; g.fillStyle = 'rgba(124,92,191,.25)'; g.beginPath(); Q.forEach(function (p, i) { i ? g.lineTo(o + p[0] * s, o + p[1] * s) : g.moveTo(o + p[0] * s, o + p[1] * s); }); if (Q.length > 2) g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.textAlign = 'center'; P.forEach(function (p, i) { g.fillText(i + 1, o + p[0] * s, o + p[1] * s - 6); });
  if (SC.door) { g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(o + SC.door[0] * s, o + SC.door[1] * s, 7, 0, 7); g.fill(); }
  g.fillStyle = '#34d399'; g.beginPath(); g.arc(o, o, 6, 0, 7); g.fill();
}
function sstep(n) {
  SC.step = n; for (var i = 0; i < 5; i++) $('s' + i).classList.toggle('hidden', i !== n);
  $('xh').classList.toggle('hidden', n < 1 || n > 3); $('plan').classList.toggle('hidden', n < 1);
  $('stitle').textContent = ['New room', 'Step 1 · Mark the corners', 'Step 2 · Mark the door', 'Step 3 · Ceiling height', 'Review'][n]; drawPlan();
}
// ---- Scanner resilience: error banner, sensor watchdog, stabilization reticle ----
function showErr(kind, msg) {
  SC.errKind = kind; $('serr-t').textContent = msg + ' You can still build the room by typing its size.'; $('serr').classList.remove('hidden');
  if (kind !== 'sensor') $('man').open = true;
}
function hideErr() { SC.errKind = ''; $('serr').classList.add('hidden'); }
function scanHW() {
  clearInterval(SC.iv); if (SC.stream) SC.stream.getTracks().forEach(function (t) { t.stop(); }); SC.stream = null; $('svid').srcObject = null;
  window.removeEventListener('deviceorientation', onSO);
}
function goManual() { scanHW(); hideErr(); sstep(0); var d = $('man'); d.open = true; setTimeout(function () { d.scrollIntoView({ block: 'nearest' }); $('mw').focus(); }, 50); }
function canCap() {
  if (SC.ready) return true; var now = performance.now(); if (SC.warnT && now - SC.warnT < 2500) return true;
  SC.warnT = now; sto('Hold the phone steady until the ring turns green, or tap again to capture anyway.'); return false;
}
function tick() {
  var st = SC.step; if (!SC.on || st < 1 || st > 3) return;
  var now = performance.now(), v = avg(), sp = 9, col, txt, p, tgt;
  var lost = (!SC.sensor && now - SC.t0 > 4000) || (SC.nullSince && now - SC.nullSince > 4000);
  if (lost && !SC.mute && SC.errKind !== 'sensor') showErr('sensor', 'No motion sensor data for 4 seconds. This device may not support it, or access was blocked.');
  if (v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; sp = 0; SC.buf.forEach(function (b) { sp = Math.max(sp, Math.acos(clamp((b[0] * v[0] + b[1] * v[1] + b[2] * v[2]) / l, -1, 1))); }); }
  tgt = v && (st === 3 ? ceilH(v) : floorPt(v));
  if (sp < 0.0175 && SC.buf.length >= 4) { if (!SC.sSince) SC.sSince = now; } else SC.sSince = 0;
  p = SC.sSince ? clamp((now - SC.sSince) / 500, 0, 1) : 0; SC.ready = !!tgt && p >= 1 && !lost;
  if (lost) { col = '#94a3b8'; txt = 'No sensor data'; p = 0; }
  else if (!tgt) { col = '#f43f5e'; txt = st === 3 ? 'Aim up at the ceiling edge' : 'Aim down at the floor'; }
  else if (p < 1) { col = '#f59e0b'; txt = 'Hold still…'; }
  else { col = '#34d399'; txt = 'Ready · tap Mark'; }
  $('xr').setAttribute('stroke-dashoffset', (163.4 * (1 - p)).toFixed(1)); $('xr').setAttribute('stroke', col); $('xd').setAttribute('stroke', col); $('xl').textContent = txt; $('xl').style.color = col;
  ['s-mc', 's-md', 's-mh'].forEach(function (id) { $(id).classList.toggle('opacity-60', !SC.ready); });
}
$('serr-m').onclick = goManual; $('serr-x').onclick = function () { SC.mute = true; hideErr(); };
$('qb').onclick = function () { $('qrp').classList.toggle('hidden'); $('qrin').focus(); };
$('qrgo').onclick = function () { scan([{ rawValue: $('qrin').value }], true); };
$('qrin').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('qrgo').click(); });
function openScan() { if (mode !== 'orbit') setMode('orbit'); SC.on = true; SC.cor = []; SC.door = null; $('scan').classList.remove('hidden'); sstep(0); }
function closeScan() {
  scanHW(); hideErr(); SC.on = false; $('scan').classList.add('hidden');
}
function toReview() {
  var P = sortPts(SC.cor), xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; }), a = 0, i;
  for (i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; }
  $('s4t').textContent = 'About ' + (Math.max.apply(null, xs) - Math.min.apply(null, xs)).toFixed(1) + ' × ' + (Math.max.apply(null, ys) - Math.min.apply(null, ys)).toFixed(1) + ' m, ' + (SC.h || 2.7).toFixed(1) + ' m high, ' + Math.abs(a / 2).toFixed(0) + ' m² floor. The door faces the campus path.';
  sstep(4);
}
$('newroom').onclick = openScan; $('sx').onclick = closeScan;
$('s-go').onclick = function () {
  SC.name = $('sn').value.trim(); SC.camH = clamp(parseFloat($('sh').value) || 1.4, 0.8, 2.2); SC.cor = []; SC.door = null; SC.h = 0; SC.c0 = 0; SC.buf = []; SC.sensor = false;
  SC.nullSince = 0; SC.sSince = 0; SC.ready = false; SC.mute = false; hideErr();
  var DO = window.DeviceOrientationEvent;
  if (!DO) { showErr('no-sensor', 'This browser has no motion sensors, so it cannot measure angles.'); return; }
  var p = DO.requestPermission ? DO.requestPermission().catch(function () { return 'denied'; }) : Promise.resolve('granted');
  p.then(function (ps) {
    if (ps === 'denied') { var e = new Error('sensor'); e.name = 'SensorDenied'; throw e; }
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  }).then(function (m) {
    SC.stream = m; $('svid').srcObject = m; $('svid').play().catch(function () {}); window.addEventListener('deviceorientation', onSO);
    SC.t0 = performance.now(); sstep(1); $('s1c').textContent = '0 marked'; clearInterval(SC.iv); SC.iv = setInterval(tick, 120);
  }, function (err) {
    if (err && err.name === 'SensorDenied') showErr('denied', 'Motion sensor access was denied. On iPhone, reload the page and tap Allow, or enable Motion & Orientation Access in Settings › Safari.');
    else showErr('camera', camMsg(err));
  });
};
$('s-man').onclick = function () {
  var w = parseFloat($('mw').value), l = parseFloat($('ml').value), h = parseFloat($('mh').value) || 2.7;
  if (!(w >= 1 && w <= 30 && l >= 1 && l <= 30)) { sto('Enter a width and length between 1 and 30 m.'); return; }
  SC.name = $('sn').value.trim(); SC.cor = [[-w / 2, -l / 2], [w / 2, -l / 2], [w / 2, l / 2], [-w / 2, l / 2]]; SC.door = [0, l / 2]; SC.h = clamp(h, 2, 6); toReview();
};
$('s-mc').onclick = function () {
  var f = floorPt(avg()); if (!f) { sto('Aim the cross lower, at the floor where two walls meet.'); return; } if (!canCap()) return;
  if (!SC.cor.length) SC.c0 = f[2]; SC.cor.push([f[0], f[1]]); $('s1c').textContent = SC.cor.length + ' marked'; drawPlan();
};
$('s-undo').onclick = function () { SC.cor.pop(); $('s1c').textContent = SC.cor.length + ' marked'; drawPlan(); };
$('s-done').onclick = function () { if (SC.cor.length < 3) { sto('Mark at least 3 corners.'); return; } sstep(2); };
$('s-md').onclick = function () { var f = floorPt(avg()); if (!f) { sto('Aim at the floor at the middle of the door.'); return; } if (!canCap()) return; SC.door = [f[0], f[1]]; sstep(3); };
$('s-skipd').onclick = function () { SC.door = null; sstep(3); };
$('s-mh').onclick = function () { var h = ceilH(avg()); if (!h) { sto('Tilt up to where the wall meets the ceiling, above your first corner.'); return; } if (!canCap()) return; SC.h = clamp(h, 2, 6); toReview(); };
$('s-skiph').onclick = function () { SC.h = 2.7; toReview(); };
$('s-redo').onclick = function () { SC.cor = []; SC.door = null; sstep(SC.stream ? 1 : 0); $('s1c').textContent = '0 marked'; };
$('s-save').onclick = function () {
  var r = { k: ++MYK, name: SC.name || 'My room ' + MYK, pts: sortPts(SC.cor), h: SC.h || 2.7, door: SC.door, c: CUR };
  MY.push(r); addRoom(r); afterRooms(); closeScan(); focusRoom(r.k); toast('Added ' + r.name + '. Tap Walk next to it in My rooms to go inside.');
};
