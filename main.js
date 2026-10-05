(() => {
  const FRAMES = 120;
  const src = i => `frames/f_${String(i + 1).padStart(3, "0")}.jpg`;

  const hero = document.getElementById("hero");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const beats = [...document.querySelectorAll(".beat")];
  const bar = document.getElementById("bar");
  const hint = document.getElementById("hint");
  const nav = document.getElementById("nav");
  const imgs = new Array(FRAMES);
  let target = 0, current = 0, lastDrawn = -1, vw = 0, vh = 0;

  // frames laden: eerste direct, daarna in volgorde
  const load = i => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = () => res();
    im.src = src(i);
    imgs[i] = im;
  });
  load(0).then(() => { draw(true); });
  (async () => { for (let i = 1; i < FRAMES; i += 6) await Promise.all([...Array(6)].map((_, k) => i + k < FRAMES ? load(i + k) : 0)); })();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = canvas.clientWidth; vh = canvas.clientHeight;
    canvas.width = vw * dpr; canvas.height = vh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(true);
  }

  // dichtstbijzijnde geladen frame tekenen (cover-fit)
  function draw(force) {
    let i = Math.round(current * (FRAMES - 1));
    if (i === lastDrawn && !force) return;
    let im = imgs[i];
    for (let d = 1; !(im && im.complete && im.naturalWidth) && d < FRAMES; d++) {
      im = imgs[i - d] && imgs[i - d].complete && imgs[i - d].naturalWidth ? imgs[i - d] : imgs[i + d];
    }
    if (!im || !im.naturalWidth) return;
    const s = Math.max(vw / im.naturalWidth, vh / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (vw - w) / 2, (vh - h) / 2, w, h);
    lastDrawn = i;
  }

  function readScroll() {
    const max = hero.offsetHeight - window.innerHeight;
    const y = -hero.getBoundingClientRect().top;
    target = Math.min(1, Math.max(0, y / max));
    nav.classList.toggle("solid", window.scrollY > 40);
  }

  const ramp = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  function tick() {
    current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.0004) current = target;
    draw();
    bar.style.width = (current * 100) + "%";
    hint.style.opacity = current < 0.03 ? 1 : 0;
    beats.forEach(b => {
      const a = +b.dataset.in, o = +b.dataset.out, f = 0.05;
      const v = Math.min(a === 0 ? 1 : ramp(current, a, a + f), 1 - ramp(current, o - f, o));
      b.style.opacity = v;
      b.style.transform = `translateY(${(1 - v) * 30 * (current < (a + o) / 2 ? 1 : -1)}px)`;
      b.classList.toggle("on", v > 0.5);
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", () => { resize(); readScroll(); });
  resize(); readScroll(); current = target;
  requestAnimationFrame(tick);

  // contactformulier (demo: geen backend, opent e-mailprogramma)
  const form = document.getElementById("form"), note = document.getElementById("note");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    form.querySelectorAll("input").forEach(i => i.classList.toggle("bad", !i.checkValidity()));
    if (!d.naam.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) { note.textContent = "Vul je naam en een geldig e-mailadres in."; return; }
    const body = `Naam: ${d.naam}\nE-mail: ${d.email}\nType: ${d.type}\n\n${d.bericht}`;
    location.href = `mailto:info@oxypack.nl?subject=${encodeURIComponent("Aanvraag: " + d.type)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Bedankt! Je e-mailprogramma opent nu met je aanvraag.";
  });
  document.getElementById("yr").textContent = new Date().getFullYear();
})();
