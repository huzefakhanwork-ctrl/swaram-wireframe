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

  // Rising clouds: a soft cream cloud bank climbs over the hero as the page scrolls
  var hero = document.querySelector(".hero");
  if (hero) {
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/clouds.css";
    document.head.appendChild(css);
    var puffsBack = [[60, 250, 130], [300, 220, 160], [560, 245, 140], [820, 205, 180], [1090, 235, 150], [1350, 215, 170]];
    var puffsFront = [[-20, 350, 150], [210, 330, 130], [450, 310, 180], [720, 345, 140], [980, 300, 190], [1230, 340, 140], [1470, 315, 160]];
    function circles(list, dy, fill, extra) {
      return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + (p[1] + dy) + '" r="' + p[2] + '" fill="' + fill + '"' + (extra || "") + '></circle>'; }).join("");
    }
    var bank = document.createElement("div");
    bank.className = "cloudbank";
    bank.setAttribute("aria-hidden", "true");
    bank.innerHTML =
      '<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice">' +
        '<defs><filter id="cloudfx" x="-20%" y="-40%" width="140%" height="180%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="7"></feTurbulence>' +
          '<feDisplacementMap in="SourceGraphic" scale="70"></feDisplacementMap>' +
          '<feGaussianBlur stdDeviation="7"></feGaussianBlur>' +
        '</filter></defs>' +
        '<g class="layer back" filter="url(#cloudfx)" opacity="0.85">' +
          circles(puffsBack, 22, "#E9DFC8") + circles(puffsBack, 0, "#FFFCF4") +
          '<rect x="-100" y="250" width="1640" height="700" fill="#FFFCF4"></rect>' +
        '</g>' +
        '<g class="layer front" filter="url(#cloudfx)">' +
          circles(puffsFront, 20, "#EADFC6") + circles(puffsFront, 0, "#F9F2DF") +
          '<rect x="-100" y="350" width="1640" height="600" fill="#F9F2DF"></rect>' +
        '</g>' +
      '</svg>';
    hero.appendChild(bank);
    var back = bank.querySelector(".back"), front = bank.querySelector(".front");
    var cloudTick = false;
    function rise() {
      cloudTick = false;
      var r = hero.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
      back.style.transform = "translateY(" + (-p * 260).toFixed(1) + "px)";
      front.style.transform = "translateY(" + (-p * 460).toFixed(1) + "px)";
    }
    if (!reduce) {
      window.addEventListener("scroll", function () { if (!cloudTick) { cloudTick = true; requestAnimationFrame(rise); } }, { passive: true });
      rise();
    }
  }

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

