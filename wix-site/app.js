(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Leaves drift at 3 depths as the page scrolls
  var leaves = Array.prototype.slice.call(document.querySelectorAll(".leaf[data-depth]"));
  leaves.forEach(function (el) { el.dataset.base = el.style.transform || ""; });
  var ticking = false;
  function drift() {
    ticking = false;
    var vh = window.innerHeight;
    leaves.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.depth) * -0.35;
      el.style.transform = "translateY(" + offset.toFixed(1) + "px) " + el.dataset.base;
    });
  }
  if (!reduce) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  // Sections fade up as they arrive
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Enquiry pop-up: opens from any "Book a visit" button, and once per visit at 50% scroll
  var overlay = document.getElementById("overlay");
  var lastFocus = null;
  function seen() { try { return sessionStorage.getItem("swaram-pop") === "1"; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem("swaram-pop", "1"); } catch (e) {} }
  function openPop() {
    if (overlay.classList.contains("open")) return;
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    markSeen();
    var first = overlay.querySelector("input, button");
    if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function closePop() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open]")) { e.preventDefault(); openPop(); }
    else if (e.target.closest("[data-close]") || e.target === overlay) { closePop(); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("open")) closePop(); });
  function checkHalf() {
    if (seen()) return;
    var el = document.scrollingElement || document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    if (max > 0 && el.scrollTop / max >= 0.5) openPop();
  }
  window.addEventListener("scroll", checkHalf, { passive: true });

  // "Look at me": Aarav turns toward the cursor, or toward the phone's tilt
  var stage = document.getElementById("lookme");
  var kid = stage && stage.querySelector(".lookme-kid");
  if (kid && !reduce) {
    function turn(x, y) {
      var rx = Math.max(-1, Math.min(1, x)), ry = Math.max(-1, Math.min(1, y));
      kid.style.transform = "rotateY(" + (rx * 28).toFixed(1) + "deg) rotateX(" + (-ry * 8).toFixed(1) + "deg) translateX(" + (rx * 14).toFixed(1) + "px)";
    }
    window.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      turn((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), (e.clientY - (r.top + r.height / 3)) / (window.innerHeight / 2));
    });
    stage.addEventListener("touchmove", function (e) {
      var t = e.touches[0], r = stage.getBoundingClientRect();
      turn((t.clientX - (r.left + r.width / 2)) / (r.width / 2), 0);
    }, { passive: true });
    function onTilt(e) { if (e.gamma == null) return; turn(e.gamma / 30, ((e.beta || 45) - 45) / 40); }
    var btn = document.getElementById("tilt-btn");
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        DeviceOrientationEvent.requestPermission().then(function (s) {
          if (s === "granted") { window.addEventListener("deviceorientation", onTilt); btn.hidden = true; }
        }).catch(function () {});
      });
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", onTilt);
    }
  }
})();
