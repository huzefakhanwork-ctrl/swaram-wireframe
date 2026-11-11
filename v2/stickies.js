/* "What we love doing": each sticky note's photos slide one after another (the next photo slides in from
   the right as the current one slides out), so the frame is never empty. Notes start at different moments. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  [].forEach.call(document.querySelectorAll(".st-photo[data-imgs]"), function (fig, n) {
    var first = fig.querySelector("img");
    var list = fig.getAttribute("data-imgs").split(";").filter(Boolean).map(function (x) { var p = x.split("|"); return { src: p[0], alt: p[1] || "" }; });
    if (!first || list.length < 2) return;

    // a window that holds every photo of this note, side by side
    var win = document.createElement("div"); win.className = "st-win";
    var slides = list.map(function (it, i) {
      var im = i === 0 ? first : document.createElement("img");
      if (i > 0) { im.src = it.src; im.alt = it.alt; }
      im.className = "st-slide" + (i === 0 ? " on" : "");
      win.appendChild(im);
      return im;
    });
    fig.insertBefore(win, fig.firstChild.nextSibling);   // keep the tape on top
    if (reduce) return;

    var i = 0;
    setTimeout(function () {
      setInterval(function () {
        if (document.hidden) return;
        var cur = slides[i]; i = (i + 1) % slides.length; var next = slides[i];
        next.classList.remove("out"); next.classList.add("ready");     // park the next one just off to the right
        void next.offsetWidth;
        cur.classList.remove("on"); cur.classList.add("out");           // current slides out to the left
        next.classList.remove("ready"); next.classList.add("on");      // next slides in, so there is no gap
        setTimeout(function () { cur.classList.add("ready"); cur.classList.remove("out"); }, 750);   // jump back off to the right, out of sight
      }, 3200);
    }, 700 * n);
  });
})();