/* Programs: tilted card carousel that loops */
(function () {
  var cf = document.querySelector(".coverflow");
  if (!cf) return;
  var track = cf.querySelector(".cf-track");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var originals = Array.prototype.slice.call(track.children);
  var n = originals.length;
  // three copies so the loop can jump silently between them
  [0, 1].forEach(function () {
    originals.forEach(function (c) {
      var k = c.cloneNode(true);
      k.setAttribute("aria-hidden", "true");
      track.appendChild(k);
    });
  });
  var cards = Array.prototype.slice.call(track.children);
  function step() { return cards[1].offsetLeft - cards[0].offsetLeft; }
  function centerOn(i, smooth) {
    var c = cards[i];
    var left = c.offsetLeft + c.offsetWidth / 2 - cf.clientWidth / 2;
    cf.scrollTo({ left: left, behavior: smooth ? "smooth" : "auto" });
  }
  function nearest() {
    var mid = cf.scrollLeft + cf.clientWidth / 2, best = 0, bd = Infinity;
    cards.forEach(function (c, i) {
      var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  var raf = false;
  function paint() {
    raf = false;
    var mid = cf.scrollLeft + cf.clientWidth / 2, w = step() || 1;
    cards.forEach(function (c) {
      var d = (c.offsetLeft + c.offsetWidth / 2 - mid) / w;   // cards away from centre
      var a = Math.min(Math.abs(d), 3);
      var s = 1.06 - a * 0.1;
      var rot = Math.max(-28, Math.min(28, -d * 14));
      var y = a * 10;
      c.style.transform = reduce ? "" : "translateY(" + y.toFixed(1) + "px) rotateY(" + rot.toFixed(1) + "deg) scale(" + s.toFixed(3) + ")";
      c.style.zIndex = String(10 - Math.round(a * 2));
      c.style.opacity = String(1 - a * 0.12);
      c.classList.toggle("is-center", a < 0.5);
    });
  }
  var settle;
  function loop() {
    var i = nearest();
    if (i < n) centerOn(i + n, false);
    else if (i >= 2 * n) centerOn(i - n, false);
  }
  cf.addEventListener("scroll", function () {
    if (!raf) { raf = true; requestAnimationFrame(paint); }
    clearTimeout(settle);
    settle = setTimeout(loop, 140);
  }, { passive: true });
  window.addEventListener("resize", function () { centerOn(nearest(), false); paint(); });
  document.querySelectorAll("[data-cf]").forEach(function (b) {
    b.addEventListener("click", function () {
      centerOn(nearest() + (b.getAttribute("data-cf") === "next" ? 1 : -1), !reduce);
    });
  });
  cf.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); centerOn(nearest() + 1, !reduce); }
    if (e.key === "ArrowLeft") { e.preventDefault(); centerOn(nearest() - 1, !reduce); }
  });
  cf.tabIndex = 0;
  function start() { centerOn(n, false); paint(); }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
  requestAnimationFrame(start);
})();

