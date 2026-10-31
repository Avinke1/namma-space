// Persistence layer: everything the app remembers between visits.
// Saved shape: { K, rooms, camps, CK, cur }  (room counter, scanned rooms, user-made places, place counter, current place)
var STORE = 'apex-rooms-v1';
function saveState(state) { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
function loadState() { return JSON.parse(localStorage.getItem(STORE)); }  // callers wrap in try/catch, as before
