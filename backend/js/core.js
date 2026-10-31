// Shared helpers and app state. Needs three.js loaded first (V3 = THREE.Vector3).
var $ = function (i) { return document.getElementById(i); }, V3 = THREE.Vector3;
var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
var MY = [], MYK = 0, RM = {};
var CAMPS = [{ id: 'apex', name: 'APEX Campus', type: 'Campus', base: true }], CUR = 'apex', CK = 0, NX = {}, NC = {}, CPX = 'apex', MMV = { s: 0.6, x: 0, y: 0, x1: 0 };
var M_PER = 0.5, WALKMIN = 78, EYE = 3.4, H = 7, DW = 9, DH = 5.2, BASE = 9;

