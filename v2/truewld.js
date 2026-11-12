/* "Let your children see the true world" — the same behaviour as the AI Studio build (the-true-world.zip).
   The boy follows the mouse (or a finger, or the phone's tilt after tapping the button).
   Left = sunny morning, right = night with fireflies; the two crossfade on the way.
   73 still frames are drawn on a canvas, the whole picture shown (no zoom), dark around it.
   Frames 0-24: day, looking left -> right (12 = facing us). Frames 36-72: night, 72 = left, 54 = facing us, 36 = right. */
(function () {
  var sec = document.querySelector(".ttw"), cv = document.getElementById("ttw-canvas"), btn = document.getElementById("ttw-btn");
  if (!sec || !cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var N = 73, DAY_START = 0, DAY_END = 24, NIGHT_LEFT = 72, NIGHT_RIGHT = 36;
  var frames = new Array(N), target = 0.5, current = 0.5, inView = false, raf = 0, loading = false;

  function smoothstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // load the frames as the section comes close: centre, left and right poses first
  function load() {
    if (loading) return; loading = true;
    var order = [12, 0, 24, 36, 54, 72];
    for (var i = 0; i < N; i++) if (order.indexOf(i) < 0) order.push(i);
    order.forEach(function (k) {
      var im = new Image();
      im.onload = function () { frames[k] = im; kick(); };
      im.src = "img/true-world/f_" + (k < 10 ? "0" : "") + k + ".webp";
    });
  }
  function nearest(f, lo, hi) {
    var c = Math.max(lo, Math.min(hi, Math.round(f)));
    if (frames[c]) return frames[c];
    for (var d = 1; d <= N; d++) {
      if (c + d <= hi && frames[c + d]) return frames[c + d];
      if (c - d >= lo && frames[c - d]) return frames[c - d];
    }
    return null;
  }
  // fill the whole section (no empty space), slightly zoomed, with the boy in the middle.
  // FX/FY: the point of the picture kept in the centre (the boy is in the middle; a little above centre keeps his head in)
  var ZOOM = 1.08, FX = 0.5, FY = 0.45;
  function drawContain(im, w, h, alpha) {
    if (alpha <= 0.001) return;
    var iw = im.naturalWidth || 1280, ih = im.naturalHeight || 720, s = Math.max(w / iw, h / ih) * ZOOM;
    var dw = iw * s, dh = ih * s;
    var dx = Math.min(0, Math.max(w - dw, w / 2 - dw * FX)), dy = Math.min(0, Math.max(h - dh, h / 2 - dh * FY));
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, dx, dy, dw, dh);
  }

  function render() {
    raf = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.floor(cv.clientWidth * dpr), h = Math.floor(cv.clientHeight * dpr);
    if (!w || !h) return;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }

    current += (target - current) * 0.16;           // smooth follow
    if (Math.abs(target - current) < 0.0005) current = target;
    var x = Math.max(0, Math.min(1, current));
    var dayFloat = DAY_START + x * (DAY_END - DAY_START);
    var nightFloat = NIGHT_LEFT - x * (NIGHT_LEFT - NIGHT_RIGHT);
    var nightAlpha = smoothstep(0.54, 0.88, x);
    sec.classList.toggle("night", nightAlpha > 0.35);

    ctx.globalAlpha = 1; ctx.fillStyle = "#0d0d12"; ctx.fillRect(0, 0, w, h);
    var dayImg = nearest(dayFloat, DAY_START, DAY_END), nightImg = nearest(nightFloat, NIGHT_RIGHT, NIGHT_LEFT);
    if (dayImg && nightAlpha < 0.999) drawContain(dayImg, w, h, 1 - nightAlpha);
    if (nightImg && nightAlpha > 0.001) drawContain(nightImg, w, h, nightAlpha);
    ctx.globalAlpha = 1;

    if (current !== target) kick();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(render); }
  addEventListener("resize", kick);
  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) { load(); kick(); } }, { rootMargin: "600px 0px" }).observe(sec);

  // mouse and touch, across the width of the screen
  function update(clientX) {
    var width = innerWidth || document.documentElement.clientWidth || 1, pad = width * 0.03;
    target = Math.max(0, Math.min(1, (clientX - pad) / (width - pad * 2)));
    kick();
  }
  addEventListener("mousemove", function (e) { if (inView) update(e.clientX); }, { passive: true });
  sec.addEventListener("touchmove", function (e) { if (e.touches.length) update(e.touches[0].clientX); }, { passive: true });

  // phone tilt, switched on with the button
  var tiltActive = false, tiltSupported = "ondeviceorientation" in window;
  function onTilt(e) {
    if (e.gamma == null) return;
    var g = Math.max(-25, Math.min(25, e.gamma));
    target = (g + 25) / 50; kick();
  }
  function label() {
    btn.classList.toggle("on", tiltActive);
    btn.textContent = tiltActive ? (tiltSupported ? "Tilting phone active — tilt to guide him" : "Phone tilt mode enabled") : "Tap to let him follow your phone";
  }
  if (btn) btn.addEventListener("click", function () {
    if (tiltActive) { removeEventListener("deviceorientation", onTilt); tiltActive = false; return label(); }
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then(function (p) {
        if (p === "granted") { addEventListener("deviceorientation", onTilt); tiltActive = true; label(); }
        else alert("Device orientation permission is required to tilt and follow.");
      }).catch(function (err) { console.warn("Orientation permission error:", err); });
    } else if (tiltSupported) {
      addEventListener("deviceorientation", onTilt); tiltActive = true; label();
    } else {
      tiltActive = true; label();
      setTimeout(function () { tiltActive = false; label(); }, 3000);
    }
  });
})();
