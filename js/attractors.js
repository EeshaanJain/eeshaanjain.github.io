// Comet background: faint white comets ride a strange attractor behind the page, their streaks
// fading away behind them. The scene is part of the PAGE (it scrolls with the content) and is
// built from independent CELLS, each with its own random camera angle, roll, mirror, scale,
// offset and comets, so nothing ever repeats. Cells are created as you scroll towards them
// (pre-warmed) and dropped once you leave, so the cost is constant however long the page gets.
//
//  - two buttons next to the theme switch: background on/off (remembered), and a randomizer
//  - only a window-sized canvas is ever used; it is created lazily, so "off" costs nothing
//  - pauses when the tab is hidden; one static frame when the user prefers reduced motion
//  - monochrome: white on dark, soft grey on light; follows data-theme on <html>
//  - ?attractor=lorenz in the URL forces a system
(function () {
  'use strict';

  // ---- systems: f(x, y, z, out) writes the derivative into out ------------------------
  // dt = integration step. Steps per frame are measured per system in analyze().
  var SYSTEMS = [
    { name: 'Aizawa',
      eq: ["ẋ = (z − b)x − dy", "ẏ = dx + (z − b)y", "ż = c + az − z³/3 − (x² + y²)(1 + ez) + fzx³"],
      params: ["a = 0.95", "b = 0.7", "c = 0.6", "d = 3.5", "e = 0.25", "f = 0.1"],
      dt: 0.01, init: [0.1, 0, 0],
      f: function (x, y, z, o) {
        var a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, g = 0.1;
        o[0] = (z - b) * x - d * y;
        o[1] = d * x + (z - b) * y;
        o[2] = c + a * z - z * z * z / 3 - (x * x + y * y) * (1 + e * z) + g * z * x * x * x;
      } },
    { name: 'Lorenz',
      eq: ["ẋ = σ(y − x)", "ẏ = x(ρ − z) − y", "ż = xy − βz"],
      params: ["σ = 10", "ρ = 28", "β = 8/3"],
      dt: 0.005, init: [1, 1, 1],
      f: function (x, y, z, o) {
        o[0] = 10 * (y - x);
        o[1] = x * (28 - z) - y;
        o[2] = x * y - (8 / 3) * z;
      } },
    { name: 'Thomas',
      eq: ["ẋ = <span class=\"fn\">sin</span> y − bx", "ẏ = <span class=\"fn\">sin</span> z − by", "ż = <span class=\"fn\">sin</span> x − bz"],
      params: ["b = 0.208186"],
      dt: 0.05, init: [0.1, 0, 0],
      f: function (x, y, z, o) {
        var b = 0.208186;
        o[0] = Math.sin(y) - b * x;
        o[1] = Math.sin(z) - b * y;
        o[2] = Math.sin(x) - b * z;
      } },
    { name: 'Halvorsen',
      eq: ["ẋ = −ax − 4y − 4z − y²", "ẏ = −ay − 4z − 4x − z²", "ż = −az − 4x − 4y − x²"],
      params: ["a = 1.4"],
      dt: 0.006, init: [-1.48, -1.51, 2.04],
      f: function (x, y, z, o) {
        var a = 1.4;
        o[0] = -a * x - 4 * y - 4 * z - y * y;
        o[1] = -a * y - 4 * z - 4 * x - z * z;
        o[2] = -a * z - 4 * x - 4 * y - x * x;
      } },
    { name: 'Rössler',
      eq: ["ẋ = −y − z", "ẏ = x + ay", "ż = b + z(x − c)"],
      params: ["a = 0.2", "b = 0.2", "c = 5.7"],
      dt: 0.02, init: [1, 1, 0],
      f: function (x, y, z, o) {
        o[0] = -y - z;
        o[1] = x + 0.2 * y;
        o[2] = 0.2 + z * (x - 5.7);
      } },
    { name: 'Chen',
      eq: ["ẋ = a(y − x)", "ẏ = (c − a)x − xz + cy", "ż = xy − bz"],
      params: ["a = 35", "b = 3", "c = 28"],
      dt: 0.002, init: [-3, 2, 20],
      f: function (x, y, z, o) {
        o[0] = 35 * (y - x);
        o[1] = -7 * x - x * z + 28 * y;
        o[2] = x * y - 3 * z;
      } },
    { name: 'Dadras',
      eq: ["ẋ = y − px + qyz", "ẏ = ry − xz + z", "ż = sxy − ez"],
      params: ["p = 3", "q = 2.7", "r = 1.7", "s = 2", "e = 9"],
      dt: 0.006, init: [1.1, 2.1, -2],
      f: function (x, y, z, o) {
        o[0] = y - 3 * x + 2.7 * y * z;
        o[1] = 1.7 * y - x * z + z;
        o[2] = 2 * x * y - 9 * z;
      } },
    { name: 'Four-Wing',
      eq: ["ẋ = ax + yz", "ẏ = bx + cy − xz", "ż = −z − xy"],
      params: ["a = 0.2", "b = 0.01", "c = −0.4"],
      dt: 0.02, init: [1.3, 0, -0.75],
      f: function (x, y, z, o) {
        o[0] = 0.2 * x + y * z;
        o[1] = 0.01 * x - 0.4 * y - x * z;
        o[2] = -z - x * y;
      } }
  ];

  // ---- RK4 on a flat Float64Array, in place, allocation-free ----------------------------
  var k1 = [0, 0, 0], k2 = [0, 0, 0], k3 = [0, 0, 0], k4 = [0, 0, 0];
  function rk4(f, P, i, dt) {
    var x = P[i], y = P[i + 1], z = P[i + 2], h = dt * 0.5;
    f(x, y, z, k1);
    f(x + h * k1[0], y + h * k1[1], z + h * k1[2], k2);
    f(x + h * k2[0], y + h * k2[1], z + h * k2[2], k3);
    f(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2], k4);
    var s = dt / 6;
    P[i]     = x + s * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    P[i + 1] = y + s * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    P[i + 2] = z + s * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
  }

  // Warm up one trajectory to get points that already lie ON the attractor, plus its
  // centre and radius, so every system auto-fits the canvas.
  var SAMPLES = 1500;
  function analyze(sys) {
    if (sys.flow) return analyzeFlow(sys);
    var P = new Float64Array(sys.init), S = new Float32Array(SAMPLES * 3), i, j;
    for (i = 0; i < 2000; i++) rk4(sys.f, P, 0, sys.dt);
    for (j = 0; j < SAMPLES; j++) {
      for (i = 0; i < 4; i++) rk4(sys.f, P, 0, sys.dt);
      S[j * 3] = P[0]; S[j * 3 + 1] = P[1]; S[j * 3 + 2] = P[2];
    }
    var cx = 0, cy = 0, cz = 0;
    for (j = 0; j < SAMPLES; j++) { cx += S[j * 3]; cy += S[j * 3 + 1]; cz += S[j * 3 + 2]; }
    cx /= SAMPLES; cy /= SAMPLES; cz /= SAMPLES;
    var R = 0;
    for (j = 0; j < SAMPLES; j++) {
      var dx = S[j * 3] - cx, dy = S[j * 3 + 1] - cy, dz = S[j * 3 + 2] - cz;
      R = Math.max(R, Math.sqrt(dx * dx + dy * dy + dz * dz));
    }
    var o = [0, 0, 0], speed = 0;
    for (j = 0; j < SAMPLES; j++) {
      sys.f(S[j * 3], S[j * 3 + 1], S[j * 3 + 2], o);
      speed += Math.sqrt(o[0] * o[0] + o[1] * o[1] + o[2] * o[2]);
    }
    speed /= SAMPLES;
    // aim for a head moving ~0.4% of the radius per frame. Too fast: shrink the time step
    // (ts); too slow: take a few steps per frame (k). Every system then flows at a similar pace.
    var frac = speed * sys.dt / R, target = 0.004;
    var k = frac >= target ? 1 : Math.max(1, Math.min(8, Math.round(target / frac)));
    var ts = frac > target ? target / frac : 1;
    var ok = isFinite(R) && R > 1e-3 && R < 1e4 && isFinite(k) && isFinite(ts);
    return { ok: ok, S: S, cx: cx, cy: cy, cz: cz, R: R, k: k, ts: ts };
  }

  // "Flow" mode: instead of the attractor, show the FLOW. Comets are launched from random points in a
  // ball and wind towards wherever the system takes them, then are relaunched as they age. This is
  // how sinks, limit cycles and multi-stable systems (a "galaxy") show up: not as one curve, but as
  // the whole field of trajectories converging.
  function analyzeFlow(sys) {
    var span = (sys.flow && sys.flow.span) || 4, S = new Float32Array(SAMPLES * 3), P = new Float64Array(3);
    var n = 0, tries = 0, i, j, x, y, z, o = [0, 0, 0], speed = 0;
    while (n < SAMPLES && tries < 600) {
      tries++;
      do { x = (Math.random() * 2 - 1) * span; y = (Math.random() * 2 - 1) * span; z = (Math.random() * 2 - 1) * span; } while (x * x + y * y + z * z > span * span);
      P[0] = x; P[1] = y; P[2] = z;
      for (j = 0; j < 30 && n < SAMPLES; j++) {                       // follow it for a while, sampling as we go
        for (i = 0; i < 40; i++) rk4(sys.f, P, 0, sys.dt);
        if (!(Math.abs(P[0]) + Math.abs(P[1]) + Math.abs(P[2]) < 1e4)) break;   // this one escaped: try another start
        S[n * 3] = P[0]; S[n * 3 + 1] = P[1]; S[n * 3 + 2] = P[2]; n++;
      }
    }
    if (n < SAMPLES / 2) return { ok: false, reason: 'most trajectories fly off to infinity' };
    for (j = n; j < SAMPLES; j++) { S[j * 3] = S[(j % n) * 3]; S[j * 3 + 1] = S[(j % n) * 3 + 1]; S[j * 3 + 2] = S[(j % n) * 3 + 2]; }
    for (j = 0; j < SAMPLES; j++) { sys.f(S[j * 3], S[j * 3 + 1], S[j * 3 + 2], o); speed += Math.sqrt(o[0] * o[0] + o[1] * o[1] + o[2] * o[2]); }
    speed /= SAMPLES;
    var R = span * 1.5, frac = speed * sys.dt / R, target = 0.004;
    if (!(speed > 1e-6) || !isFinite(speed)) return { ok: false, reason: 'nothing moves' };
    var k = frac >= target ? 1 : Math.max(1, Math.min(8, Math.round(target / frac)));
    var ts = frac > target ? target / frac : 1;
    return { ok: true, S: S, cx: 0, cy: 0, cz: 0, R: R, k: k, ts: ts, flow: true, span: span, life: (sys.flow && sys.flow.life) || 1000 };
  }

  // ===========================================================================================
  //  Your own ODE: text -> tokens -> syntax tree -> generated JS -> a system rk4() can run.
  //  Nothing the user types is ever evaluated: the JS is generated from the tree, and the tree
  //  can only contain numbers, x/y/z, parameters, + - * / ^ and a whitelist of Math functions.
  // ===========================================================================================
  var FUNCS = { sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan',
                sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh', exp: 'Math.exp', ln: 'Math.log', log: 'Math.log',
                sqrt: 'Math.sqrt', abs: 'Math.abs', sign: 'Math.sign' };
  var FUNC_NAMES = Object.keys(FUNCS).sort(function (a, b) { return b.length - a.length; });   // longest first
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

  function normalizeMath(src) {
    return String(src).replace(/<[^>]*>/g, '')                                  // the preset text contains <span>
      .replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/÷/g, '/')
      .replace(/\*\*/g, '^')
      .replace(/[⁰¹²³⁴-⁹]+/g, function (m) {      // x² -> x^2
        return '^' + m.split('').map(function (c) { return SUP[c]; }).join('');
      })
      .replace(/\s+/g, ' ').trim();
  }

  function tokenize(s) {
    var toks = [], i = 0, m, rest, run, f, j;
    while (i < s.length) {
      var c = s.charAt(i);
      if (c === ' ') { i++; continue; }
      rest = s.slice(i);
      if ((m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest))) { toks.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ((m = /^[A-Za-zα-ωΑ-Ω_]+/.exec(rest))) {
        run = m[0]; i += run.length;
        if (run === 'pi' || run === 'π') { toks.push({ t: 'num', v: Math.PI }); continue; }
        while (run.length) {                                   // "xy" -> x, y ; "sinx" -> sin, x ; "sinh" stays sinh
          f = null;
          for (j = 0; j < FUNC_NAMES.length; j++) if (run.indexOf(FUNC_NAMES[j]) === 0) { f = FUNC_NAMES[j]; break; }
          if (f) { toks.push({ t: 'fn', v: f }); run = run.slice(f.length); }
          else { toks.push({ t: 'id', v: run.charAt(0) }); run = run.slice(1); }
        }
        continue;
      }
      if ('+-*/^(),'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new Error("I don't understand the character “" + c + "”");
    }
    return toks;
  }

  // grammar:  expr = term {(+|-) term} ; term = unary {(*|/|nothing) unary} ; unary = -unary | power ;
  //           power = atom [^ unary] ; atom = number | x | y | z | parameter | fn(expr) | fn atom | (expr)
  function parseTokens(toks, params) {
    var p = 0;
    function isOp(v) { var t = toks[p]; return !!t && t.t === 'op' && t.v === v; }
    function startsFactor(t) { return !!t && (t.t === 'num' || t.t === 'id' || t.t === 'fn' || (t.t === 'op' && t.v === '(')); }
    function expect(v) { if (!isOp(v)) throw new Error('a “' + v + '” is missing'); p++; }
    function expr() {
      var l = term();
      while (isOp('+') || isOp('-')) { var op = toks[p++].v; l = { k: 'bin', op: op, l: l, r: term() }; }
      return l;
    }
    function term() {
      var l = unary();
      for (;;) {
        if (isOp('*') || isOp('/')) { var op = toks[p++].v; l = { k: 'bin', op: op, l: l, r: unary() }; }
        else if (startsFactor(toks[p])) l = { k: 'bin', op: '*', l: l, r: unary() };      // implicit multiplication: 2xy, (z-b)x
        else return l;
      }
    }
    function unary() {
      if (isOp('-')) { p++; return { k: 'neg', a: unary() }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      var b = atom();
      if (isOp('^')) { p++; return { k: 'pow', a: b, b: unary() }; }
      return b;
    }
    function atom() {
      var t = toks[p++], a, name;
      if (!t) throw new Error('the expression ends too early');
      if (t.t === 'num') return { k: 'num', v: t.v };
      if (t.t === 'fn') {
        if (isOp('(')) { p++; a = expr(); expect(')'); } else a = unary();                // sin(y)  or  sin y
        return { k: 'fn', f: t.v, a: a };
      }
      if (t.t === 'id') {
        name = t.v;
        if (name === 'x' || name === 'y' || name === 'z') return { k: 'var', n: name };
        if (name === 'X' || name === 'Y' || name === 'Z') return { k: 'var', n: name.toLowerCase() };
        if (params && Object.prototype.hasOwnProperty.call(params, name)) return { k: 'num', v: params[name] };
        if (name === 'e') return { k: 'num', v: Math.E };
        if (name === 't') throw new Error('time (t) is not supported: the equations may only use x, y, z and your parameters');
        throw new Error('“' + name + '” is not defined. Add it under parameters, like ' + name + ' = 2');
      }
      if (t.t === 'op' && t.v === '(') { a = expr(); expect(')'); return a; }
      throw new Error('unexpected “' + t.v + '”');
    }
    var tree = expr();
    if (p < toks.length) {
      var t = toks[p];
      throw new Error(t.t === 'op' && t.v === ')' ? 'there is a “)” too many' : 'I got stuck at “' + (t.v !== undefined ? t.v : '?') + '”');
    }
    return tree;
  }

  function emitJS(n) {
    switch (n.k) {
      case 'num': if (!isFinite(n.v)) throw new Error('a number is not finite'); return n.v < 0 ? '(' + n.v + ')' : String(n.v);
      case 'var': return n.n;
      case 'neg': return '(-' + emitJS(n.a) + ')';
      case 'bin': return '(' + emitJS(n.l) + n.op + emitJS(n.r) + ')';
      case 'pow': return 'Math.pow(' + emitJS(n.a) + ',' + emitJS(n.b) + ')';
      case 'fn':  return FUNCS[n.f] + '(' + emitJS(n.a) + ')';
    }
    throw new Error('internal: unknown node');
  }

  // "a = 10, b = 28, c = 8/3"  ->  { a: 10, b: 28, c: 2.6667 }  (+ readable badges)
  function parseParams(text) {
    var params = {}, badges = [], parts = String(text || '').split(/[,;\n]+/), i, mm, name, val;
    for (i = 0; i < parts.length; i++) {
      var part = normalizeMath(parts[i]);
      if (!part) continue;
      mm = /^([A-Za-zα-ωΑ-Ω])\s*=\s*(.+)$/.exec(part);
      if (!mm) throw new Error(/^[A-Za-z\u03B1-\u03C9\u0391-\u03A9_]{2,}\s*=/.test(part)
        ? 'parameter names are a single letter (like a, b or \u03BC), so \u201C' + part.split('=')[0].trim() + '\u201D will not work'
        : 'parameters look like  a = 10, b = 28  (I could not read \u201C' + part + '\u201D)');
      name = mm[1];
      if ('xyzXYZt'.indexOf(name) >= 0) throw new Error('“' + name + '” is a variable or time, so it cannot be a parameter');
      try { val = Function('"use strict";return ' + emitJS(parseTokens(tokenize(mm[2]), params)))(); }   // generated from the tree only
      catch (e) { throw new Error('parameter ' + name + ': ' + e.message); }
      if (!isFinite(val)) throw new Error('parameter ' + name + ' is not a finite number');
      params[name] = val; badges.push(name + ' = ' + mm[2].trim());
    }
    return { params: params, badges: badges };
  }

  var LHS = /^\s*(?:[ẋẏż]|[xyz][′'̇˙]|d\s*[xyz]\s*\/\s*dt)\s*=\s*/i;      // optional "ẋ =" / "x' =" / "dx/dt =" prefix

  // spec = { eq: [dx, dy, dz], params: "a = 10, ..." }  ->  { f, eq, params } or { error }
  function compileSystem(spec) {
    var names = ['x', 'y', 'z'], code = '', shown = [], i, pr, src, tree, js;
    try {
      pr = parseParams(spec.params);
      for (i = 0; i < 3; i++) {
        src = normalizeMath(spec.eq[i] || '').replace(LHS, '');
        if (!src) throw new Error('the equation for d' + names[i] + '/dt is empty');
        if (src.length > 400) throw new Error('the equation for d' + names[i] + '/dt is too long');
        if (src.indexOf('=') >= 0) throw new Error('write only the right-hand side of d' + names[i] + '/dt (no “=”)');
        try { tree = parseTokens(tokenize(src), pr.params); js = emitJS(tree); }
        catch (e) { throw new Error('d' + names[i] + '/dt: ' + e.message); }
        code += 'o[' + i + ']=' + js + ';';
        shown.push(src);
      }
      var f = new Function('x', 'y', 'z', 'o', code);          // code was generated from the tree: only whitelisted pieces
      var probe = [0, 0, 0], ok = false, pts = [[0.3, -0.2, 0.5], [1, 1, 1], [0.1, 0, 0], [-0.7, 0.4, 1.3]];
      for (i = 0; i < pts.length; i++) { f(pts[i][0], pts[i][1], pts[i][2], probe); if (isFinite(probe[0] + probe[1] + probe[2])) { ok = true; break; } }
      if (!ok) throw new Error('the equations give “not a number” (division by zero? log or sqrt of a negative?)');
      return { f: f, eq: shown, params: pr.badges };
    } catch (e) {
      return { error: e.message };
    }
  }

  // pick integration steps that stay bounded for this system (largest first, then halved for accuracy)
  function autoSteps(f, init) {
    var dts = [0.02, 0.01, 0.005, 0.002, 0.001], out = [], k, i, P, m, ok;
    for (k = 0; k < dts.length; k++) {
      P = new Float64Array(init); ok = true;
      for (i = 0; i < 4000; i++) {
        rk4(f, P, 0, dts[k]);
        m = Math.abs(P[0]) + Math.abs(P[1]) + Math.abs(P[2]);
        if (!(m < 1e5)) { ok = false; break; }
      }
      if (ok) { out.push(Math.max(dts[k] / 2, 0.0005)); break; }
    }
    return out;
  }

  // does the solution stay put? Run 120 time units; the size over the 2nd half must not outgrow the
  // size over the 1st. This rejects blow-ups (x'=x^2), exponential growth (x'=x) and steady drift.
  function isBounded(f, init, dt) {
    var P = new Float64Array(init), n = Math.min(240000, Math.ceil(120 / dt)), q = n >> 2, h = n >> 1, mA = 0, mB = 0, m, i;
    for (i = 0; i < n; i++) {
      rk4(f, P, 0, dt);
      m = Math.sqrt(P[0] * P[0] + P[1] * P[1] + P[2] * P[2]);
      if (!(m < 1e5)) return false;
      if (i >= q && i < h) { if (m > mA) mA = m; } else if (i >= h && m > mB) mB = m;
    }
    return mB <= 1.8 * mA + 1e-6;
  }

  // step size for flow mode: most random starts must stay finite for a while
  function autoStepsFlow(f, span) {
    var dts = [0.02, 0.01, 0.005, 0.002, 0.001], k, s, i, P, good, x, y, z;
    for (k = 0; k < dts.length; k++) {
      good = 0;
      for (s = 0; s < 6; s++) {
        do { x = (Math.random() * 2 - 1) * span; y = (Math.random() * 2 - 1) * span; z = (Math.random() * 2 - 1) * span; } while (x * x + y * y + z * z > span * span);
        P = new Float64Array([x, y, z]);
        for (i = 0; i < 3000; i++) { rk4(f, P, 0, dts[k]); if (!(Math.abs(P[0]) + Math.abs(P[1]) + Math.abs(P[2]) < 1e5)) break; }
        if (i === 3000) good++;
      }
      if (good >= 4) return [Math.max(dts[k] / 2, 0.0005)];
    }
    return [];
  }

  // text -> a system the scene can fly comets on, or a plain-language reason why not
  function fitCustom(spec) {
    var c = compileSystem(spec);
    if (c.error) return { error: c.error };
    if (spec.flow) {                                            // flow mode: no attractor needed
      var span = spec.span && String(spec.span).trim() ? Number(spec.span) : 4;
      if (!(span > 0 && span <= 1000)) return { error: 'Launch radius must be a positive number (or leave it blank for 4)' };
      var fdts = (spec.step && String(spec.step).trim()) ? [Number(spec.step)] : autoStepsFlow(c.f, span);
      if (!fdts.length || !(fdts[0] > 0 && fdts[0] <= 0.5)) return { error: fdts.length ? 'Step must be a number between 0 and 0.5 (or leave it blank for automatic)' : 'The flow blows up from most starting points (try smaller coefficients, or check a sign).' };
      var fsys = { name: spec.name || 'Custom', custom: true, flow: { span: span, life: 1000 }, eq: c.eq, params: c.params, dt: fdts[0], init: [0, 0, 0], f: c.f };
      var fa = analyze(fsys);
      return fa.ok ? { sys: fsys, a: fa } : { error: 'Nothing to draw: ' + fa.reason + '.' };
    }
    var inits, steps = null, nums, dt, reason = 'the trajectory never settles', k, d, init, dts, sysObj, a;
    if (spec.start && String(spec.start).trim()) {
      nums = String(spec.start).split(/[,\s;]+/).filter(Boolean).map(Number);
      if (nums.length !== 3 || nums.some(function (v) { return !isFinite(v); })) return { error: 'Start must be three numbers, like  0.1, 0, 0' };
      inits = [nums];
    } else inits = [[0.1, 0, 0], [1, 1, 1], [0.5, -0.5, 0.2], [-1, 2, 0.3], [2, -1, 0.5]];
    if (spec.step && String(spec.step).trim()) {
      dt = Number(spec.step);
      if (!(dt > 0 && dt <= 0.5)) return { error: 'Step must be a number between 0 and 0.5 (or leave it blank for automatic)' };
      steps = [dt];
    }
    for (k = 0; k < inits.length; k++) {
      init = inits[k];
      dts = steps || autoSteps(c.f, init);
      if (!dts.length) { reason = 'the solution blows up (try smaller coefficients, or check a sign)'; continue; }
      for (d = 0; d < dts.length; d++) {
        if (!isBounded(c.f, init, dts[d])) { reason = 'the solution keeps growing instead of settling onto an attractor'; continue; }
        sysObj = { name: spec.name || 'Custom', custom: true, eq: c.eq, params: c.params, dt: dts[d], init: init, f: c.f };
        a = analyze(sysObj);
        if (a.ok) return { sys: sysObj, a: a };
        reason = !isFinite(a.R) ? 'the solution blows up' : a.R <= 1e-3 ? 'the solution settles to a single point, so there is nothing to draw' : 'the solution grows without bound';
      }
    }
    return { error: 'That does not settle onto a bounded attractor: ' + reason + '.' };
  }

  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined') module.exports = { SYSTEMS: SYSTEMS, analyze: analyze, compileSystem: compileSystem, fitCustom: fitCustom, normalizeMath: normalizeMath };
    return;
  }

  // ---- state ----------------------------------------------------------------------------
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COMETS_PER_CELL = 130, TRAIL = 120, BANDS = 10, CELLS_MAX = 8;
  var nCell = COMETS_PER_CELL;
  var PX = new Float32Array(CELLS_MAX * COMETS_PER_CELL * TRAIL), PY = new Float32Array(CELLS_MAX * COMETS_PER_CELL * TRAIL);
  var cells = {}, cellList = [];                              // active cells, by index down the page
  var pageSeed = (Math.random() * 1e9) | 0;                   // the arrangement: re-rolled by the randomizer

  var canvas = null, ctx = null, W = 0, H = 0;
  var enabled = true, inited = false;
  var state, sys, ranked = [], pos = 0, customSpec = null;
  var raf = 0, last = 0, running = false;
  var lay = { cx: 0, r: 0, cy0: 0, P: 0 };

  try { enabled = localStorage.getItem('bg') !== 'off'; } catch (e) {}

  function plain(t) { return t.toLowerCase().normalize ? t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : t.toLowerCase(); }

  // very light, no colour: white on the dark theme, a soft ink-grey on the light one
  function palette() {
    return root.getAttribute('data-theme') === 'dark'
      ? { rgb: '255,255,255', tail: 0.075, head: 0.6 }
      : { rgb: '24,28,42', tail: 0.07, head: 0.28 };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resize() {
    W = root.clientWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    lay.cx = W / 2;
    lay.r = Math.max(W, H) * 0.8;                             // bigger than the screen: you see the middle of a huge field
    lay.cy0 = lay.r * 0.62;                                   // centre of the first cell, in page coordinates
    lay.P = lay.r * 0.85;                                     // spacing between cell centres: neighbours overlap, so no empty stretches
    nCell = W < 700 ? 60 : COMETS_PER_CELL;
    cells = {}; cellList.length = 0;
    ctx.clearRect(0, 0, W, H);
  }

  // ---- cells ----------------------------------------------------------------------------
  // each cell k gets its own look, derived from the page seed
  function cellParams(k) {
    var rnd = mulberry32((pageSeed + k * 7919 + 17) >>> 0), th, ph, ro;
    var p = {
      r: lay.r * (0.75 + 0.55 * rnd()),
      cx: lay.cx + (rnd() - 0.5) * lay.r * 0.6,
      cy: lay.cy0 + k * lay.P + (rnd() - 0.5) * lay.P * 0.3,
      mirror: rnd() < 0.5 ? -1 : 1
    };
    th = rnd() * 6.2832; ph = 0.15 + rnd() * 1.0; ro = rnd() * 6.2832;
    p.ct = Math.cos(th); p.st = Math.sin(th); p.cp = Math.cos(ph); p.sp = Math.sin(ph);
    p.cr = Math.cos(ro); p.sr = Math.sin(ro);
    return p;
  }

  function seedComet(cell, c) {
    if (state.flow) {                                         // launched from a random point in the ball
      var sp = state.span, x, y, z;
      do { x = (Math.random() * 2 - 1) * sp; y = (Math.random() * 2 - 1) * sp; z = (Math.random() * 2 - 1) * sp; } while (x * x + y * y + z * z > sp * sp);
      cell.HP[c * 3] = x; cell.HP[c * 3 + 1] = y; cell.HP[c * 3 + 2] = z; cell.AGE[c] = 0;
      return;
    }
    var S = state.S, j = ((Math.random() * SAMPLES) | 0) * 3, e = state.R * 1e-3;
    cell.HP[c * 3]     = S[j]     + (Math.random() - 0.5) * e;
    cell.HP[c * 3 + 1] = S[j + 1] + (Math.random() - 0.5) * e;
    cell.HP[c * 3 + 2] = S[j + 2] + (Math.random() - 0.5) * e;
  }

  // move every comet in a cell forward and record one trail point per frame
  function advanceCell(cell, steps) {
    var f = sys.f, h = sys.dt * state.ts, R = state.R, cx = state.cx, cy = state.cy, cz = state.cz, c, s, k3, u, v, w, o;
    var cnt = cell.n || nCell, life = cell.life || state.life;
    for (c = 0; c < cnt; c++) {
      k3 = c * 3;
      for (s = 0; s < steps; s++) rk4(f, cell.HP, k3, h);
      if (state.flow && ++cell.AGE[c] > life) {          // old enough: relaunch, and break the streak
        seedComet(cell, c);
        o = (c * TRAIL + cell.ti) * 3; cell.TR[o] = NaN; cell.TR[o + 1] = 0; cell.TR[o + 2] = 0;
        continue;
      }
      u = (cell.HP[k3] - cx) / R; v = (cell.HP[k3 + 1] - cy) / R; w = (cell.HP[k3 + 2] - cz) / R;
      o = (c * TRAIL + cell.ti) * 3;
      if (!(u * u + v * v + w * w < 25)) {                    // flew off: re-seed, and break the streak
        seedComet(cell, c);
        cell.TR[o] = NaN; cell.TR[o + 1] = 0; cell.TR[o + 2] = 0;
      } else { cell.TR[o] = u; cell.TR[o + 1] = v; cell.TR[o + 2] = w; }
    }
    cell.ti = (cell.ti + 1) % TRAIL;
  }

  function newCell(k, p, n, life) {
    var cell = { k: k, p: p, n: n || 0, life: life || 0, HP: new Float64Array(COMETS_PER_CELL * 3), TR: new Float32Array(COMETS_PER_CELL * TRAIL * 3), AGE: new Int32Array(COMETS_PER_CELL), ti: 0 };
    var c, f, a, h = sys.dt * state.ts, cnt = n || nCell, lf = life || state.life;
    for (c = 0; c < cnt; c++) {
      seedComet(cell, c);
      if (state.flow) {                                         // stagger the ages, and fly each comet that far, so the flow is already formed
        a = (Math.random() * lf) | 0; cell.AGE[c] = a;
        for (f = 0; f < a * state.k; f++) rk4(sys.f, cell.HP, c * 3, h);
      }
    }
    for (var f = 0; f < TRAIL; f++) advanceCell(cell, state.k);   // pre-warm: it arrives fully grown, not growing in
    return cell;
  }

  // create the cells that are (almost) on screen, drop the ones we have scrolled away from
  function ensureCells() {
    var sy = window.pageYOffset || 0, reach = 2.2 * lay.r;
    var lo = Math.max(0, Math.floor((sy - reach - lay.cy0) / lay.P)), hi = Math.ceil((sy + H + reach - lay.cy0) / lay.P);
    var keep = {}, k, key, cell, p, ys;
    cellList.length = 0;
    for (k = lo; k <= hi; k++) {
      cell = cells[k]; p = cell ? cell.p : cellParams(k);
      ys = p.cy - sy;
      if (ys + 1.6 * p.r < 0 || ys - 1.6 * p.r > H) continue;     // not close enough yet
      if (!cell) {
        if (cellList.length >= CELLS_MAX) continue;
        cell = cells[k] = newCell(k, p);
      }
      keep[k] = 1; cellList.push(cell);
    }
    for (key in cells) if (!keep[key]) delete cells[key];
  }

  // pos = which system (index into ranked); every cell starts over on it
  function useSystem(p) {
    pos = p;
    var r = ranked[p];
    sys = r.s; state = r.a;
    canvas.setAttribute('data-system', sys.name);
    renderOde();
    markRunning();
    cells = {}; cellList.length = 0;
    ensureCells();
    ctx.clearRect(0, 0, W, H);
  }

  // ---- drawing --------------------------------------------------------------------------
  function draw() {
    var pal = palette(), sy = window.pageYOffset || 0;
    var ci, c, i, b, s, cell, p, base, o, u, v, w, xr, yr, d, q, X, Y, hx, hy, pen, a, e, t, s0, s1, lo = -30, hi = H + 30;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!cellList.length) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 1) project every comet of every active cell straight to screen coordinates
    for (ci = 0; ci < cellList.length; ci++) {
      cell = cellList[ci]; p = cell.p;
      var oy = p.cy - sy, rr = p.r;
      for (c = 0; c < nCell; c++) {
        base = (ci * COMETS_PER_CELL + c) * TRAIL;
        for (i = 0; i < TRAIL; i++) {
          o = (c * TRAIL + ((cell.ti + i) % TRAIL)) * 3;      // oldest -> newest
          u = cell.TR[o];
          if (u !== u) { PX[base + i] = NaN; continue; }
          v = cell.TR[o + 1]; w = cell.TR[o + 2];
          xr = u * p.ct - v * p.st; yr = u * p.st + v * p.ct;
          d = yr * p.cp + w * p.sp;
          q = 1 / (1 - d * 0.22);
          X = xr * q; Y = (w * p.cp - yr * p.sp) * q;
          PX[base + i] = p.cx + p.mirror * (X * p.cr - Y * p.sr) * rr;
          PY[base + i] = oy - (X * p.sr + Y * p.cr) * rr;
        }
      }
    }

    // 2) the streaks: ONE stroke per band covers every comet in every cell
    for (b = 0; b < BANDS; b++) {
      t = (b + 0.5) / BANDS;
      s0 = 1 + Math.floor((TRAIL - 1) * b / BANDS); s1 = 1 + Math.floor((TRAIL - 1) * (b + 1) / BANDS);
      ctx.strokeStyle = 'rgba(' + pal.rgb + ',' + (pal.tail * Math.pow(t, 1.7)).toFixed(4) + ')';
      ctx.lineWidth = 0.4 + 0.6 * t;
      ctx.beginPath();
      for (ci = 0; ci < cellList.length; ci++) {
        for (c = 0; c < nCell; c++) {
          base = (ci * COMETS_PER_CELL + c) * TRAIL; pen = false;
          for (s = s0; s < s1; s++) {
            a = base + s - 1; e = base + s;
            if (PX[a] !== PX[a] || PX[e] !== PX[e]) { pen = false; continue; }
            if ((PY[a] < lo && PY[e] < lo) || (PY[a] > hi && PY[e] > hi)) { pen = false; continue; }   // off screen
            if (!pen) { ctx.moveTo(PX[a], PY[a]); pen = true; }
            ctx.lineTo(PX[e], PY[e]);
          }
        }
      }
      ctx.stroke();
    }

    // 3) comet heads: a tiny dot, nothing more
    ctx.fillStyle = 'rgba(' + pal.rgb + ',' + pal.head.toFixed(3) + ')';
    ctx.beginPath();
    for (ci = 0; ci < cellList.length; ci++) {
      for (c = 0; c < nCell; c++) {
        e = (ci * COMETS_PER_CELL + c) * TRAIL + TRAIL - 1; hx = PX[e]; hy = PY[e];
        if (hx !== hx || hy < lo || hy > hi) continue;
        ctx.moveTo(hx + 1.1, hy); ctx.arc(hx, hy, 1.1, 0, 6.2832);
      }
    }
    ctx.fill();
  }

  // ---- frame loop -----------------------------------------------------------------------
  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = last ? Math.min(now - last, 50) : 16.7;
    last = now;
    var steps = Math.max(1, Math.round(state.k * dt / 16.7));
    ensureCells();
    for (var i = 0; i < cellList.length; i++) advanceCell(cellList[i], steps);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!enabled || !inited || running || reduced || document.hidden) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  // ---- the scene, built once, the first time the background is switched on --------------
  function sceneInit() {
    inited = true;
    canvas = document.createElement('canvas');
    canvas.className = 'bg-attractor';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    SYSTEMS.forEach(function (sy) { var a = analyze(sy); if (a.ok) ranked.push({ s: sy, a: a }); });   // ~15 ms
    try { customSpec = JSON.parse(localStorage.getItem('ode') || 'null'); } catch (e) { customSpec = null; }
    if (customSpec && customSpec.eq) {                      // the system you wrote last time
      var saved = fitCustom(customSpec);
      if (saved.error) customSpec = null; else ranked.push({ s: saved.sys, a: saved.a });
    }
    if (!ranked.length) { inited = false; return; }

    readPin();
    if (pin && pin.spec) {                                    // a saved custom background becomes the custom entry
      var pf = fitCustom(pin.spec);
      if (pf.error) pin = null;
      else {
        for (var q = ranked.length - 1; q >= 0; q--) if (ranked[q].s.custom) ranked.splice(q, 1);
        ranked.push({ s: pf.sys, a: pf.a }); customSpec = pin.spec;
      }
    }
    var want = (/[?&]attractor=([^&]+)/.exec(location.search) || [])[1], first = -1, i;
    if (want) {
      want = plain(decodeURIComponent(want));
      for (i = 0; i < ranked.length; i++) if (plain(ranked[i].s.name).indexOf(want) === 0) first = i;
    }
    if (first < 0 && pin) {                                   // your saved background beats a random pick (?attractor= still wins)
      for (i = 0; i < ranked.length; i++) {
        if (pin.preset ? (!ranked[i].s.custom && ranked[i].s.name === pin.preset) : ranked[i].s.custom) { first = i; break; }
      }
    }
    if (first < 0) {                                  // random, but not the previous visit's pick
      var lastPick = '';
      try { lastPick = sessionStorage.getItem('attractor') || ''; } catch (e) {}
      first = (Math.random() * SYSTEMS.length) | 0;           // a preset, never the custom one, on arrival
      if (first >= ranked.length) first = 0;
      if (ranked.length > 1 && ranked[first].s.name === lastPick) first = (first + 1) % SYSTEMS.length % ranked.length;
    }
    try { sessionStorage.setItem('attractor', ranked[first].s.name); } catch (e) {}

    resize();
    useSystem(first);

    window.addEventListener('resize', function () {
      if (!enabled) return;
      resize(); ensureCells(); if (reduced) draw();
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    new MutationObserver(function () { if (enabled && reduced) draw(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (reduced) {                                          // not animating: repaint when the page scrolls
      var pending = false;
      window.addEventListener('scroll', function () {
        if (pending || !enabled) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; ensureCells(); draw(); });
      }, { passive: true });
    }
  }

  // ---- on / off / randomize -------------------------------------------------------------
  var btnBg, btnShuffle, btnHelp, pop, popInfo, popEdit;

  function syncButtons() {
    btnBg.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btnBg.setAttribute('aria-label', enabled ? 'Turn the background animation off' : 'Turn the background animation on');
    btnBg.title = enabled ? 'Background: on' : 'Background: off';
    var can = enabled && inited;
    btnHelp.disabled = !can;
    btnHelp.title = can ? 'Show the equations' : 'Turn the background on to see its equations';
    if (!can) closeOde();
  }

  // ---- the "?" popover: the equations of whatever system is running ----------------------
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function renderOde() {
    if (!pop || !sys) return;
    var custom = !!sys.custom, named = custom && sys.name !== 'Custom', dots = ['ẋ', 'ẏ', 'ż'];
    var eqs = sys.eq.map(function (l, k) { return '<div>' + (custom ? dots[k] + ' = ' + esc(l) : l) + '</div>'; }).join('');
    var params = sys.params.map(function (p) { return '<span class="badge">' + esc(p) + '</span>'; }).join('');
    var title = custom ? (named ? esc(sys.name) : 'Your system') : sys.name + ' attractor';
    var sub = custom ? (sys.flow ? 'comets launched from random starting points, following the flow' : (named ? 'an attractor from the Fun page' : 'the equations you wrote'))
                     : 'a system of three ordinary differential equations';
    popInfo.innerHTML =
      '<div class="ode-title">' + title + '</div>' +
      '<div class="ode-sub">' + sub + '</div>' +
      '<div class="ode-eq">' + eqs + '</div>' +
      (params ? '<div class="ode-params">' + params + '</div>' : '') +
      '<p class="ode-note">' + (sys.flow ? 'Every streak is one trajectory, launched from a random point and integrated with RK4.'
                                         : 'Every streak is one trajectory of this system, integrated with RK4.') + '</p>' +
      '<div class="ode-actions"><button type="button" class="ode-btn" data-act="pin"></button>' +
      '<button type="button" class="ode-btn" data-act="edit">✎ Write your own</button>' +
      (custom ? '<button type="button" class="ode-btn ghost" data-act="remove">Remove it</button>' : '') + '</div>' +
      '<div class="ode-pinned" hidden></div>' +
      '<a class="ode-more" href="/fun/ode">More ODEs to try →</a>';
    updatePinUI();
  }

  function showView(name) {
    var editing = name === 'edit';
    popInfo.hidden = editing; popEdit.hidden = !editing;
    pop.classList.toggle('editing', editing);
    if (editing) {
      var first = popEdit.querySelector('input'), f = popEdit.elements;
      if (!f.e0.value && !f.e1.value && !f.e2.value) fillTemplate(popEdit);
      if (first) first.focus();
    }
  }

  // fill a form with the running system, in the form the editor understands
  function fillTemplate(form) {
    form = form || popEdit;
    var f = form.elements, k, eq = sys.eq, sp = sys.custom && customSpec ? customSpec : {};
    for (k = 0; k < 3; k++) f['e' + k].value = sys.custom ? eq[k] : normalizeMath(eq[k]).replace(LHS, '');
    f.params.value = sys.params.join(', ');
    f.start.value = sp.start || ''; f.step.value = sp.step || '';
    f.mode.value = sys.flow ? 'flow' : 'attractor';
    f.span.value = sys.flow ? String(sys.flow.span) : '';
    setMsg('', '', form);
  }

  // fill a form with a library entry
  function fillFromItem(form, item) {
    var f = form.elements, k;
    for (k = 0; k < 3; k++) f['e' + k].value = item.eq[k];
    f.params.value = item.params || '';
    f.start.value = item.start || ''; f.step.value = '';
    f.mode.value = item.flow ? 'flow' : 'attractor';
    f.span.value = item.flow && item.span ? String(item.span) : '';
    setMsg('', '', form);
  }

  function setMsg(text, kind, form) { var m = (form || popEdit).querySelector('.ode-msg'); m.textContent = text; m.className = 'ode-msg' + (kind ? ' ' + kind : ''); }

  function ensureOn() { if (!enabled || !inited) enable(); return enabled && inited; }

  // ---- "use as my background": remember a choice so every page starts with it -----------
  var pin = null;
  var PIN_ICO = '<svg class="ode-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';

  function specKey(sp) { return sp ? JSON.stringify([sp.name || 'Custom', sp.eq, sp.params || '', sp.start || '', sp.step || '', !!sp.flow, String(sp.span || '')]) : ''; }
  function readPin() {
    try { pin = JSON.parse(localStorage.getItem('bgpin') || 'null'); } catch (e) { pin = null; }
    if (pin && !pin.preset && !(pin.spec && pin.spec.eq)) pin = null;
    return pin;
  }
  function writePin() { try { if (pin) localStorage.setItem('bgpin', JSON.stringify(pin)); else localStorage.removeItem('bgpin'); } catch (e) {} }
  function currentLabel() { return !sys ? '' : sys.custom ? (sys.name === 'Custom' ? 'Your system' : sys.name) : sys.name; }
  function pinLabel() { return !pin ? '' : pin.preset ? pin.preset : (pin.spec.name && pin.spec.name !== 'Custom' ? pin.spec.name : 'your system'); }
  function isPinned() {
    if (!pin || !sys) return false;
    return pin.preset ? (!sys.custom && sys.name === pin.preset) : (!!sys.custom && !!customSpec && specKey(pin.spec) === specKey(customSpec));
  }

  function togglePin() {
    if (!sys) return;
    if (isPinned()) { pin = null; writePin(); toast('Removed. The background will be random again.'); }
    else { pin = sys.custom ? { spec: customSpec } : { preset: sys.name }; writePin(); toast('Saved. ' + currentLabel() + ' will be your background.'); }
    updatePinUI();
  }

  function updatePinUI() {
    var on = isPinned(), btns = document.querySelectorAll('[data-pin], [data-act="pin"]'), i, note = document.querySelector('#ode-pop .ode-pinned');
    for (i = 0; i < btns.length; i++) {
      btns[i].innerHTML = PIN_ICO + (on ? 'Your background' : 'Use as my background');
      btns[i].classList.toggle('active', on);
      btns[i].title = on ? 'Click to remove it: the background will be random again' : 'Start every page with this system';
    }
    if (note) { note.hidden = !(pin && !on); note.textContent = (pin && !on) ? 'Your saved background is ' + pinLabel() + '. Saving this one replaces it.' : ''; }
  }

  function addCustom(res, spec) {
    for (var i = ranked.length - 1; i >= 0; i--) if (ranked[i].s.custom) ranked.splice(i, 1);
    ranked.push({ s: res.sys, a: res.a });
    customSpec = spec;
    try { localStorage.setItem('ode', JSON.stringify(spec)); } catch (e) {}
    useSystem(ranked.length - 1);
    if (reduced) draw();
  }

  function removeCustom() {
    var wasCurrent = !!(sys && sys.custom), i;
    for (i = ranked.length - 1; i >= 0; i--) if (ranked[i].s.custom) ranked.splice(i, 1);
    customSpec = null;
    try { localStorage.removeItem('ode'); } catch (e) {}
    popEdit.reset();
    if (wasCurrent) { pageSeed = (Math.random() * 1e9) | 0; useSystem((Math.random() * ranked.length) | 0); if (reduced) draw(); }
    else renderOde();
    markRunning();
  }

  function specFromForm(form) {
    var f = form.elements;
    return { name: 'Custom', eq: [f.e0.value, f.e1.value, f.e2.value], params: f.params.value, start: f.start.value, step: f.step.value, flow: f.mode.value === 'flow', span: f.span.value };
  }

  function runCustom(form) {
    form = form || popEdit;
    if (!ensureOn()) { setMsg('The background could not start.', 'error', form); return; }
    var spec = specFromForm(form), res = fitCustom(spec);
    if (res.error) { setMsg(res.error, 'error', form); return; }
    pageSeed = (Math.random() * 1e9) | 0;
    addCustom(res, spec);
    if (form === popEdit) { setMsg('', '', form); showView('info'); }
    else setMsg('Running your system. Press ? for its equations.', 'ok', form);
  }

  // ---- the Fun page: a gallery that drives the same engine ------------------------------
  var LIB = [], pageEdit = null, toastEl = null, toastTimer = 0;

  function toast(text) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ode-toast'; toastEl.setAttribute('role', 'status'); (document.querySelector('.float-group') || document.body).appendChild(toastEl); }
    toastEl.textContent = text; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  function markRunning() {
    var cards = document.querySelectorAll('.fun-card'), i, on, b, runningCard = null;
    for (i = 0; i < cards.length; i++) {
      on = !!(enabled && inited && sys && sys.custom && sys.name === cards[i].getAttribute('data-name'));
      cards[i].classList.toggle('running', on);
      b = cards[i].querySelector('[data-try]'); if (b) b.textContent = on ? '● Running' : '▶ Try it';
      if (on) runningCard = cards[i];
    }
    updatePinUI();
    if (!pageEdit) return;                                    // only the Fun page has previews
    if (!runningCard) stopPreview();
    else if (!pv || pv.card !== runningCard) { stopPreview(); startPreview(runningCard); }
  }

  // ---- a live preview on top of the card that is running ----------------------------------
  // The page background is zoomed far in, so comets move a few px per frame there. A card is a
  // much smaller canvas, so the same system is stepped several times per frame to look alive.
  var pv = null;

  function pvPalette() {
    return root.getAttribute('data-theme') === 'dark' ? { rgb: '255,255,255', tail: 0.6, head: 0.95 } : { rgb: '24,28,42', tail: 0.55, head: 0.9 };
  }

  function stopPreview() {
    if (!pv) return;
    if (pv.raf) cancelAnimationFrame(pv.raf);
    pv.card.classList.remove('previewing');
    pv = null;
  }

  function startPreview(card) {
    var box = card.querySelector('.fun-preview'), cv = box && box.querySelector('canvas');
    if (!cv || !state || !sys) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.max(box.clientWidth || card.clientWidth, 160), H = 170;
    var n = 70, life = state.flow ? Math.max(80, (state.life / 12) | 0) : 0;   // stepped 6x per frame, and relaunched often enough to stay mid-transient
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    // pick the camera that shows this system best: try a grid of angles, keep the one that spreads the
    // sampled points out the most on screen (largest covariance determinant), then fit the scale to it
    var S = state.S, j, u, v, w, xr, yr, dd, q, X, Y, ti, pi, th, ph, ct, st, cp, sp, best = -1, bth = 0.6, bph = 0.5;
    var mx, my, sx, sy, sxx, syy, sxy, area;
    for (ti = 0; ti < 12; ti++) {
      for (pi = 0; pi < 4; pi++) {
        th = ti * Math.PI / 12; ph = 0.2 + pi * 0.35;
        ct = Math.cos(th); st = Math.sin(th); cp = Math.cos(ph); sp = Math.sin(ph);
        sx = sy = sxx = syy = sxy = 0;
        for (j = 0; j < SAMPLES; j += 3) {
          u = (S[j * 3] - state.cx) / state.R; v = (S[j * 3 + 1] - state.cy) / state.R; w = (S[j * 3 + 2] - state.cz) / state.R;
          xr = u * ct - v * st; yr = u * st + v * ct; dd = yr * cp + w * sp; q = 1 / (1 - dd * 0.22);
          X = xr * q; Y = (w * cp - yr * sp) * q;
          sx += X; sy += Y; sxx += X * X; syy += Y * Y; sxy += X * Y;
        }
        sx /= SAMPLES / 3; sy /= SAMPLES / 3;
        area = (sxx / (SAMPLES / 3) - sx * sx) * (syy / (SAMPLES / 3) - sy * sy) - Math.pow(sxy / (SAMPLES / 3) - sx * sy, 2);
        if (area > best) { best = area; bth = th; bph = ph; }
      }
    }
    ct = Math.cos(bth); st = Math.sin(bth); cp = Math.cos(bph); sp = Math.sin(bph); mx = my = 1e-6;
    for (j = 0; j < SAMPLES; j++) {
      u = (S[j * 3] - state.cx) / state.R; v = (S[j * 3 + 1] - state.cy) / state.R; w = (S[j * 3 + 2] - state.cz) / state.R;
      xr = u * ct - v * st; yr = u * st + v * ct; dd = yr * cp + w * sp; q = 1 / (1 - dd * 0.22);
      X = Math.abs(xr * q); Y = Math.abs((w * cp - yr * sp) * q);
      if (X > mx) mx = X; if (Y > my) my = Y;
    }
    pv = { card: card, cv: cv, ctx: cv.getContext('2d'), W: W, H: H, dpr: dpr, n: n, last: 0, raf: 0, th: bth, ph: bph, mX: 0, mY: 0, frames: 0, r: Math.min(W * 0.46 / mx, H * 0.44 / my),
           cell: newCell(-1, null, n, life), PX: new Float32Array(n * TRAIL), PY: new Float32Array(n * TRAIL) };
    card.classList.add('previewing');
    if (state.flow) for (j = 0; j < 4; j++) refitPreview();
    drawPreview();
    if (!reduced) pv.raf = requestAnimationFrame(pvFrame);
  }

  function pvFrame(now) {
    if (!pv) return;
    pv.raf = 0;
    if (document.hidden) return;                               // visibilitychange restarts it
    var dt = pv.last ? Math.min(now - pv.last, 50) : 16.7;
    pv.last = now;
    advanceCell(pv.cell, Math.max(1, Math.round(state.k * 6 * dt / 16.7)));
    if (state.flow && ++pv.frames % 20 === 0) refitPreview();
    drawPreview();
    pv.raf = requestAnimationFrame(pvFrame);
  }

  // flows: zoom and pan to where the comets actually are (not where they were launched)
  function refitPreview() {
    var p = pv, n = p.n, TR = p.cell.TR, ct = Math.cos(p.th), st = Math.sin(p.th), cp = Math.cos(p.ph), sp = Math.sin(p.ph);
    var xs = new Float32Array(n * 40), ys = new Float32Array(n * 40), cnt = 0, i, j, o, u, v, w, xr, yr, dd, q, X, Y, mx = 0, my = 0;
    for (i = 0; i < n; i++) {
      for (j = 0; j < TRAIL; j += 3) {
        o = (i * TRAIL + j) * 3; u = TR[o]; if (u !== u) continue;
        v = TR[o + 1]; w = TR[o + 2];
        xr = u * ct - v * st; yr = u * st + v * ct; dd = yr * cp + w * sp; q = 1 / (1 - dd * 0.22);
        X = xr * q; Y = (w * cp - yr * sp) * q;
        xs[cnt] = X; ys[cnt] = Y; mx += X; my += Y; cnt++;
      }
    }
    if (cnt < 30) return;
    mx /= cnt; my /= cnt;
    var ax = new Float32Array(cnt), ay = new Float32Array(cnt);
    for (i = 0; i < cnt; i++) { ax[i] = Math.abs(xs[i] - mx); ay[i] = Math.abs(ys[i] - my); }
    ax.sort(); ay.sort();
    var px = Math.max(ax[Math.floor(cnt * 0.94)] * 1.15, 1e-3), py = Math.max(ay[Math.floor(cnt * 0.94)] * 1.15, 1e-3);
    var target = Math.min(p.W * 0.46 / px, p.H * 0.44 / py);
    p.r += (target - p.r) * 0.35; p.mX += (mx - p.mX) * 0.35; p.mY += (my - p.mY) * 0.35;
  }

  function drawPreview() {
    var p = pv, c = p.ctx, d = p.dpr, W = p.W * d, H = p.H * d, cell = p.cell, n = p.n, pal = pvPalette();
    var ct = Math.cos(p.th), st = Math.sin(p.th), cp = Math.cos(p.ph), sp = Math.sin(p.ph);
    var r = p.r * d, cx = W / 2, cy = H / 2;
    var i, j, b, s, o, u, v, w, xr, yr, dd, q, X, Y, base, pen, a, e, t, s0, s1, hx, hy;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (i = 0; i < n; i++) {
      base = i * TRAIL;
      for (j = 0; j < TRAIL; j++) {
        o = (i * TRAIL + ((cell.ti + j) % TRAIL)) * 3; u = cell.TR[o];
        if (u !== u) { p.PX[base + j] = NaN; continue; }
        v = cell.TR[o + 1]; w = cell.TR[o + 2];
        xr = u * ct - v * st; yr = u * st + v * ct; dd = yr * cp + w * sp; q = 1 / (1 - dd * 0.22);
        X = xr * q; Y = (w * cp - yr * sp) * q;
        p.PX[base + j] = cx + (X - p.mX) * r; p.PY[base + j] = cy - (Y - p.mY) * r;
      }
    }
    for (b = 0; b < 8; b++) {
      t = (b + 0.5) / 8; s0 = 1 + Math.floor((TRAIL - 1) * b / 8); s1 = 1 + Math.floor((TRAIL - 1) * (b + 1) / 8);
      c.strokeStyle = 'rgba(' + pal.rgb + ',' + (pal.tail * Math.pow(t, 1.5)).toFixed(3) + ')';
      c.lineWidth = (0.6 + 0.9 * t) * d;
      c.beginPath();
      for (i = 0; i < n; i++) {
        base = i * TRAIL; pen = false;
        for (s = s0; s < s1; s++) {
          a = base + s - 1; e = base + s;
          if (p.PX[a] !== p.PX[a] || p.PX[e] !== p.PX[e]) { pen = false; continue; }
          if (!pen) { c.moveTo(p.PX[a], p.PY[a]); pen = true; }
          c.lineTo(p.PX[e], p.PY[e]);
        }
      }
      c.stroke();
    }
    c.fillStyle = 'rgba(' + pal.rgb + ',' + pal.head + ')';
    c.beginPath();
    for (i = 0; i < n; i++) {
      e = i * TRAIL + TRAIL - 1; hx = p.PX[e]; hy = p.PY[e];
      if (hx !== hx) continue;
      c.moveTo(hx + 1.6 * d, hy); c.arc(hx, hy, 1.6 * d, 0, 6.2832);
    }
    c.fill();
  }

  function findItem(id) { for (var i = 0; i < LIB.length; i++) if (LIB[i].id === id) return LIB[i]; return null; }

  function tryItem(id) {
    var item = findItem(id); if (!item) return;
    if (!ensureOn()) { toast('The background could not start.'); return; }
    var spec = { name: item.name, eq: item.eq, params: item.params || '', start: item.start || '', step: '', flow: !!item.flow, span: item.span || '' };
    var res = fitCustom(spec);
    if (res.error) { toast('Could not run ' + item.name + ': ' + res.error); return; }
    pageSeed = (Math.random() * 1e9) | 0;
    addCustom(res, spec);
    toast('Running ' + item.name + '. Press ? for its equations.');
  }

  function editItem(id) {
    var item = findItem(id); if (!item || !pageEdit) return;
    fillFromItem(pageEdit, item);
    setMsg('Loaded ' + item.name + '. Change anything, then press Run.', 'ok', pageEdit);
    pageEdit.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pageEdit.elements.e0.focus();
  }

  function cardHTML(it) {
    var dots = ['ẋ', 'ẏ', 'ż'];
    return '<article class="fun-card" data-name="' + esc(it.name) + '" data-id="' + esc(it.id) + '">' +
      '<div class="fun-preview" aria-hidden="true"><canvas></canvas></div><div class="fun-body">' +
      '<header class="fun-head"><h3>' + esc(it.name) + '</h3><span class="badge">' + (it.flow ? 'flow' : 'attractor') + '</span></header>' +
      '<p class="fun-blurb">' + esc(it.blurb) + '</p>' +
      '<div class="ode-eq">' + it.eq.map(function (l, k) { return '<div>' + dots[k] + ' = ' + esc(l) + '</div>'; }).join('') + '</div>' +
      (it.params ? '<div class="ode-params">' + it.params.split(/,\s*/).map(function (p) { return '<span class="badge">' + esc(p) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="ode-actions"><button type="button" class="ode-btn primary" data-try="' + esc(it.id) + '">▶ Try it</button>' +
      '<button type="button" class="ode-btn" data-edit="' + esc(it.id) + '">✎ Edit</button>' +
      '<button type="button" class="ode-btn pin-btn" data-pin="' + esc(it.id) + '"></button></div>' +
      '</div></article>';
  }

  function buildFun() {
    var ed = document.getElementById('ode-editor'), gal = document.getElementById('ode-gallery');
    if (!ed || !gal) return;
    LIB = window.ODE_LIBRARY || [];
    window.addEventListener('resize', function () { if (pv) { var c = pv.card; stopPreview(); startPreview(c); } });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && pv && !pv.raf && !reduced) { pv.last = 0; pv.raf = requestAnimationFrame(pvFrame); } });
    ed.innerHTML = editHTML(true);
    pageEdit = ed.querySelector('form');
    if (LIB.length) fillFromItem(pageEdit, LIB[0]);                       // start with the galaxy loaded
    pageEdit.addEventListener('submit', function (e) { e.preventDefault(); runCustom(pageEdit); });
    pageEdit.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (b && b.getAttribute('data-act') === 'template' && sys) fillTemplate(pageEdit);
    });
    var groups = [['fun', 'Fun to try'], ['standard', 'Standard ODEs']], html = '', g, items;
    for (g = 0; g < groups.length; g++) {
      items = LIB.filter(function (it) { return it.group === groups[g][0]; });
      if (items.length) html += '<h3 class="fun-group">' + groups[g][1] + '</h3><div class="fun-grid">' + items.map(cardHTML).join('') + '</div>';
    }
    gal.innerHTML = html;
    gal.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-try],[data-edit],[data-pin]') : null; if (!t) return;
      if (t.hasAttribute('data-try')) tryItem(t.getAttribute('data-try'));
      else if (t.hasAttribute('data-pin')) togglePin();
      else editItem(t.getAttribute('data-edit'));
    });
    markRunning();
  }

  function openOde() {
    if (btnHelp.disabled) return;
    renderOde(); showView('info'); pop.classList.add('open'); btnHelp.setAttribute('aria-expanded', 'true');
  }
  function closeOde() {
    if (!pop) return;
    pop.classList.remove('open'); btnHelp.setAttribute('aria-expanded', 'false');
  }

  function enable() {
    enabled = true;
    try { localStorage.setItem('bg', 'on'); } catch (e) {}
    if (!inited) sceneInit();
    if (!inited) { enabled = false; syncButtons(); return; }
    resize(); ensureCells();
    if (reduced) draw();
    root.classList.add('has-bg');                           // brings in the veil behind text
    requestAnimationFrame(function () { canvas.classList.add('ready'); });   // fade in
    start();
    syncButtons();
    markRunning();
  }

  function disable() {
    enabled = false;
    try { localStorage.setItem('bg', 'off'); } catch (e) {}
    stop();
    root.classList.remove('has-bg');
    if (canvas) {
      canvas.classList.remove('ready');                     // fade out, then free everything
      setTimeout(function () {
        if (!enabled) { cells = {}; cellList.length = 0; ctx.clearRect(0, 0, canvas.width, canvas.height); }
      }, 2800);
    }
    syncButtons();
    markRunning();
  }

  function randomize() {
    btnShuffle.classList.remove('spin'); void btnShuffle.offsetWidth; btnShuffle.classList.add('spin');
    var wasOn = enabled;
    if (!enabled) enable();
    if (!inited) return;
    if (wasOn || ranked.length > 1) {
      pageSeed = (Math.random() * 1e9) | 0;                 // a brand-new arrangement...
      var p = pos;
      if (ranked.length > 1) while (p === pos) p = (Math.random() * ranked.length) | 0;   // ...on a different system
      useSystem(p);
      if (reduced) draw();
    }
  }

  // ---- buttons, in the same group as the theme switch -----------------------------------
  var SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"';
  var ORBIT = '<circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/>' +
              '<path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"/><path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"/>';
  var SHUFFLE = '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/>' +
                '<path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/>' +
                '<path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>';

  function field(label, name, ph) {
    return '<label class="ode-field"><span class="ode-var">' + label + '</span>' +
           '<input class="ode-input" type="text" name="' + name + '" placeholder="' + ph + '" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off"></label>';
  }
  function modeField() {
    return '<label class="ode-field"><span class="ode-var">mode</span>' +
           '<select class="ode-input" name="mode"><option value="attractor">attractor: settle, then draw it</option><option value="flow">flow: launch comets from random starts</option></select></label>';
  }
  function editHTML(inline) {
    return '<form class="ode-view ode-edit' + (inline ? ' ode-inline' : '') + '" novalidate>' +
      '<div class="ode-title">Write your own</div>' +
      '<div class="ode-sub">Three equations in x, y and z. Your constants go under params.</div>' +
      field('ẋ =', 'e0', 'σ(y − x)') + field('ẏ =', 'e1', 'x(ρ − z) − y') + field('ż =', 'e2', 'xy − βz') +
      field('params', 'params', 'σ = 10, ρ = 28, β = 8/3') +
      '<details class="ode-adv"><summary>advanced</summary>' +
        modeField() + field('radius', 'span', 'flow: launch radius (blank = 4)') +
        field('start', 'start', 'attractor: x, y, z  (blank = automatic)') + field('step', 'step', 'time step  (blank = automatic)') +
      '</details>' +
      '<div class="ode-msg" role="status" aria-live="polite"></div>' +
      '<div class="ode-actions">' +
        '<button type="submit" class="ode-btn primary">Run</button>' +
        '<button type="button" class="ode-btn" data-act="template">Use current</button>' +
        (inline ? '' : '<button type="button" class="ode-btn ghost" data-act="back">Back</button>') +
      '</div>' +
      '<p class="ode-help">Use + − × / ^ and sin cos tan exp ln sqrt abs tanh. Multiplication can be implicit: 2xy, (z − b)x. Parameters are single letters. Anything typed here is parsed, never run as code.</p>' +
    '</form>';
  }

  var HELP = '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>';

  function buildUI() {
    var group = document.querySelector('.float-group');
    if (!group) { group = document.createElement('div'); group.className = 'float-group'; document.body.appendChild(group); }
    var themeBtn = group.querySelector('.theme-switch');

    pop = document.createElement('div');
    pop.className = 'ode-pop'; pop.id = 'ode-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'The equations behind the background');
    pop.innerHTML = '<div class="ode-view ode-info"></div>' + editHTML(false);
    popInfo = pop.querySelector('.ode-info'); popEdit = pop.querySelector('form.ode-edit'); popEdit.hidden = true;
    popInfo.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'edit') showView('edit'); else if (act === 'remove') removeCustom(); else if (act === 'pin') togglePin();
    });
    popEdit.addEventListener('submit', function (e) { e.preventDefault(); runCustom(popEdit); });
    popEdit.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
      if (b.getAttribute('data-act') === 'back') showView('info'); else if (b.getAttribute('data-act') === 'template') fillTemplate(popEdit);
    });
    group.appendChild(pop);

    btnHelp = document.createElement('button');
    btnHelp.type = 'button'; btnHelp.className = 'float-btn float-help';
    btnHelp.setAttribute('aria-label', 'Show the equations'); btnHelp.setAttribute('aria-expanded', 'false'); btnHelp.setAttribute('aria-controls', 'ode-pop');
    btnHelp.innerHTML = SVG + ' class="icon-help">' + HELP + '</svg>';
    btnHelp.addEventListener('click', function () { pop.classList.contains('open') ? closeOde() : openOde(); });
    document.addEventListener('click', function (e) {       // click anywhere else closes it (the other buttons keep it open)
      if (pop.classList.contains('open') && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.float-group'))) closeOde();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOde(); });

    btnShuffle = document.createElement('button');
    btnShuffle.type = 'button'; btnShuffle.className = 'float-btn float-shuffle';
    btnShuffle.title = 'Randomize the background'; btnShuffle.setAttribute('aria-label', 'Randomize the background');
    btnShuffle.innerHTML = SVG + ' class="icon-shuffle">' + SHUFFLE + '</svg>';
    btnShuffle.addEventListener('click', randomize);

    btnBg = document.createElement('button');
    btnBg.type = 'button'; btnBg.className = 'float-btn float-bg';
    btnBg.innerHTML = SVG + ' class="icon-on">' + ORBIT + '</svg>' +
                      SVG + ' class="icon-off">' + ORBIT + '<path d="m3 3 18 18"/></svg>';
    btnBg.addEventListener('click', function () { enabled ? disable() : enable(); });

    group.insertBefore(btnHelp, themeBtn);                  // order: [?] [shuffle] [on/off] [theme]
    group.insertBefore(btnShuffle, themeBtn);
    group.insertBefore(btnBg, themeBtn);
    syncButtons();
  }

  // don't compete with first paint
  function boot() {
    buildUI();
    buildFun();
    if (enabled) {
      if (window.requestIdleCallback) window.requestIdleCallback(enable, { timeout: 400 });
      else setTimeout(enable, 60);
    }
  }
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
})();
