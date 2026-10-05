(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  const btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });

  // Product filter
  const tabs = document.querySelectorAll('.tab'), items = document.querySelectorAll('.product');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
    items.forEach(p => p.hidden = t.dataset.filter !== 'all' && p.dataset.cat !== t.dataset.filter);
  }));

  // Reveal + counters
  const animate = el => {
    const target = +el.dataset.count, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('.card,.product,.steps li,.stats>div').forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(animate);
    io.unobserve(e.target);
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Contact form (no backend yet: opens the visitor's mail client)
  const form = document.getElementById('contact-form'), msg = form.querySelector('.form-msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    msg.classList.toggle('err', !ok);
    if (!ok) { msg.textContent = 'Controleer de gemarkeerde velden.'; return; }
    const d = Object.fromEntries(new FormData(form));
    const body = `Naam: ${d.naam}\nBedrijf: ${d.bedrijf}\nE-mail: ${d.email}\n\n${d.bericht}`;
    location.href = `mailto:info@oxypack.nl?subject=${encodeURIComponent('Offerteaanvraag via website')}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Bedankt! Uw e-mailprogramma wordt geopend om de aanvraag te versturen.';
    form.reset();
  });
})();
