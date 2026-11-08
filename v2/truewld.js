/* "Let your children see the true world": the mouse position, a finger swipe, or tilting the phone scrubs
   the video, left = sunny morning, right = night with fireflies. The words switch to light colours as it gets dark.
   Phones: Android follows the tilt straight away; iPhone asks once, via the button (Apple requires a tap). */
(function () {
  var sec = document.querySelector(".tw"), video = document.getElementById("tw-video"), btn = document.getElementById("tw-tilt");
  if (!sec || !video) return;
  var want = 0, now = 0, seeking = false, inView = false, raf = 0;

  // ease the picture toward where the hand/mouse is, so small shakes don't jitter the video
  function loop() {
    raf = 0;
    now += (want - now) * 0.18;
    if (Math.abs(want - now) < 0.002) now = want;
    sec.classList.toggle("night", now > 0.45);
    if (video.duration && !isNaN(video.duration) && !seeking) {
      var t = now * Math.max(0, video.duration - 0.02);
      if (Math.abs(video.currentTime - t) > 0.015) { seeking = true; video.currentTime = t; }
    }
    if (now !== want || seeking) raf = requestAnimationFrame(loop);
  }
  function go(p) { want = Math.max(0, Math.min(1, p)); if (!raf) raf = requestAnimationFrame(loop); }
  video.addEventListener("seeked", function () { seeking = false; if (!raf) raf = requestAnimationFrame(loop); });
  video.addEventListener("loadedmetadata", function () { go(want); });


  // colour of the page wash at the top and bottom of this section (same stops as body.home in styles.css)
  var STOPS = [[0,"#FFF7EE"],[12,"#FDEFE4"],[24,"#F4F5EA"],[36,"#EAF3F1"],[48,"#EEF1FA"],[60,"#FBEFF2"],[72,"#FFF4E6"],[84,"#EFF5EC"],[100,"#FFF7EE"]];
  function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function washAt(y) {
    var pct = 100 * y / Math.max(1, document.documentElement.scrollHeight);
    for (var i = 1; i < STOPS.length; i++) if (pct <= STOPS[i][0]) {
      var a = STOPS[i - 1], b = STOPS[i], t = (pct - a[0]) / (b[0] - a[0]), A = hex(a[1]), B = hex(b[1]);
      return "rgb(" + A.map(function (v, k) { return Math.round(v + (B[k] - v) * t); }).join(",") + ")";
    }
    return STOPS[STOPS.length - 1][1];
  }
  function paintFades() {
    var top = sec.getBoundingClientRect().top + pageYOffset;
    var bot = innerWidth <= 720 ? top + video.getBoundingClientRect().height : top + sec.offsetHeight;
    sec.style.setProperty("--tw-top", washAt(top));
    sec.style.setProperty("--tw-bot", washAt(bot));
  }
  paintFades(); addEventListener("load", paintFades); addEventListener("resize", paintFades);

  // iPhones don't load a video's frames until the page is touched: a quick play/pause on the first tap wakes it up
  var awake = false;
  function wake() {
    if (awake) return; awake = true;
    try { var p = video.play(); if (p && p.then) p.then(function () { video.pause(); go(want); }).catch(function () { awake = false; }); else video.pause(); } catch (e) { awake = false; }
  }
  sec.addEventListener("touchstart", wake, { passive: true });

  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.1 }).observe(sec);

  // mouse (computers) and finger swipe (phones)
  function fromX(x) { var w = innerWidth || 1, pad = w * 0.02; return (x - pad) / (w - pad * 2); }
  addEventListener("mousemove", function (e) { if (inView) go(fromX(e.clientX)); }, { passive: true });
  sec.addEventListener("touchstart", function (e) { if (e.touches.length) go(fromX(e.touches[0].clientX)); }, { passive: true });
  sec.addEventListener("touchmove", function (e) { if (e.touches.length) go(fromX(e.touches[0].clientX)); }, { passive: true });

  // phone tilt: left/right lean, also when the phone is held sideways
  var RANGE = 22;
  function lean(e) {
    var a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (a === 90) return e.beta;           // landscape, top of phone to the left
    if (a === -90 || a === 270) return -e.beta;
    return e.gamma;                        // portrait
  }
  var gotTilt = false;
  function tilt(e) {
    if (e.gamma == null) return;
    if (!gotTilt) { gotTilt = true; if (btn) { btn.classList.add("on"); btn.textContent = "Tilt your phone to guide him"; setTimeout(function () { btn.hidden = true; }, 1800); } }
    if (!inView) return;
    var g = lean(e);
    go((Math.max(-RANGE, Math.min(RANGE, g)) + RANGE) / (RANGE * 2));
  }
  // listen straight away on every phone: Android sends tilt with no questions; iPhone only after the tap below
  var listening = false;
  function start() { if (listening) return; listening = true; addEventListener("deviceorientation", tilt); }
  var isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0 || matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isTouch && window.DeviceOrientationEvent) start();
  if (btn) btn.addEventListener("click", function () {
    wake();                                   // load the video's frames (iPhone)
    start();
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().catch(function () {});   // iPhone: "Allow motion" prompt
    }
  });
})();
