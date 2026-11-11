/* "A day in the life": the day's timetable on a clock. Tap a time (or use the arrows on the card):
   the hands swing round and the card shows that part of the day.
   Change the times, words or photos here. The times are placeholders until Swaram confirms the real ones. */
(function () {
  var DAY = [
    { h: 9,  m: 0,  title: "Movement play", text: "The sandpit and the garden, first thing in the morning.", img: "img/photos/day-morning.webp", alt: "Children playing in a sandpit" },
    { h: 9,  m: 30, title: "Visual work: plan your day", text: "Children plan their own day and draw it out.", img: "img/photos/hero-3.webp", alt: "A child doing paper crafts at a small table" },
    { h: 10, m: 0,  title: "Circle time", text: "Songs, stories and a hundred questions, together on the mat.", img: "img/photos/day-circle.webp", alt: "Children sitting together in a circle, laughing" },
    { h: 10, m: 30, title: "Fruit break", text: "Fresh fruit, shared together.", img: "img/photos/iv-career.webp", alt: "A girl pouring water at a practical-life tray" },
    { h: 11, m: 0,  title: "Sensory play", text: "Sand, water and clay to touch, pour and explore.", img: "img/photos/iv-society.webp", alt: "A group of children playing together in the sand" },
    { h: 11, m: 30, title: "Arts", text: "Dance, theatre, painting or drawing.", img: "img/photos/day-arts.webp", alt: "Two girls drawing at a table" },
    { h: 12, m: 15, title: "Lunch", text: "A warm meal, eaten together.", img: "img/photos/day-lunch.webp", alt: "Children eating lunch together" },
    { h: 13, m: 0,  title: "Story time", text: "Big books and little listeners.", img: "img/photos/pg-k2.webp", alt: "A girl concentrating on a class activity" },
    { h: 13, m: 30, title: "Free play", text: "Time to follow their own curiosity.", img: "img/photos/iv-nature.webp", alt: "Children exploring plants in a garden" }
  ];
  var COLORS = ["#FFE57A", "#CFDDFF", "#FFC9B8", "#C3EBDA", "#E8D7FF", "#FFE57A", "#FFC9B8", "#C3EBDA", "#CFDDFF"];
  var clk = document.getElementById("clk"); if (!clk) return;
  var pins = document.getElementById("clk-pins"), hour = document.getElementById("clk-hour"), min = document.getElementById("clk-min");
  var card = document.getElementById("clk-card"), img = document.getElementById("clk-img");

  function label(s) {
    var h12 = s.h % 12 || 12;
    return { short: h12 + ":" + (s.m < 10 ? "0" : "") + s.m, long: h12 + ":" + (s.m < 10 ? "0" : "") + s.m + (s.h < 12 ? " am" : " pm") };
  }

  // hour ticks, drawn like a doodle
  var ticks = clk.querySelector(".clk-ticks"), NS = "http://www.w3.org/2000/svg";
  for (var i = 0; i < 12; i++) {
    var a = i * 30 * Math.PI / 180, big = i % 3 === 0;
    var l = document.createElementNS(NS, "line");
    l.setAttribute("x1", 200 + Math.sin(a) * (big ? 128 : 136)); l.setAttribute("y1", 200 - Math.cos(a) * (big ? 128 : 136));
    l.setAttribute("x2", 200 + Math.sin(a) * 150); l.setAttribute("y2", 200 - Math.cos(a) * 150);
    if (big) l.setAttribute("class", "big");
    ticks.appendChild(l);
  }

  // the hands only ever turn forward
  var hourAt = null, minAt = null, cur = 0;
  function forward(c, target) { var d = ((target - c) % 360 + 360) % 360; return c + d; }
  function show(k) {
    cur = k;
    var s = DAY[k], hT = ((s.h % 12) + s.m / 60) * 30, mT = s.m * 6, L = label(s);
    if (hourAt === null) { hourAt = hT; minAt = mT; }
    else { hourAt = forward(hourAt, hT); minAt = forward(minAt, mT) + 360; }
    hour.style.transform = "rotate(" + hourAt + "deg)";
    min.style.transform = "rotate(" + minAt + "deg)";
    [].forEach.call(pins.children, function (b, j) { b.classList.toggle("on", j === k); b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    card.style.setProperty("--tint", COLORS[k]);
    document.getElementById("clk-time").textContent = L.long + "  ·  " + (k + 1) + " of " + DAY.length;
    document.getElementById("clk-title").textContent = s.title;
    document.getElementById("clk-text").textContent = s.text;
    img.src = s.img; img.alt = s.alt;
  }
  DAY.forEach(function (s, k) {
    var a = ((s.h % 12) + s.m / 60) * 30 * Math.PI / 180;
    var r = 37.5;                                  // small dots, sitting on the clock's edge
    var b = document.createElement("button");
    b.type = "button"; b.className = "clk-pin"; b.setAttribute("data-t", label(s).short);
    b.style.left = (50 + Math.sin(a) * r) + "%"; b.style.top = (50 - Math.cos(a) * r) + "%";
    b.style.setProperty("--c", COLORS[k]);
    b.setAttribute("aria-label", label(s).long + ": " + s.title);
    b.addEventListener("click", function () { show(k); });
    pins.appendChild(b);
  });

  // step through the day from the card
  var nav = document.createElement("div"); nav.className = "clk-nav";
  nav.innerHTML = '<button type="button" aria-label="Earlier in the day">&lsaquo;</button><button type="button" aria-label="Later in the day">&rsaquo;</button>';
  nav.children[0].addEventListener("click", function () { show((cur + DAY.length - 1) % DAY.length); });
  nav.children[1].addEventListener("click", function () { show((cur + 1) % DAY.length); });
  card.appendChild(nav);

  show(0);
})();
