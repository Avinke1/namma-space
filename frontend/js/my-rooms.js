// ---- My rooms: build a 3D room from the phone camera ----
var WC = mat(0x7c5cbf), EC = new THREE.LineBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.5 }), MYG = new THREE.Group(), NEXTX = 45, ROWY = 246, DWU = 4.6, DHU = 4.2;
S.add(MYG);
function seg(g, a, b, h0, h1) {
  var L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.05 || h1 - h0 < 0.05) return;
  var geo = new THREE.BoxGeometry(L, h1 - h0, 0.6), me = new THREE.Mesh(geo, WC);
  me.position.set((a[0] + b[0]) / 2 - 200, (h0 + h1) / 2, (a[1] + b[1]) / 2 - 135); me.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(me);
  var l = new THREE.LineSegments(new THREE.EdgesGeometry(geo), EC); l.position.copy(me.position); l.rotation.copy(me.rotation); g.add(l);
}
function colw(a, b) { var n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2)); for (var j = 0; j < n; j++) { var x = a[0] + (b[0] - a[0]) * (j + 0.5) / n, y = a[1] + (b[1] - a[1]) * (j + 0.5) / n; COL.push([x - 0.9, y - 0.9, x + 0.9, y + 0.9, 0, 'my', CPX]); } }
function addRoom(r) {
  var P = r.pts, n = P.length, i, q = r.door, cp = r.c || 'apex', nx0 = NX[cp] || 45; CPX = cp;
  function ed(i) { return [P[i], P[(i + 1) % n]]; }
  if (!q) { var bl = 0; for (i = 0; i < n; i++) { var e0 = ed(i), l0 = Math.hypot(e0[1][0] - e0[0][0], e0[1][1] - e0[0][1]); if (l0 > bl) { bl = l0; q = [(e0[0][0] + e0[1][0]) / 2, (e0[0][1] + e0[1][1]) / 2]; } } }
  var di = 0, bd = 1e9, dt = 0.5;
  for (i = 0; i < n; i++) { var e = ed(i), ex = e[1][0] - e[0][0], ey = e[1][1] - e[0][1], t = clamp(((q[0] - e[0][0]) * ex + (q[1] - e[0][1]) * ey) / (ex * ex + ey * ey || 1), 0, 1), d = Math.hypot(q[0] - e[0][0] - ex * t, q[1] - e[0][1] - ey * t); if (d < bd) { bd = d; di = i; dt = t; } }
  var cx = 0, cy = 0; P.forEach(function (p) { cx += p[0] / n; cy += p[1] / n; });
  var E = ed(di), nx = E[1][1] - E[0][1], ny = -(E[1][0] - E[0][0]);
  if (nx * ((E[0][0] + E[1][0]) / 2 - cx) + ny * ((E[0][1] + E[1][1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
  var rot = -Math.PI / 2 - Math.atan2(ny, nx), cs = Math.cos(rot), sn = Math.sin(rot);
  var Q = P.map(function (p) { return [(p[0] * cs - p[1] * sn) * 2, (p[0] * sn + p[1] * cs) * 2]; });
  var mnx = Math.min.apply(null, Q.map(function (p) { return p[0]; })), mxx = Math.max.apply(null, Q.map(function (p) { return p[0]; })), mxy = Math.max.apply(null, Q.map(function (p) { return p[1]; }));
  var tx = nx0 - mnx, ty = ROWY - Q[di][1]; Q = Q.map(function (p) { return [p[0] + tx, p[1] + ty]; }); mxy += ty;
  var Hh = clamp(r.h, 2, 6) * 2, g = new THREE.Group(), cg = new THREE.Group(); MYG.add(g); Cg.add(cg);
  var A = Q[di], B = Q[(di + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), dw = Math.max(1.5, Math.min(DWU, L - 0.8)), tl = clamp(dt * L, dw / 2 + 0.4, Math.max(dw / 2 + 0.4, L - dw / 2 - 0.4));
  function on(s) { return [A[0] + (B[0] - A[0]) * s / L, A[1] + (B[1] - A[1]) * s / L]; }
  var D = on(tl), s1 = on(tl - dw / 2), s2 = on(tl + dw / 2);
  for (i = 0; i < n; i++) {
    if (i === di) { seg(g, A, s1, 0, Hh); seg(g, s2, B, 0, Hh); seg(g, s1, s2, Math.min(DHU, Hh - 0.6), Hh); colw(A, s1); colw(s2, B); }
    else { seg(g, Q[i], Q[(i + 1) % n], 0, Hh); colw(Q[i], Q[(i + 1) % n]); }
  }
  var sh = new THREE.Shape(Q.map(function (p) { return new THREE.Vector2(p[0] - 200, p[1] - 135); }));
  var fl = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0x2a1f52, roughness: 0.9, side: THREE.DoubleSide })); fl.rotation.x = Math.PI / 2; fl.position.y = 0.06; g.add(fl);
  var ce = new THREE.Mesh(new THREE.ShapeGeometry(sh), CE); ce.rotation.x = Math.PI / 2; ce.position.y = Hh; cg.add(ce);
  box(D[0] - 3, 231, D[0] + 3, ROWY, -0.5, 0.03, PA, null, g); if (cp === 'apex' && D[0] > 250) box(250, 219, D[0] + 3, 231, -0.5, 0.03, PA, null, g); if (cp !== 'apex') box(30, 219, D[0] + 3, 231, -0.5, 0.03, PA, null, g);
  var iy = ROWY + Math.min(6, (mxy - ROWY) / 2), lb = label(r.name, 17, '#a78bfa'); lb.position.set(D[0] - 200, Hh + 3, iy - 135); lb.userData = { x: D[0], y: iy, fl: 0, c: cp }; Lb.add(lb);
  var id = 'R' + r.k, jd = 'RJ' + r.k; N[id] = [D[0], iy]; N[jd] = [D[0], 225]; NC[id] = NC[jd] = cp; LOC.push({ id: id, label: r.name, c: cp });
  link(jd, id); link(jd, 'P1'); link(jd, 'P2'); link(jd, 'GATE');
  RM[r.k] = { g: g, c: cg, lab: lb, m: Q, cx: D[0], cy: iy, cp: cp }; NX[cp] = mxx + tx + 8; g.visible = cg.visible = cp === CUR;
}
function mmRoom(g, Q) { g.fillStyle = '#2a1f4d'; g.strokeStyle = '#a78bfa'; g.lineWidth = 1.5; g.beginPath(); Q.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill(); g.stroke(); }
function clearRooms() {
  Object.keys(RM).forEach(function (k) { MYG.remove(RM[k].g); Cg.remove(RM[k].c); Lb.remove(RM[k].lab); }); RM = {}; NX = {}; NC = {};
  LOC = LOC.filter(function (l) { return !/^R\d+$/.test(l.id); }); Object.keys(N).forEach(function (k) { if (/^RJ?\d+$/.test(k)) delete N[k]; });
  EDGES = EDGES.filter(function (e) { return !/^RJ?\d+$/.test(e.a) && !/^RJ?\d+$/.test(e.b); }); COL = COL.filter(function (c) { return c[5] !== 'my'; });
}
function refreshLists() {
  var cl = CL(), rl = cl.filter(function (l) { return l.id !== 'GATE'; }), ap = CUR === 'apex', def = { st: ap ? 'A-ENT' : 'GATE', ds: ap ? 'B0-01' : (rl[0] ? rl[0].id : 'GATE') };
  ['st', 'ds'].forEach(function (id) {
    var s = $(id), v = s.value, ok = false; s.innerHTML = '';
    cl.forEach(function (l) { var o = document.createElement('option'); o.value = l.id; o.textContent = l.label; s.appendChild(o); if (l.id === v) ok = true; });
    s.value = ok ? v : def[id];
  });
  var dl = $('rooms'); dl.innerHTML = ''; cl.forEach(function (l) { var o = document.createElement('option'); o.value = l.label; dl.appendChild(o); });
}
function renderMy() {
  var u = $('mylist'); u.innerHTML = ''; var mine = MY.filter(function (r) { return (r.c || 'apex') === CUR; }); $('mycount').textContent = mine.length ? mine.length + ' saved' : '';
  if (!mine.length) { var e0 = document.createElement('li'); e0.className = 'text-slate-500 px-1'; e0.textContent = 'No rooms here yet.'; u.appendChild(e0); }
  mine.forEach(function (r) {
    var li = document.createElement('li'), s = document.createElement('span'); li.className = 'flex items-center gap-1.5 rounded bg-slate-900/70 border border-slate-800 px-2 py-1.5';
    s.className = 'flex-1 truncate'; s.textContent = r.name; li.appendChild(s);
    [['v', 'View'], ['g', 'Walk'], ['d', '✕']].forEach(function (b) { var x = document.createElement('button'); x.type = 'button'; x.className = 'px-2 py-1 rounded border border-slate-700 hover:bg-slate-800'; x.textContent = b[1]; x.setAttribute('data-a', b[0]); x.setAttribute('data-k', r.k); if (b[0] === 'd') x.setAttribute('aria-label', 'Delete ' + r.name); li.appendChild(x); });
    u.appendChild(li);
  });
}
function afterRooms() {
  refreshLists(); renderMy(); mmS = [0, 1].map(mkMM);
  saveState({ K: MYK, rooms: MY, camps: CAMPS.filter(function (c) { return !c.base; }).map(function (c) { return { id: c.id, name: c.name, type: c.type }; }), CK: CK, cur: CUR });
  if (mode === 'orbit') compute();
}
function focusRoom(k) { var o = RM[k]; if (!o) return; if (mode !== 'orbit') setMode('orbit'); gT.set(o.cx - 200, 0, o.cy - 135); gR = 70; }
$('mylist').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return; var k = +b.getAttribute('data-k'), a = b.getAttribute('data-a');
  if (a === 'v') focusRoom(k);
  else if (a === 'g') { $('st').value = 'GATE'; $('ds').value = 'R' + k; if (mode === 'walk') respawn(); else setMode('walk'); }
  else { MY = MY.filter(function (r) { return r.k !== k; }); clearRooms(); MY.forEach(addRoom); afterRooms(); }
});

