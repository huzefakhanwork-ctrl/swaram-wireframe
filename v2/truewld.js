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

  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.1 }).observe(sec);

  // mouse (computers) and finger swipe (phones)
  function fromX(x) { var w = innerWidth || 1, pad = w * 0.02; return (x - pad) / (w - pad * 2); }
  addEventListener("mousemove", function (e) { if (inView) go(fromX(e.clientX)); }, { passive: true });
  sec.addEventListener("touchstart", function (e) { if (e.touches.length) go(fromX(e.touches[0].clientX)); }, { passive: true });
  sec.addEventListener("touchmove", function (e) { if (e.touches.length) go(fromX(e.touches[0].clientX)); }, { passive: true });

  // phone tilt: left/right lean, also when the phone is held sideways
  var RANGE = 22, base = null;
  function lean(e) {
    var a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (a === 90) return e.beta;           // landscape, top of phone to the left
    if (a === -90 || a === 270) return -e.beta;
    return e.gamma;                        // portrait
  }
  function tilt(e) {
    if (!inView || e.gamma == null) return;
    var g = lean(e);
    if (base === null) base = 0;           // upright phone = the middle of the video
    go((Math.max(-RANGE, Math.min(RANGE, g - base)) + RANGE) / (RANGE * 2));
  }
  var listening = false;
  function start() {
    if (listening) return; listening = true;
    addEventListener("deviceorientation", tilt);
    if (btn) { btn.classList.add("on"); btn.textContent = "Tilt your phone to guide him"; }
  }
  var needsTap = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function";
  var isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0 || matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isTouch && window.DeviceOrientationEvent && !needsTap) {
    start();                                 // Android etc.: no permission needed
    if (btn) btn.hidden = true;
  }
  if (btn) btn.addEventListener("click", function () {
    if (listening) return;
    if (needsTap) DeviceOrientationEvent.requestPermission().then(function (s) { if (s === "granted") { start(); setTimeout(function () { btn.hidden = true; }, 2500); } }).catch(function () {});
    else start();
  });
})();
