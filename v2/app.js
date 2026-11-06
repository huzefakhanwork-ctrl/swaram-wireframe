(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Split headline words for the rise-in ---------- */
  document.querySelectorAll(".words").forEach(function (el) {
    var i = 0;
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="w"><span style="--i:' + (i++) + '">' + w + "</span></span>";
    }).join(" ");
  });
  /* stagger columns inside a group */
  document.querySelectorAll(".cols4, .cols5, .pages, .facts, .iv-grid, .pg-track, .polaroids, .stickies").forEach(function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });

  /* ---------- Scroll reveals ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
  // clip-path hides the handwriting completely, and IntersectionObserver ignores fully clipped
  // elements, so the handwriting is triggered by a sentinel placed right where it sits.
  var io2 = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target._w.classList.add("in"); io2.unobserve(e.target); e.target.remove(); } });
  }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
  function watch() {
    document.querySelectorAll(".words, .fade, .pop, .rise, .slide, .pg").forEach(function (el) { io.observe(el); });
    document.querySelectorAll(".reveal-write").forEach(function (el) {
      var s = document.createElement("i"); s.setAttribute("aria-hidden", "true");
      s.style.cssText = "display:block;height:1px;width:1px;pointer-events:none";
      s._w = el; el.parentNode.insertBefore(s, el); io2.observe(s);
    });
  }

  /* ---------- Entry page: preloader, then the sticker sketchbook ---------- */
  var cover = document.getElementById("cover");
  var loader = document.getElementById("loader");
  if (loader) {
    var word = loader.querySelector(".loader-word");
    var bar = loader.querySelector(".loader-bar");
    var text = word.dataset.type, bold = [1, 4, 5, 8, 11, 12, 15, 16];
    var n = 0, start = performance.now(), MIN = reduce ? 0 : 2200, loaded = document.readyState === "complete";
    addEventListener("load", function () { loaded = true; });
    var tick = function (t) {
      var p = Math.min(1, (t - start) / MIN);
      if (!loaded && t - start < 3200) p = Math.min(p, 0.9);
      var k = Math.round(p * text.length);
      if (k !== n) {
        n = k;
        word.innerHTML = text.slice(0, n).split("").map(function (ch, i) { return bold.indexOf(i) > -1 ? "<b>" + ch + "</b>" : ch; }).join("");
      }
      bar.style.setProperty("--p", (p * 100).toFixed(1) + "%");
      if (p < 1) return requestAnimationFrame(tick);
      setTimeout(function () {
        loader.classList.add("done");
        document.body.classList.remove("is-loading");
        setTimeout(function () { if (cover) cover.classList.add("ready"); }, 300);
      }, 250);
    };
    requestAnimationFrame(tick);
  } else {
    setTimeout(watch, 250);
  }

  if (cover) {
    var leave = document.createElement("div"); leave.className = "leave"; document.body.appendChild(leave);
    [].forEach.call(cover.querySelectorAll(".bk"), function (a, i) { a.style.setProperty("--i", i); });
    [].forEach.call(cover.querySelectorAll(".rg"), function (a, i) { a.style.setProperty("--i", i); });
    [].forEach.call(cover.querySelectorAll(".bk, .rg"), function (a) {
      a.addEventListener("click", function (e) {
        if (reduce || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        a.classList.add("peel");
        setTimeout(function () { leave.classList.add("on"); }, 260);
        setTimeout(function () { location.href = a.getAttribute("href"); }, 700);
      });
    });
    // coming back with the browser's back button: show the stickers again
    addEventListener("pageshow", function (e) { if (e.persisted) { leave.classList.remove("on"); [].forEach.call(cover.querySelectorAll(".peel"), function (a) { a.classList.remove("peel"); }); } });
  }

  /* ---------- [Swaram Early Years]: each letter's weight morphs on its own ---------- */
  var brand = document.getElementById("brand");
  if (brand) {
    var BT = brand.textContent;
    brand.setAttribute("aria-label", BT.replace(/[\[\]]/g, ""));
    brand.innerHTML = BT.split("").map(function (ch) {
      return ch === " " ? '<span class="gap" aria-hidden="true"></span>' : '<span class="l" aria-hidden="true">' + ch + "</span>";
    }).join("");
    var ls = [].slice.call(brand.querySelectorAll(".l")), gaps = [].slice.call(brand.querySelectorAll(".gap"));
    var W = [200, 300, 400, 500, 700, 800];
    var morph = function () {
      ls.forEach(function (l) { if (Math.random() < 0.55) l.style.setProperty("--wt", W[Math.floor(Math.random() * W.length)]); });
      gaps.forEach(function (g) { if (Math.random() < 0.5) g.style.setProperty("--gw", (0.35 + Math.random() * 1.1).toFixed(2) + "ch"); });
    };
    morph();
    if (!reduce) setInterval(morph, 520);
  }

  /* ---------- Hero slideshow: next photo every 6s ---------- */
  var slides = [].slice.call(document.querySelectorAll(".hero-slides img"));
  if (slides.length > 1 && !reduce) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove("on");
      si = (si + 1) % slides.length;
      slides[si].classList.add("on");
    }, 6000);
  }

  /* ---------- Our programs carousel: arrows + drag, wraps around at the ends ---------- */
  var rail = document.getElementById("pg-rail");
  if (rail) {
    var cardsP = [].slice.call(rail.querySelectorAll(".pg-card"));
    var step = function () { var c = cardsP[0]; return c ? c.getBoundingClientRect().width + 32 : 400; };
    [].forEach.call(document.querySelectorAll(".pg-btn"), function (b) {
      b.addEventListener("click", function () {
        var dir = +b.dataset.dir, max = rail.scrollWidth - rail.clientWidth;
        if (dir > 0 && rail.scrollLeft >= max - 4) rail.scrollTo({ left: 0, behavior: "smooth" });
        else if (dir < 0 && rail.scrollLeft <= 4) rail.scrollTo({ left: max, behavior: "smooth" });
        else rail.scrollBy({ left: dir * step(), behavior: "smooth" });
      });
    });
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = "none"; rail.style.cursor = "grabbing"; });
    addEventListener("pointermove", function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 4) moved = true; rail.scrollLeft = sl - d; });
    addEventListener("pointerup", function () { if (!down) return; down = false; rail.style.cursor = ""; rail.style.scrollSnapType = ""; });
    rail.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ---------- Sticky nav ---------- */
  var nav = document.getElementById("nav");
  var links = nav ? [].slice.call(nav.querySelectorAll("nav a")) : [];
  var heroFull = document.querySelector(".hero-full");
  function onScroll() {
    if (nav && heroFull) {
      var over = scrollY < heroFull.offsetHeight - 80;
      nav.classList.toggle("over-hero", over);
      nav.classList.toggle("solid", !over);
    }
    var cur = null;
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = a;
    });
    links.forEach(function (a) { a.classList.toggle("on", a === cur); });
    // watercolour drift
    document.querySelectorAll(".wash").forEach(function (w) {
      var r = w.parentNode.getBoundingClientRect();
      w.style.setProperty("--py", ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + "px");
    });
  }
  var ticking = false;
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
  onScroll();

  /* ---------- Drag anything with .drag / .drag-soft ---------- */
  function draggable(el, opts) {
    var sx, sy, ox = 0, oy = 0, dx = 0, dy = 0, vx = 0, vy = 0, lx, ly, raf, rot = 0;
    function apply() { el.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px"; el.style.rotate = rot.toFixed(1) + "deg"; }
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault(); cancelAnimationFrame(raf);
      el.setPointerCapture(e.pointerId); el.classList.add("dragging");
      sx = e.clientX; sy = e.clientY; ox = dx; oy = dy; lx = sx; ly = sy;
    });
    el.addEventListener("pointermove", function (e) {
      if (!el.classList.contains("dragging")) return;
      vx = Math.max(-18, Math.min(18, e.clientX - lx)); vy = Math.max(-18, Math.min(18, e.clientY - ly)); lx = e.clientX; ly = e.clientY;
      dx = ox + e.clientX - sx; dy = oy + e.clientY - sy;
      rot = Math.max(-25, Math.min(25, vx * 1.6));
      apply();
    });
    function up() {
      if (!el.classList.contains("dragging")) return;
      el.classList.remove("dragging");
      (function glide() { // a little throw, then settle
        vx *= 0.86; vy *= 0.86; rot *= 0.85; dx += vx; dy += vy;
        // keep it on screen
        var b = el.getBoundingClientRect();
        if (b.left < 0 || b.right > innerWidth) { vx = -vx * 0.5; dx += b.left < 0 ? -b.left : innerWidth - b.right; }
        if (opts && opts.home) { dx *= 0.9; dy *= 0.9; }
        apply();
        if (Math.abs(vx) + Math.abs(vy) + Math.abs(rot) > 0.3 || (opts && opts.home && Math.abs(dx) + Math.abs(dy) > 0.5)) raf = requestAnimationFrame(glide);
      })();
    }
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  }
  document.querySelectorAll(".drag").forEach(function (el) { draggable(el); });
  document.querySelectorAll(".drag-soft").forEach(function (el) { draggable(el, { home: true }); });

  /* ---------- Hand-drawn scalloped frame ---------- */
  var sc = document.getElementById("scal");
  if (sc) {
    var W = 400, H = 460, m = 16, r = 15, d = "";
    function edge(x1, y1, x2, y2) {
      var len = Math.hypot(x2 - x1, y2 - y1), k = Math.round(len / (r * 2)), s = "";
      for (var i = 1; i <= k; i++) {
        var x = x1 + (x2 - x1) * i / k, y = y1 + (y2 - y1) * i / k;
        s += " A" + (len / k / 2).toFixed(1) + " " + (len / k / 2 * (0.9 + Math.random() * 0.2)).toFixed(1) + " 0 0 1 " + x.toFixed(1) + " " + y.toFixed(1);
      }
      return s;
    }
    d = "M" + m + " " + m + edge(m, m, W - m, m) + edge(W - m, m, W - m, H - m) + edge(W - m, H - m, m, H - m) + edge(m, H - m, m, m) + "Z";
    sc.setAttribute("d", d);
  }

  /* ---------- Look at me: swap three frames (left, ahead, right) as you move or tilt ---------- */
  var kidBox = document.getElementById("kid");
  if (kidBox) {
    var frames = {};
    [].forEach.call(kidBox.querySelectorAll(".kid-frame"), function (f) { frames[f.dataset.t] = f; });
    var cur = null;
    function show(t) { if (t === cur) return; cur = t; for (var k in frames) frames[k].classList.toggle("on", +k === t); }
    show(0);
    addEventListener("pointermove", function (e) {
      var r = kidBox.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2);
      var zone = Math.max(60, r.width * 0.28);
      show(dx < -zone ? -1 : dx > zone ? 1 : 0);
    }, { passive: true });
    function tilt(e) { if (e.gamma == null) return; show(e.gamma < -10 ? -1 : e.gamma > 10 ? 1 : 0); }
    var btn = document.getElementById("tilt-btn");
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
      btn.hidden = false;
      btn.onclick = function () { DeviceOrientationEvent.requestPermission().then(function (s) { if (s === "granted") { addEventListener("deviceorientation", tilt); btn.hidden = true; } }); };
    } else { addEventListener("deviceorientation", tilt); }
  }
})();
