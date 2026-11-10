/* VOICE letters: each one plays a soft piano note when tapped (C D E G A, so any order sounds nice).
   The tone is made in the browser (no sound files): a few harmonics with a quick attack and a long fade. */
(function () {
  var letters = document.querySelectorAll("#voice .v");
  if (!letters.length) return;
  var NOTES = [261.63, 293.66, 329.63, 392.0, 440.0];   // C4 D4 E4 G4 A4
  var ctx = null;
  function note(freq) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    var t = ctx.currentTime, out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.32, t + 0.008);   // hammer strike
    out.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);   // string fades
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(freq * 8, t); lp.frequency.exponentialRampToValueAtTime(freq * 2, t + 1.2);
    out.connect(lp); lp.connect(ctx.destination);
    [[1, 1], [2, .45], [3, .22], [4, .1], [5, .06]].forEach(function (h) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * h[0] * (1 + (h[0] - 1) * 0.0007);   // slight stretch, like real strings
      g.gain.value = h[1]; o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 2.3);
    });
  }
  [].forEach.call(letters, function (el, i) {
    el.addEventListener("pointerdown", function () { note(NOTES[i % NOTES.length]); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") note(NOTES[i % NOTES.length]); });
  });
})();
