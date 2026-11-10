/* Founder's note: a sealed envelope. Tap it: the flap opens, the letter slides out, the envelope falls away. */
(function () {
  var env = document.getElementById("env"), letter = document.getElementById("letter");
  if (!env || !letter) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function open() {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    env.setAttribute("aria-expanded", "true"); env.removeAttribute("role"); env.removeAttribute("tabindex"); env.removeAttribute("aria-label");
    setTimeout(function () { env.classList.add("rise"); }, reduce ? 0 : 550);
    setTimeout(function () {
      var from = env.offsetHeight;
      env.classList.add("out");                       // the letter takes its full size, the envelope falls away
      var to = letter.offsetHeight;
      env.style.height = from + "px"; env.offsetHeight; env.style.height = to + "px";
      setTimeout(function () { env.style.height = "auto"; env.classList.add("done"); }, reduce ? 0 : 900);
    }, reduce ? 0 : 1250);
  }
  env.addEventListener("click", open);
  env.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
})();
