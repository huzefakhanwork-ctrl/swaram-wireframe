/* Phones: the menu links fold into a dropdown behind the menu button. */
(function () {
  var nav = document.getElementById("nav"), btn = nav && nav.querySelector(".nav-menu");
  if (!btn) return;
  function set(open) {
    nav.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", function () { set(!nav.classList.contains("menu-open")); });
  document.getElementById("nav-links").addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
})();
