import { createFormStore, FORM_ERROR } from "/js/wix/form-store.js";

const FORM_ID = "2ab3223f-e514-4bc0-a72b-2b7fb319884c";

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function inputType(control) {
  return { email: "email", url: "url", phone: "tel", password: "password", number: "number", date: "date", time: "time", datetime: "datetime-local" }[control] || "text";
}

function mount(host) {
  const prefix = host.dataset.form + "-";
  const store = createFormStore({ formId: FORM_ID });
  let built = false;

  function buildFields(s) {
    const step = s.form.steps[s.step] || s.form.steps[0];
    const fields = s.form.fields.filter((f) => !step || !f.stepId || f.stepId === step.id);
    const odd = fields.length % 2 === 1;
    let html = '<form novalidate><div class="grid">';
    fields.forEach((f, i) => {
      const id = prefix + f.target;
      const wide = odd && i === fields.length - 1;
      const mark = f.required ? " *" : "";
      html += '<div class="field' + (wide ? " wide" : "") + '">';
      html += '<label for="' + esc(id) + '"' + (f.showLabel === false ? ' class="sr"' : "") + ">" + esc(f.label) + mark + "</label>";
      if (["payment", "appointment", "unknown"].indexOf(f.control) >= 0) {
        html += "<p>This field can't be filled in here.</p>";
      } else {
        const attrs = [];
        if (f.control === "date" && f.validation && f.validation.maxDate) attrs.push('max="' + esc(String(f.validation.maxDate).slice(0, 10)) + '"');
        if (f.placeholder) attrs.push('placeholder="' + esc(f.placeholder) + '"');
        if (f.required) attrs.push("required");
        if (f.readOnly) attrs.push("disabled");
        if (f.control === "email") attrs.push('autocomplete="email"');
        if (f.control === "phone") attrs.push('autocomplete="tel"');
        html += '<input id="' + esc(id) + '" name="' + esc(f.target) + '" type="' + inputType(f.control) + '" value="' + esc(s.values[f.target] || "") + '" ' + attrs.join(" ") + ">";
      }
      if (f.description) html += '<p class="hint">' + esc(f.description) + "</p>";
      html += '<p class="err" data-err="' + esc(f.target) + '" role="alert"></p>';
      html += "</div>";
    });
    html += '</div><p class="form-err" role="alert"></p>';
    html += '<div class="actions"><button class="btn btn-solid" type="submit">' + esc(s.form.submitText || "Send enquiry") + "</button></div></form>";
    host.innerHTML = html;
    const formEl = host.querySelector("form");
    formEl.addEventListener("input", (e) => { if (e.target.name) store.setValue(e.target.name, e.target.value); });
    formEl.addEventListener("focusout", (e) => { if (e.target.name) store.validate(e.target.name); });
    formEl.addEventListener("submit", (e) => {
      const st = store.getState();
      if (st.form && st.step < st.form.steps.length - 1) store.next(e);
      else store.submit(e);
    });
    built = true;
  }

  function render(s) {
    if (s.outcome) {
      if (s.outcome.url) {
        if (s.outcome.newTab) window.open(s.outcome.url, "_blank", "noopener"); else window.location.href = s.outcome.url;
        return;
      }
      const msg = (s.outcome.message || "Thank you! We'll call you soon to plan your visit to Swaram.").split("\n").map(esc).join("<br>");
      host.innerHTML = '<p class="thanks">' + msg + "</p>";
      built = false;
      return;
    }
    if (!s.form) {
      host.innerHTML = s.errors && s.errors[FORM_ERROR]
        ? '<p class="form-err">' + esc(s.errors[FORM_ERROR]) + "</p>"
        : '<p class="loadline">Loading the form…</p>';
      built = false;
      return;
    }
    if (s.closed) {
      host.innerHTML = "<p>" + esc(s.form.disabledMessage || "We're not taking enquiries online right now. Please check back soon.") + "</p>";
      built = false;
      return;
    }
    if (!built) buildFields(s);
    host.querySelectorAll("[data-err]").forEach((p) => {
      const t = p.getAttribute("data-err");
      const msg = s.errors[t] || "";
      p.textContent = msg;
      const input = host.querySelector('[name="' + t + '"]');
      if (input) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    });
    const fe = host.querySelector(".form-err");
    if (fe) fe.textContent = s.errors[FORM_ERROR] || "";
    const btn = host.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = !!s.loading; btn.setAttribute("aria-busy", s.loading ? "true" : "false"); btn.textContent = s.loading ? "Sending…" : (s.form.submitText || "Send enquiry"); }
  }

  store.subscribe(render);
  render(store.getState());
  store.start();
}

document.querySelectorAll("[data-form]").forEach(mount);
