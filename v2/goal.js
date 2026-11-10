/* "Our goal": the rings grow out from the child when the section comes into view.
   Hover or tap a ring, a sticker or a card to light up that relationship. */
(function () {
  var sec = document.querySelector(".goal"); if (!sec) return;
  new IntersectionObserver(function (es, o) {
    if (es[0].isIntersecting) { sec.classList.add("grown"); o.disconnect(); }
  }, { threshold: 0.25 }).observe(sec);

  var parts = sec.querySelectorAll("[data-k]"), pinned = null;
  function light(k) {
    sec.classList.toggle("focus", k !== null);
    [].forEach.call(parts, function (el) { el.classList.toggle("on", el.getAttribute("data-k") === String(k)); });
  }
  [].forEach.call(parts, function (el) {
    var k = el.getAttribute("data-k");
    el.addEventListener("mouseenter", function () { light(k); });
    el.addEventListener("mouseleave", function () { light(pinned); });
    el.addEventListener("focus", function () { light(k); });
    el.addEventListener("blur", function () { light(pinned); });
    el.addEventListener("click", function () { pinned = pinned === k ? null : k; light(pinned); });
  });
})();
