/* "What we love doing": hover or tap a line on a sticky note to see its photo on the note. */
(function () {
  [].forEach.call(document.querySelectorAll(".sticky"), function (note) {
    var img = note.querySelector(".st-photo img"); if (!img) return;
    var lines = note.querySelectorAll("li[data-img]");
    function show(li) {
      if (img.getAttribute("src") === li.dataset.img) return;
      img.classList.add("swap");
      setTimeout(function () { img.src = li.dataset.img; img.alt = li.dataset.alt || ""; img.classList.remove("swap"); }, 160);
      [].forEach.call(lines, function (l) { l.classList.toggle("on", l === li); });
    }
    [].forEach.call(lines, function (li, i) {
      if (i === 0) li.classList.add("on");
      li.addEventListener("mouseenter", function () { show(li); });
      li.addEventListener("focus", function () { show(li); });
      li.addEventListener("click", function () { show(li); });
    });
  });
})();
