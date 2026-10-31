// ---- Campuses: several places (campus, house, office...), each with its own rooms ----
var ENT = {}, delT = 0;
function curCamp() { return CAMPS.filter(function (c) { return c.id === CUR; })[0] || CAMPS[0]; }
function CL() { return LOC.filter(function (l) { return l.c ? l.c === CUR : (CUR === 'apex' || l.id === 'GATE'); }).map(function (l) { return l.id === 'GATE' && CUR !== 'apex' ? { id: 'GATE', label: 'Entrance' } : l; }); }
function inCamp(id) { var c = NC[id]; return c ? c === CUR : (CUR === 'apex' || id === 'GATE' || id === 'P1' || id === 'P2'); }
function addCampusObjs(c) { var t = label('Entrance', 14, '#a78bfa'); t.position.set(45 - 200, 4.5, 225 - 135); t.userData = { x: 45, y: 225, fl: 0, c: c.id }; Lb.add(t); ENT[c.id] = t; }
function renderCamps() {
  var s = $('campus'); s.innerHTML = '';
  CAMPS.forEach(function (c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.base ? c.name : c.name + ' (' + c.type.toLowerCase() + ')'; s.appendChild(o); });
  s.value = CUR; var c = curCamp();
  $('delcamp').classList.toggle('hidden', !!c.base); $('hsub').textContent = c.name; $('myhead').textContent = 'Rooms \u00b7 ' + c.name; $('campcount').textContent = CAMPS.length + (CAMPS.length === 1 ? ' place' : ' places');
}
function showCampus() {
  var a = CUR === 'apex';
  Object.keys(RM).forEach(function (k) { var v = RM[k].cp === CUR; RM[k].g.visible = v; RM[k].c.visible = v; });
  CgB.visible = a; $('uf').parentNode.classList.toggle('hidden', !a); $('samp').style.display = a ? '' : 'none';
  document.querySelectorAll('.foc').forEach(function (b) { b.classList.toggle('hidden', !a && b.getAttribute('data-f') !== 'ALL'); });
}
function focusCampus() {
  if (CUR === 'apex') { gT.set(0, 0, 0); gR = window.innerWidth < window.innerHeight ? 620 : 360; return; }
  var x1 = NX[CUR] || 95; gT.set((30 + x1) / 2 - 200, 0, 110); gR = clamp((x1 - 30) * 0.8 + 60, 90, 500);
}
function switchCampus(id) {
  if (mode !== 'orbit') setMode('orbit');
  CUR = id; $('st').innerHTML = ''; $('ds').innerHTML = ''; showCampus(); renderCamps(); afterRooms(); focusCampus();
}
$('campus').onchange = function () { switchCampus(this.value); };
$('addcamp').onclick = function () { $('campform').classList.toggle('hidden'); $('cn').focus(); };
$('ccancel').onclick = function () { $('campform').classList.add('hidden'); };
$('cn').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('cmake').click(); });
$('cmake').onclick = function () {
  var n = $('cn').value.trim(); if (!n) { toast('Give the new place a name first.'); $('cn').focus(); return; }
  var c = { id: 'c' + (++CK), name: n, type: $('ct').value }; CAMPS.push(c); addCampusObjs(c); $('cn').value = ''; $('campform').classList.add('hidden');
  switchCampus(c.id); toast('Created ' + n + '. Tap \u201cScan a new room\u201d to add its rooms.');
};
$('delcamp').onclick = function () {
  var b = this, c = curCamp(); if (c.base) return;
  if (!delT) { b.textContent = 'Tap again to confirm'; delT = setTimeout(function () { delT = 0; b.textContent = 'Delete'; }, 3500); return; }
  clearTimeout(delT); delT = 0; b.textContent = 'Delete';
  var id = c.id; MY = MY.filter(function (r) { return (r.c || 'apex') !== id; }); CAMPS = CAMPS.filter(function (x) { return x.id !== id; });
  if (ENT[id]) { Lb.remove(ENT[id]); delete ENT[id]; }
  CUR = 'apex'; clearRooms(); MY.forEach(addRoom); switchCampus('apex'); toast('Deleted ' + c.name);
};
(function () {
  try {
    var d = loadState(); if (d && d.rooms) { MY = d.rooms; MYK = d.K || 0; }
    if (d && d.camps) { d.camps.forEach(function (c) { CAMPS.push(c); addCampusObjs(c); }); CK = d.CK || CAMPS.length; if (d.cur && CAMPS.some(function (c) { return c.id === d.cur; })) CUR = d.cur; }
  } catch (e) {}
  MY.forEach(addRoom); showCampus(); renderCamps(); afterRooms(); focusCampus();
})();

compute(); requestAnimationFrame(frame);
