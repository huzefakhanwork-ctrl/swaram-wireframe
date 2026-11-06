/* Living meadow for the entry page: night-blue sky, big glowing clouds that drift,
   twinkling stars, floating sparkles, and a grassy hill whose blades sway in the wind. */
(function () {
  var sky = document.getElementById("sky"), back = document.getElementById("grass"), front = document.getElementById("grass-front");
  if (!sky || !back) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sc = sky.getContext("2d"), bc = back.getContext("2d"), fc = front.getContext("2d");
  var W, H, DPR, clouds = [], stars = [], motes = [], blades = [], flowers = [], tufts = [];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function hillY(x) { // the horizon line of the hill (higher on the left, like the reference)
    var u = x / W;
    return H * (W < 720 ? 0.64 : 0.655) + u * H * 0.07 + Math.sin(u * 3.2 + 0.6) * H * 0.012;
  }

  /* ---- one cumulus cloud, painted once onto its own canvas ---- */
  function makeCloud(w, h, seed) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"), puffs = [];
    var n = Math.round(w / 11);
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var px = w * (0.12 + 0.76 * t + rnd(-0.04, 0.04));
      var tower = Math.exp(-Math.pow((t - (0.35 + seed * 0.3)) / 0.28, 2)); // a tall tower in the middle
      var py = h * (0.78 - 0.5 * tower * rnd(0.75, 1.05));
      var r = w * rnd(0.045, 0.085) * (0.8 + tower * 0.7);
      puffs.push([px, py, r]);
      if (tower > 0.4) puffs.push([px + rnd(-r, r) * 0.6, py - r * rnd(0.5, 0.9), r * rnd(0.6, 0.85)]);
    }
    for (var k = 0; k < n * 0.8; k++) puffs.push([w * rnd(0.1, 0.9), h * rnd(0.7, 0.84), w * rnd(0.035, 0.07)]);
    for (var q = 0; q < n * 0.9; q++) { var b0 = puffs[Math.floor(rnd(0, puffs.length))]; puffs.push([b0[0] + rnd(-1, 1) * b0[2], b0[1] - rnd(0.2, 0.8) * b0[2], b0[2] * rnd(0.35, 0.6)]); } // small lumps on top // flat base
    // keep every puff inside the canvas so no edge gets cut flat
    var pad = w / 20, minY = Math.min.apply(null, puffs.map(function (p) { return p[1] - p[2]; }));
    var minX = Math.min.apply(null, puffs.map(function (p) { return p[0] - p[2]; })), maxX = Math.max.apply(null, puffs.map(function (p) { return p[0] + p[2]; }));
    var maxY = Math.max.apply(null, puffs.map(function (p) { return p[1] + p[2]; }));
    c.width = Math.ceil(maxX - minX + pad * 2); c.height = Math.ceil(maxY - minY + pad * 2); w = c.width; h = c.height;
    puffs.forEach(function (p) { p[0] += pad - minX; p[1] += pad - minY; });
    g = c.getContext("2d");
    puffs.sort(function (a, b) { return a[1] - b[1]; });
    // body: shadowed blue, then a lit top
    g.filter = "blur(" + Math.max(4, w / 48) + "px)";
    puffs.forEach(function (p) {
      var gr = g.createRadialGradient(p[0] - p[2] * 0.25, p[1] - p[2] * 0.45, p[2] * 0.1, p[0], p[1], p[2]);
      gr.addColorStop(0, "rgba(236,244,255,0.97)");
      gr.addColorStop(0.55, "rgba(182,206,236,0.95)");
      gr.addColorStop(1, "rgba(98,132,184,0.0)");
      g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], p[2], 0, 7); g.fill();
    });
    // soft blue shade along the bottom
    g.globalCompositeOperation = "source-atop"; g.filter = "none";
    var sh = g.createLinearGradient(0, h * 0.35, 0, h);
    sh.addColorStop(0, "rgba(70,105,165,0)"); sh.addColorStop(1, "rgba(52,86,148,0.6)");
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    return c;
  }

  function setup() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    W = sky.clientWidth; H = sky.clientHeight;
    [sky, back, front].forEach(function (cv) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.getContext("2d").setTransform(DPR, 0, 0, DPR, 0, 0); });
    var big = Math.max(W, H * 1.2);
    clouds = [
      { img: makeCloud(Math.round(big * 0.5), Math.round(big * 0.34), 0.2), x: W * 0.02, y: H * 0.02, v: 4.2, depth: 1 },
      { img: makeCloud(Math.round(big * 0.34), Math.round(big * 0.2), 0.7), x: W * 0.62, y: H * 0.3, v: 6.5, depth: 0.8 },
      { img: makeCloud(Math.round(big * 0.22), Math.round(big * 0.12), 0.5), x: W * 0.4, y: H * 0.08, v: 9, depth: 0.55, a: 0.55 },
      { img: makeCloud(Math.round(big * 0.26), Math.round(big * 0.14), 0.4), x: -W * 0.3, y: H * 0.36, v: 7.5, depth: 0.7, a: 0.8 }
    ];
    stars = []; for (var i = 0; i < Math.round(W * H / 9000); i++) stars.push([rnd(0, W), rnd(0, H * 0.6), rnd(0.4, 1.3), rnd(0, 6.3)]);
    motes = []; for (var m = 0; m < Math.round(W / 22); m++) motes.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(0.8, 2.2), v: rnd(10, 28), ph: rnd(0, 6.3) });
    // grass blades along the hill
    blades = []; var step = W < 720 ? 2.4 : 2.1;
    for (var x = -10; x < W + 10; x += step) {
      var base = hillY(x);
      var rows = 3;
      for (var r = 0; r < rows; r++) {
        var y = base + r * rnd(10, 40) + rnd(-2, 6);
        blades.push({ x: x + rnd(-2, 2), y: y, h: rnd(14, 34) * (1 + r * 0.35), w: rnd(1.4, 2.6), c: Math.floor(rnd(0, 5)), ph: rnd(0, 6.3), r: r });
      }
    }
    blades.sort(function (a, b) { return a.y - b.y; });
    flowers = []; for (var f = 0; f < Math.round(W / 38); f++) { var fx = rnd(0, W); flowers.push({ x: fx, y: hillY(fx) + rnd(6, H * 0.3), s: rnd(2, 4.2), ph: rnd(0, 6.3) }); }
    tufts = []; for (var t = 0; t < Math.round(W / 9); t++) { var tx = rnd(-20, W + 20); if (tx > W * 0.22 && tx < W * 0.78) continue; tufts.push({ x: tx, y: H + rnd(0, 10), h: rnd(40, 110), w: rnd(2.5, 4.5), ph: rnd(0, 6.3), c: Math.floor(rnd(0, 5)) }); }
  }

  var greens = ["#1d4a2a", "#245c31", "#2e6e37", "#3a7f3e", "#4d9247"];
  var tips = ["#4f8d4a", "#62a356", "#76b563", "#8cc56f", "#a6d47e"];

  function wind(x, t) { // a slow wave of wind sweeping across, plus a little flutter
    return Math.sin(t * 1.1 - x * 0.006) * 0.6 + Math.sin(t * 2.7 - x * 0.021) * 0.25 + Math.sin(t * 0.37) * 0.35;
  }

  function drawSky(t) {
    var g = sc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a2149"); g.addColorStop(0.45, "#1d4680"); g.addColorStop(0.72, "#3b6ea9"); g.addColorStop(1, "#6d9dcc");
    sc.fillStyle = g; sc.fillRect(0, 0, W, H);
    stars.forEach(function (s) { sc.globalAlpha = 0.35 + 0.45 * Math.sin(t * 1.6 + s[3]) ** 2; sc.fillStyle = "#fff"; sc.fillRect(s[0], s[1], s[2], s[2]); });
    sc.globalAlpha = 1;
    clouds.forEach(function (c) {
      var x = ((c.x + t * c.v) % (W + c.img.width * 1.2)) - c.img.width * 0.2;
      var y = c.y + Math.sin(t * 0.15 + c.depth * 3) * 6;
      sc.globalAlpha = c.a || 1;
      sc.drawImage(c.img, x, y);
    });
    sc.globalAlpha = 1;
    // soft glow on the horizon
    var hg = sc.createRadialGradient(W * 0.5, H * 0.7, 10, W * 0.5, H * 0.7, W * 0.6);
    hg.addColorStop(0, "rgba(190,220,255,0.28)"); hg.addColorStop(1, "rgba(190,220,255,0)");
    sc.fillStyle = hg; sc.fillRect(0, 0, W, H);
    // drifting sparkles
    motes.forEach(function (m) {
      var x = (m.x + t * m.v) % (W + 20), y = (m.y - t * m.v * 0.35 + Math.sin(t + m.ph) * 12 + H) % H;
      sc.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + m.ph);
      sc.fillStyle = "#fff"; sc.beginPath(); sc.arc(x, y, m.s * 0.6, 0, 7); sc.fill();
    });
    sc.globalAlpha = 1;
  }

  function drawGrass(t) {
    bc.clearRect(0, 0, W, H);
    // hill body
    bc.beginPath(); bc.moveTo(0, H);
    for (var x = 0; x <= W; x += 16) bc.lineTo(x, hillY(x) + 6);
    bc.lineTo(W, H); bc.closePath();
    var hg = bc.createLinearGradient(0, H * 0.62, 0, H);
    hg.addColorStop(0, "#3f7f3c"); hg.addColorStop(0.35, "#2a5f30"); hg.addColorStop(1, "#163d22");
    bc.fillStyle = hg; bc.fill();
    // light from the sky across the hill
    var lg = bc.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, "rgba(150,200,255,0.10)"); lg.addColorStop(0.5, "rgba(150,200,255,0)"); lg.addColorStop(1, "rgba(150,200,255,0.08)");
    bc.fillStyle = lg; bc.fill();
    // blades
    blades.forEach(function (b) {
      var sway = wind(b.x, t) * (6 + b.h * 0.35) + Math.sin(t * 3 + b.ph) * 1.2;
      bc.beginPath();
      bc.moveTo(b.x - b.w, b.y);
      bc.quadraticCurveTo(b.x + sway * 0.4, b.y - b.h * 0.55, b.x + sway, b.y - b.h);
      bc.quadraticCurveTo(b.x + sway * 0.4 + b.w * 0.6, b.y - b.h * 0.5, b.x + b.w, b.y);
      var gr = bc.createLinearGradient(0, b.y, 0, b.y - b.h);
      gr.addColorStop(0, greens[b.c]); gr.addColorStop(1, tips[b.c]);
      bc.fillStyle = gr; bc.fill();
    });
    // little white flowers bobbing
    flowers.forEach(function (f) {
      var sway = wind(f.x, t) * 4;
      var fx = f.x + sway, fy = f.y - 10 + Math.sin(t * 2 + f.ph);
      bc.strokeStyle = "rgba(40,90,40,.9)"; bc.lineWidth = 1; bc.beginPath(); bc.moveTo(f.x, f.y + 4); bc.quadraticCurveTo(f.x + sway * 0.4, f.y - 3, fx, fy); bc.stroke();
      bc.fillStyle = "rgba(240,246,255,.95)"; bc.beginPath(); bc.arc(fx, fy, f.s, 0, 7); bc.fill();
      bc.fillStyle = "rgba(255,226,140,.9)"; bc.beginPath(); bc.arc(fx, fy, f.s * 0.35, 0, 7); bc.fill();
    });
    // tall foreground tufts at the bottom corners, in front of everything
    fc.clearRect(0, 0, W, H);
    tufts.forEach(function (b) {
      var sway = wind(b.x, t + 0.3) * (10 + b.h * 0.25);
      fc.beginPath();
      fc.moveTo(b.x - b.w, b.y);
      fc.quadraticCurveTo(b.x + sway * 0.35, b.y - b.h * 0.55, b.x + sway, b.y - b.h);
      fc.quadraticCurveTo(b.x + sway * 0.35 + b.w, b.y - b.h * 0.5, b.x + b.w, b.y);
      fc.fillStyle = greens[Math.max(0, b.c - 2)]; fc.fill();
    });
  }

  var t0 = performance.now(), running = true;
  function frame(now) {
    var t = (now - t0) / 1000;
    drawSky(t); drawGrass(t);
    if (running && !reduce) requestAnimationFrame(frame);
  }
  setup(); frame(performance.now());
  var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { setup(); if (reduce) frame(performance.now()); }, 150); });
  document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running && !reduce) requestAnimationFrame(frame); });
})();
