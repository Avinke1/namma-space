// ---- Data (same campus graph and A* engine as the 2D map) ----
var LOC = [
  { id: 'GATE', label: 'Main Gate' }, { id: 'A-ENT', label: 'A Main Entrance' },
  { id: 'A0-01', label: 'A-001 Classroom' }, { id: 'A0-02', label: 'A-002 Seminar Room' },
  { id: 'A0-03', label: 'A-003 Physics Lab' }, { id: 'A0-06', label: 'A-006 Cafeteria' },
  { id: 'B0-01', label: 'B-001 Central Library' }, { id: 'B0-02', label: 'B-002 Study Hall' },
  { id: 'B0-03', label: 'B-003 Computer Lab' }, { id: 'EXIT-E', label: 'East Emergency Exit' }
];
var N = {
  'GATE':[45,225], 'P1':[75,225], 'P2':[237.5,225], 'A-ENT':[75,200], 'B-ENT':[237.5,200],
  'A1':[57.5,122], 'AH':[75,122], 'A2':[95.5,122], 'A3':[133.5,122], 'AC':[145,122], 'AE':[190,122],
  'BW':[210,122], 'B1':[237.5,122], 'B2':[275.5,122], 'B3':[313.5,122], 'EXIT-E':[370,122],
  'A0-01':[57.5,80], 'A0-02':[95.5,80], 'A0-03':[133.5,80], 'A0-06':[145,162],
  'B0-01':[237.5,80], 'B0-02':[275.5,80], 'B0-03':[313.5,80]
};
var EDGES = [];
function link(a, b, steps) { EDGES.push({ a: a, b: b, steps: !!steps }); }
function chain(ids) { for (var i = 0; i < ids.length - 1; i++) link(ids[i], ids[i + 1]); }
chain(['GATE','P1','P2','B-ENT']); link('P1','A-ENT'); link('A-ENT','AH'); link('B-ENT','B1');
chain(['A1','AH','A2','A3','AC','AE']); link('AE','BW',true); chain(['BW','B1','B2','B3','EXIT-E']);
link('A0-01','A1'); link('A0-02','A2'); link('A0-03','A3'); link('A0-06','AC');
link('B0-01','B1'); link('B0-02','B2'); link('B0-03','B3');
var STAIRS = [[36,140,52,190],[216,140,232,190]], FLN = {}, FLR = 0;
LOC.push({id:'A0-04',label:'A-004 Admin Office'},{id:'B0-05',label:'B-005 Auditorium'});
[['A1-01','A-101 Chemistry Lab'],['A1-02','A-102 Art Studio'],['A1-03','A-103 Music Room'],['A1-04','A-104 Staff Room'],['B1-01','B-101 Lecture Hall'],['B1-02','B-102 Language Lab'],['B1-03','B-103 Principal Office'],['B1-04','B-104 Reading Lounge']].forEach(function (r) { LOC.push({ id: r[0], label: r[1], fl: 1 }); });
Object.assign(N, {'A4':[94,150],'A0-04':[94,178],'B4':[275.5,150],'B0-05':[275.5,178],'SA0':[44,196],'SB0':[224,196],'UA1':[57.5,122],'UAH':[75,122],'UA2':[95.5,122],'UA3':[133.5,122],'UAC':[145,122],'UB1':[237.5,122],'UB2':[275.5,122],'UB3':[313.5,122],'UB4':[275.5,150],'SA1':[44,132],'SB1':[224,132],'A1-01':[57.5,80],'A1-02':[95.5,80],'A1-03':[133.5,80],'A1-04':[145,162],'B1-01':[237.5,80],'B1-02':[275.5,80],'B1-03':[313.5,80],'B1-04':[275.5,178]});
link('A4','A2'); link('A0-04','A4'); link('B4','B2'); link('B0-05','B4'); link('SA0','A-ENT'); link('SB0','B-ENT');
chain(['UA1','UAH','UA2','UA3','UAC']); chain(['UB1','UB2','UB3']);
link('A1-01','UA1'); link('A1-02','UA2'); link('A1-03','UA3'); link('A1-04','UAC'); link('B1-01','UB1'); link('B1-02','UB2'); link('B1-03','UB3'); link('B1-04','UB4'); link('UB4','UB2');
link('SA1','UA1'); link('SB1','UB1'); link('SA0','SA1',true); link('SB0','SB1',true);
Object.keys(N).forEach(function (k) { if (/^(U|SA1|SB1|A1-|B1-)/.test(k)) FLN[k] = 1; });
function pt(id) { return [N[id][0], N[id][1], FLN[id] || 0]; }
function ramp(x, y) { for (var i = 0; i < STAIRS.length; i++) { var q = STAIRS[i]; if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return clamp((q[3] - y) / (q[3] - q[1]), 0, 1) * 8; } return -1; }
function hAt(x, y, f) { var r = ramp(x, y); return r >= 0 ? r + 0.4 : f * 8 + (f ? 0 : fh(x, y)); }
function dist(a, b) { var p = N[a], q = N[b]; return Math.hypot(p[0]-q[0], p[1]-q[1]); }