/* Side clouds + pop-in 3D stickers (bee, leaves, flowers) */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IMG = window.SWARAM_IMG || {};
  function src(name) { return IMG[name] || "/img/" + name; }

  // ---- clouds that live in the side gutters and drift as you scroll ----
  var sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  var defs = [
    { img: "cloud-a.webp", side: "left",  w: 360, base: 0.10, speed: 0.22, far: true },
    { img: "cloud-b.webp", side: "right", w: 300, base: 0.30, speed: 0.38 },
    { img: "cloud-c.webp", side: "left",  w: 420, base: 0.58, speed: 0.55 },
    { img: "cloud-a.webp", side: "right", w: 380, base: 0.80, speed: 0.18, far: true },
    { img: "cloud-c.webp", side: "right", w: 330, base: 0.05, speed: 0.46 },
    { img: "cloud-b.webp", side: "left",  w: 260, base: 0.42, speed: 0.30, far: true }
  ];
  var clouds = defs.map(function (d, i) {
    var el = document.createElement("div");
    el.className = "cl " + d.side + (d.far ? " far" : "");
    var im = document.createElement("img");
    im.src = src(d.img); im.alt = ""; im.decoding = "async"; im.loading = "lazy";
    if (d.side === "right") im.style.transform = "scaleX(-1)";
    el.appendChild(im);
    sky.appendChild(el);
    return { el: el, d: d, i: i };
  });
  document.body.appendChild(sky);

  function layoutClouds() {
    var vw = window.innerWidth, vh = window.innerHeight, sy = window.scrollY || 0;
    var ref = document.querySelector(".hero-copy") || document.querySelector(".wrap");
    var gutter = ref ? Math.max(0, ref.getBoundingClientRect().left) : Math.max(0, (vw - 1248) / 2);
    var small = vw < 900;
    clouds.forEach(function (c) {
      var d = c.d;
      var w = small ? d.w * 0.5 : Math.min(d.w, Math.max(220, gutter * 1.9 + 120));
      c.el.style.width = w + "px";
      var h = w * 0.75;
      var visible = small ? 40 : Math.max(44, Math.min(w * 0.6, gutter - 18));
      var x = d.side === "left" ? visible - w : vw - visible;
      var span = vh + h + 240;
      var y = ((d.base * span - sy * d.speed) % span + span) % span - h - 120;
      var sway = reduce ? 0 : Math.sin(sy / 420 + c.i * 1.7) * 14 * (d.side === "left" ? 1 : -1);
      var rot = reduce ? 0 : Math.sin(sy / 650 + c.i) * 10 * (d.side === "left" ? 1 : -1);
      var s = (d.far ? 0.82 : 1) + (reduce ? 0 : Math.sin(sy / 900 + c.i) * 0.04);
      c.el.style.transform = "translate3d(" + (x + sway).toFixed(1) + "px," + y.toFixed(1) + "px,0) perspective(900px) rotateY(" + rot.toFixed(1) + "deg) scale(" + s.toFixed(3) + ")";
      c.el.style.opacity = small ? "0.75" : "1";
    });
  }

  // ---- stickers that pop in, in 3D, when their section scrolls in ----
  var picks = [
    ["hero-title",    "bee.webp",         "right", "1%",  "top",    "230px", 96,  false],
    ["hero-title",    "flowers.gif",      "right", "1%",  "bottom", "40px",  120, true],
    ["day-title",     "maple-red.webp",   "left",  "2%",  "top",    "46%",   92,  true],
    ["day-title",     "sunflower.gif",    "right", "2%",  "bottom", "40px",  96,  true],
    ["letter-title",  "maple-brown.gif",  "left",  "3%",  "bottom", "60px",  110, true],
    ["voice-title",   "flowers.gif",      "right", "3%",  "top",    "90px",  110, true],
    ["what-title",    "bee.webp",         "left",  "4%",  "top",    "80px",  80,  true],
    ["hl-title",      "maple-red.webp",   "right", "2%",  "bottom", "60px",  90,  true],
    ["prog-title",    "sunflower.gif",    "right", "2%",  "bottom", "40px",  96,  true],
    ["teach-title",   "maple-brown.gif",  "left",  "2%",  "bottom", "50px",  100, true],
    ["founder-title", "flowers.gif",      "left",  "3%",  "top",    "90px",  100, true],
    ["visit-title",   "bee.webp",         "right", "5%",  "top",    "90px",  90,  false],
    ["visit-title",   "maple-red.webp",   "left",  "2%",  "bottom", "50px",  84,  true]
  ];
  var pops = [];
  picks.forEach(function (p) {
    var sec = document.querySelector('[aria-labelledby="' + p[0] + '"]');
    if (!sec) return;
    if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
    var el = document.createElement("div");
    el.className = "pop " + p[2] + (p[1].indexOf("bee") === 0 ? " bee" : "") + (p[7] ? " hide-sm" : "");
    el.setAttribute("aria-hidden", "true");
    el.style[p[2]] = p[3];
    el.style[p[4]] = p[5];
    el.style.width = p[6] + "px";
    var pp = document.createElement("span");
    pp.className = "pp";
    var im = document.createElement("img");
    im.src = src(p[1]); im.alt = ""; im.decoding = "async"; im.loading = "lazy";
    pp.appendChild(im);
    el.appendChild(pp);
    sec.appendChild(el);
    pops.push({ el: el, sec: sec, depth: 0.12 + Math.random() * 0.18 });
  });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var list = pops.filter(function (p) { return p.sec === e.target; });
          list.forEach(function (p, k) { setTimeout(function () { p.el.classList.add("in"); }, 120 + k * 220); });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    pops.forEach(function (p) { io.observe(p.sec); });
  } else {
    pops.forEach(function (p) { p.el.classList.add("in"); });
  }
  function parallaxPops() {
    if (reduce) return;
    var vh = window.innerHeight;
    pops.forEach(function (p) {
      var r = p.sec.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var off = (r.top + r.height / 2 - vh / 2) * -p.depth;
      p.el.style.translate = "0 " + off.toFixed(1) + "px";
    });
  }

  var ticking = false;
  function frame() { ticking = false; layoutClouds(); parallaxPops(); }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener("resize", frame);
  frame();
})();
