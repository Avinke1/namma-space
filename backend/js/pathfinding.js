function astar(start, goal, stepFree) {
  var adj = {}, k; for (k in N) adj[k] = [];
  EDGES.forEach(function (e) { if (stepFree && e.steps) return; adj[e.a].push({ to: e.b, steps: e.steps }); adj[e.b].push({ to: e.a, steps: e.steps }); });
  var g = {}, came = {}, closed = {}, open = [start]; g[start] = 0;
  while (open.length) {
    var bi = 0, i;
    for (i = 1; i < open.length; i++) if (g[open[i]] + dist(open[i], goal) < g[open[bi]] + dist(open[bi], goal)) bi = i;
    var cur = open.splice(bi, 1)[0];
    if (cur === goal) {
      var path = [cur], used = false;
      while (came[cur]) { if (came[cur].steps) used = true; cur = came[cur].from; path.unshift(cur); }
      return { path: path, steps: used, units: g[goal] };
    }
    closed[cur] = true;
    adj[cur].forEach(function (n) {
      if (closed[n.to]) return;
      var ng = g[cur] + dist(cur, n.to);
      if (g[n.to] === undefined || ng < g[n.to]) { g[n.to] = ng; came[n.to] = { from: cur, steps: n.steps }; if (open.indexOf(n.to) < 0) open.push(n.to); }
    });
  }
  return null;
}
// Floor height: the linkway between blocks is a raised passage with 3 steps up and 3 down
function fh(x, y) { if (Math.abs(y - 122) > 5.5 || x < 190 || x > 210) return 0; var d = Math.min(x - 190, 210 - x); return d < 1 ? 0 : d < 3 ? 0.5 : d < 5 ? 1 : 1.5; }

