/* Swaram enquiry form: the same Wix form as the Framer site.
   - Fills every <div class="wform"> on the page (the Visit section) with the form.
   - Adds a pop-up with the same form. It opens by itself once per visit at 50% scroll,
     and from any link or button with data-enquire (e.g. a "Schedule a call" button).
   - Sends to the "Swaram enquiry" form in the Swaram Wix dashboard. */
(function () {
  var FORM_ID = "2ab3223f-e514-4bc0-a72b-2b7fb319884c", CLIENT_ID = "c4e9078a-3b2d-4b7b-8b00-d4a29d9c2c05";
  var n = 0;

  function fieldsHTML() {
    var p = "swq" + (++n) + "-";
    function f(id, label, name, extra, wide) {
      return '<div class="field' + (wide ? " wide" : "") + '"><label for="' + p + id + '">' + label + '</label><input id="' + p + id + '" name="' + name + '" ' + (extra || "") + '><div class="err"></div></div>';
    }
    return '<form novalidate><div class="grid">'
      + f("fn", "Father's name *", "father_name_tuq0x9", 'required autocomplete="name"')
      + f("mn", "Mother's name *", "mother_name_2spxvk", "required")
      + f("fp", "Father's phone number *", "father_phone_bf2vjx", 'type="tel" required data-phone placeholder="98765 43210" autocomplete="tel"')
      + f("mp", "Mother's phone number", "mother_phone_556m0y", 'type="tel" data-phone placeholder="98765 43210"')
      + f("fo", "Father's occupation", "father_occupation_grjoxo")
      + f("mo", "Mother's occupation", "mother_occupation_ux4cjm")
      + f("cn", "Child's name *", "child_name_axfoeh", "required")
      + f("cd", "Child's date of birth *", "child_dob_mshtv9", 'type="date" required max="' + new Date().toISOString().slice(0, 10) + '"')
      + f("em", "Email ID *", "email_pquo1c", 'type="email" required data-email autocomplete="email" placeholder="you@example.com"', true)
      + '</div><button class="send" type="submit">Schedule a call <span aria-hidden="true">→</span></button><p class="msg" role="status"></p></form>';
  }

  function phone(v) { var d = v.replace(/[^\d+]/g, ""); if (/^\d{10}$/.test(d)) d = "+91" + d; if (/^91\d{10}$/.test(d)) d = "+" + d; return d; }
  function check(inp) {
    var v = inp.value.trim(), m = "";
    if (inp.required && !v) m = "Please fill this in.";
    else if (v && inp.hasAttribute("data-email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) m = "Enter an email like name@example.com.";
    else if (v && inp.hasAttribute("data-phone") && !/^\+\d{8,15}$/.test(phone(v))) m = "Enter a valid phone number.";
    else if (v && inp.type === "date" && v > new Date().toISOString().slice(0, 10)) m = "The date can't be in the future.";
    inp.parentElement.querySelector(".err").textContent = m;
    return !m;
  }

  // put a working form into `holder`
  function mount(holder) {
    holder.innerHTML = fieldsHTML();
    var form = holder.querySelector("form"), msg = form.querySelector(".msg");
    [].forEach.call(form.querySelectorAll("input"), function (inp) {
      inp.addEventListener("input", function () { inp.dataset.touched = "1"; });
      inp.addEventListener("blur", function () { if (inp.dataset.touched) check(inp); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = [].slice.call(form.querySelectorAll("input")), ok = true, firstBad = null;
      inputs.forEach(function (i) { if (!check(i)) { ok = false; firstBad = firstBad || i; } });
      if (!ok) { firstBad.focus(); return; }
      var values = {};
      inputs.forEach(function (i) { var v = i.value.trim(); if (v) values[i.name] = i.hasAttribute("data-phone") ? phone(v) : v; });
      var btn = form.querySelector(".send"); btn.disabled = true; msg.textContent = "Sending…";
      fetch("https://www.wixapis.com/oauth2/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId: CLIENT_ID, grantType: "anonymous" }) })
        .then(function (r) { if (!r.ok) throw new Error("auth"); return r.json(); })
        .then(function (t) {
          return fetch("https://www.wixapis.com/form-submission-service/v4/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: t.access_token },
            body: JSON.stringify({ submission: { formId: FORM_ID, submissions: values } })
          });
        })
        .then(function (r) { if (!r.ok) throw new Error("send"); return r.json(); })
        .then(function () {
          holder.innerHTML = '<div class="done"><p class="script red">Thank you!</p><h3>We got your enquiry.</h3><p>We\'ll call you soon to plan your visit to Swaram.</p></div>';
          try { sessionStorage.setItem("swq-auto", "1"); } catch (err) {}
        })
        .catch(function () { btn.disabled = false; msg.textContent = "Sorry, that didn't go through. Please try again in a moment."; });
    });
  }

  // 1) the inline form in the Visit section
  [].forEach.call(document.querySelectorAll(".wform"), mount);

  // 2) the pop-up
  var box = document.createElement("div");
  box.className = "swq"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "swq-title");
  box.innerHTML = '<div class="swq-card"><button class="swq-x" type="button" aria-label="Close">×</button>'
    + '<p class="script red swq-hi">Loving what you see?</p><h2 id="swq-title">Schedule a call with Swaram</h2>'
    + '<p class="swq-lead">Share a few details and we\'ll call you to plan your visit.</p><div class="wform swq-form"></div></div>';
  document.body.appendChild(box);
  mount(box.querySelector(".swq-form"));
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    box.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    var first = box.querySelector("input"); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 80);
  }
  function close() {
    box.classList.remove("open");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  box.querySelector(".swq-x").addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("open")) close(); });
  window.SwaramForm = { open: open, close: close };

  // every "Schedule a call" button (data-enquire) opens the pop-up
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-enquire]");
    if (!a) return;
    e.preventDefault(); open();
  });

  // once per visit at 50% scroll (not while the preloader is showing; opening it from a button doesn't count)
  function seen() { try { return sessionStorage.getItem("swq-auto") === "1"; } catch (e) { return false; } }
  addEventListener("scroll", function () {
    if (seen() || box.classList.contains("open") || document.body.classList.contains("is-loading")) return;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0 && pageYOffset / h >= 0.5) { try { sessionStorage.setItem("swq-auto", "1"); } catch (e) {} open(); }
  }, { passive: true });
})();
