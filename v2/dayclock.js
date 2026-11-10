/* "A day in the life": tap a time on the clock, the hands swing round and the card shows that part of the day.
   Change the times or activities here. */
(function () {
  var DAY = [
    { h: 9,  m: 0,  label: "9:00 am",  title: "Movement play & planning", text: "The sandpit and garden first thing, then children plan and draw their own day.", img: "img/photos/day-morning.webp", alt: "Children playing in a sandpit" },
    { h: 10, m: 30, label: "10:30 am", title: "Circle time & fruit break", text: "Songs, stories and a hundred questions, then fresh fruit shared on the mat.", img: "img/photos/day-circle.webp", alt: "Children sitting together in a circle, laughing" },
    { h: 11, m: 30, label: "11:30 am", title: "Sensory play & arts", text: "Sand, water and clay to explore, then dance, theatre, painting and drawing.", img: "img/photos/day-arts.webp", alt: "Two girls drawing at a table" },
    { h: 12, m: 30, label: "12:30 pm", title: "Lunch, stories & free play", text: "A warm meal together, big books under the tree, and time to follow their own curiosity.", img: "img/photos/day-lunch.webp", alt: "Children eating lunch together" }
  ];
  var COLORS = ["#FFE57A", "#FFC9B8", "#C3EBDA", "#CFDDFF"];
  var clk = document.getElementById("clk"); if (!clk) return;
  var pins = document.getElementById("clk-pins"), hour = document.getElementById("clk-hour"), min = document.getElementById("clk-min");
  var card = document.getElementById("clk-card"), img = document.getElementById("clk-img");

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
  var hourAt = null, minAt = null;
  function forward(cur, target) { var d = ((target - cur) % 360 + 360) % 360; return cur + d; }
  function show(k) {
    var s = DAY[k], hT = ((s.h % 12) + s.m / 60) * 30, mT = s.m * 6;
    if (hourAt === null) { hourAt = hT; minAt = mT; }
    else { hourAt = forward(hourAt, hT); minAt = forward(minAt, mT) + 360; }
    hour.style.transform = "rotate(" + hourAt + "deg)";
    min.style.transform = "rotate(" + minAt + "deg)";
    [].forEach.call(pins.children, function (b, j) { b.classList.toggle("on", j === k); b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    card.style.setProperty("--tint", COLORS[k]);
    document.getElementById("clk-time").textContent = s.label;
    document.getElementById("clk-title").textContent = s.title;
    document.getElementById("clk-text").textContent = s.text;
    img.src = s.img; img.alt = s.alt;
  }
  DAY.forEach(function (s, k) {
    var a = ((s.h % 12) + s.m / 60) * 30 * Math.PI / 180;
    var b = document.createElement("button");
    b.type = "button"; b.className = "clk-pin"; b.textContent = s.label.replace(/ (am|pm)$/, "");
    b.style.left = (50 + Math.sin(a) * 47) + "%"; b.style.top = (50 - Math.cos(a) * 47) + "%";
    b.style.setProperty("--c", COLORS[k]);
    b.setAttribute("aria-label", s.label + ": " + s.title);
    b.addEventListener("click", function () { show(k); });
    pins.appendChild(b);
  });
  show(0);
})();
