/* Órbita de portada. El contenido (tarjetas y paneles) está en el HTML; aquí solo va el movimiento.
   Corre después del script principal, que crea Lenis y registra ScrollTrigger (window.__hlLenis). */
window.addEventListener('DOMContentLoaded', function () {
  var stage = document.getElementById('servicios');
  if (!stage) return;
  var reduce = stage.classList.contains('rm');
  var ring = document.getElementById('oRing');
  var cards = [].slice.call(ring.querySelectorAll('.o-card'));
  var words = [].slice.call(stage.querySelectorAll('.o-w'));
  var colors = cards.map(function (c) { return c.dataset.color; });
  var N = cards.length, STEP = 360 / N;
  var panel = document.getElementById('oPanel'), sheet = document.getElementById('oSheet');
  var pcs = [].slice.call(panel.querySelectorAll('.o-pc'));
  var visual = document.getElementById('oVisual');
  var panelOpen = false, lastFocus = null, auto = null;
  var lenis = window.__hlLenis || null;
  var hasGsap = typeof gsap !== 'undefined';

  function setAccent(c) { stage.style.setProperty('--accent', c); panel.style.setProperty('--accent', c); }

  /* ---------- Panel ---------- */
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  document.getElementById('oClose').addEventListener('click', closePanel);
  document.getElementById('oScrim').addEventListener('click', closePanel);
  window.addEventListener('keydown', function (e) {
    if (!panelOpen) return;
    if (e.key === 'Escape') closePanel();
    if (e.key === 'Tab') {
      var f = [].slice.call(sheet.querySelectorAll('button, a[href]')).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  function openPanel(i, from) {
    lastFocus = document.activeElement;
    setAccent(colors[i]);
    pcs.forEach(function (p, k) { p.hidden = k !== i; });
    panel.setAttribute('aria-labelledby', pcs[i].querySelector('h3').id);
    visual.innerHTML = '';
    visual.appendChild(cards[i].querySelector('.o-scene').cloneNode(true));
    visual.firstChild.style.transform = '';
    panel.hidden = false; panel.classList.add('open'); panelOpen = true;
    if (lenis) lenis.stop();
    document.getElementById('oClose').focus();
    if (reduce || !hasGsap) { document.getElementById('oScrim').style.opacity = 1; return; }
    var tl = gsap.timeline();
    tl.to('#oScrim', { opacity: 1, duration: .4 }, 0);
    if (from) {
      var r = from.getBoundingClientRect(), s = sheet.getBoundingClientRect();
      tl.fromTo(sheet, { clipPath: 'inset(' + Math.max(0, r.top - s.top) + 'px ' + Math.max(0, s.right - r.right) + 'px ' + Math.max(0, s.bottom - r.bottom) + 'px ' + Math.max(0, r.left - s.left) + 'px round 22px)' },
        { clipPath: 'inset(0px 0px 0px 0px round 28px)', duration: .85, ease: 'expo.out' }, 0);
    } else tl.fromTo(sheet, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out' }, 0);
    tl.from(pcs[i].children, { y: 24, opacity: 0, duration: .6, stagger: .06, ease: 'expo.out' }, .25);
    tl.from(visual.firstChild, { y: 50, rotate: -4, scale: .9, opacity: 0, duration: 1, ease: 'expo.out' }, .2);
    tl.from(visual.querySelectorAll('.m-chip, .m-pin, .m-wa, .m-row'), { scale: .6, opacity: 0, duration: .6, stagger: .08, ease: 'back.out(2)' }, .5);
  }
  function closePanel() {
    if (!panelOpen) return; panelOpen = false;
    function done() {
      panel.classList.remove('open'); panel.hidden = true;
      if (hasGsap && !reduce) { gsap.set(sheet, { clearProps: 'all' }); gsap.set(pcs.map(function (p) { return p.children; }), { clearProps: 'all' }); }
      if (lenis) lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    if (reduce || !hasGsap) return done();
    gsap.to('#oScrim', { opacity: 0, duration: .35 });
    gsap.to(sheet, { opacity: 0, y: 24, duration: .35, ease: 'power2.in', onComplete: done });
  }

  /* Enlaces internos del panel (p. ej. "Ver proyectos"): cerrar y luego bajar */
  panel.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.querySelector(a.getAttribute('href'));
      closePanel();
      setTimeout(function () {
        if (!t) return;
        if (lenis) lenis.scrollTo(t, { offset: -92, duration: 1.15 }); else t.scrollIntoView({ behavior: 'smooth' });
      }, 420);
    });
  });

  if (reduce || !hasGsap || typeof ScrollTrigger === 'undefined') {
    stage.classList.remove('nojs'); stage.classList.add('rm'); reduce = true;
    words.forEach(function (w) { w.classList.add('on'); });
    cards.forEach(function (el, i) { el.addEventListener('click', function () { openPanel(i); }); });
    return;
  }

  /* ---------- Estado ---------- */
  var portrait = document.getElementById('oPortrait');
  var dots = document.getElementById('oDots');
  var rot = 0, target = 0, vel = 0, spread = 0, pull = 0, dragging = false, active = -1, moved = 0;
  var mx = 0, my = 0, smx = 0, smy = 0;
  function geom() {
    var w = stage.clientWidth, h = stage.clientHeight, narrow = w < 760;
    return { w: w, h: h, rx: narrow ? w * .36 : Math.min(w * .23, 380), ry: h * (narrow ? .06 : .08), cy: h * (narrow ? .68 : .66) - h * .5 };
  }
  stage.addEventListener('scroll', function () { stage.scrollTop = 0; stage.scrollLeft = 0; });
  var G = geom();
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  cards.forEach(function (c, i) {
    var d = document.createElement('button'); d.type = 'button';
    d.setAttribute('aria-label', 'Ir a ' + c.querySelector('strong').textContent);
    d.addEventListener('click', function () { stopAuto(); goTo(i); }); dots.appendChild(d);
  });

  function render() {
    for (var i = 0; i < N; i++) {
      var a = (rot + i * STEP) * Math.PI / 180, s = Math.sin(a), c = Math.cos(a), d = (c + 1) / 2;
      var x = s * G.rx * spread;
      var y = G.cy + c * G.ry * spread + (1 - spread) * G.h * .25;
      var sc = (.6 + .4 * d) * (.7 + .3 * spread);
      var el = cards[i];
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' + (s * -18 * spread).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
      el.style.opacity = (clamp(spread * 1.6) * (.4 + .6 * d)).toFixed(3);
      el.style.zIndex = c > 0 ? 10 : 2;
      el.style.filter = 'brightness(' + (.5 + .5 * d).toFixed(2) + ') blur(' + ((1 - d) * 1.4).toFixed(1) + 'px)';
      var front = c > .93 && spread > .9;
      el.classList.toggle('front', front);
      el.tabIndex = spread > .9 ? 0 : -1;
      el.style.pointerEvents = spread > .9 ? '' : 'none';
      var sceneEl = el.querySelector('.o-scene');
      sceneEl.style.transform = front ? 'translate(' + (smx * 8).toFixed(1) + 'px,' + (smy * 6).toFixed(1) + 'px) rotate(' + (smx * -1.5).toFixed(2) + 'deg)' : '';
    }
    var idx = ((Math.round(-rot / STEP) % N) + N) % N;
    if (idx !== active) { active = idx; syncActive(); }
  }
  function syncActive() {
    setAccent(colors[active]);
    words.forEach(function (w, i) { w.classList.toggle('on', i === active && pull > .6); });
    [].forEach.call(dots.children, function (d, i) { d.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    if (pull > .6) gsap.fromTo(words[active], { scale: .96 }, { scale: 1, duration: .9, ease: 'expo.out' });
  }
  function goTo(i) { var want = -i * STEP; target = want + Math.round((target - want) / 360) * 360; vel = 0; }
  function step(dir) { target = Math.round(target / STEP) * STEP - dir * STEP; vel = 0; }

  /* ---------- Bucle ---------- */
  gsap.ticker.add(function () {
    if (!dragging && Math.abs(vel) > .05) { target += vel; vel *= .94; if (Math.abs(vel) < .6) { target = Math.round(target / STEP) * STEP; vel = 0; } }
    rot += (target - rot) * (dragging ? .35 : .085);
    smx += (mx - smx) * .06; smy += (my - smy) * .06;
    var e = ease(pull);
    gsap.set(portrait, { xPercent: -50, x: smx * -16, y: (1 - e) * G.h * .1 + smy * -6, scale: 1.3 - .3 * e, transformOrigin: '50% 7%' });
    gsap.set('#oWords', { x: smx * 22, y: smy * 8 + (1 - e) * 40, opacity: e });
    render();
  });

  /* ---------- Scroll: cámara + anillo ---------- */
  var cue = document.getElementById('oCue'), nav = document.getElementById('oNav');
  var st = ScrollTrigger.create({
    trigger: stage, start: 'top top', end: '+=130%', pin: true, scrub: .6, refreshPriority: 1,
    onUpdate: function (self) {
      var p = self.progress;
      pull = clamp(p / .45);
      var t = clamp((p - .38) / .42); spread = t * t * (3 - 2 * t);
      cue.style.opacity = 1 - clamp(p / .2);
      nav.style.opacity = spread > .9 ? 1 : 0;
      words.forEach(function (w, i) { w.classList.toggle('on', i === active && pull > .6); });
    }
  });
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  gsap.from(portrait.querySelector('.o-me'), { opacity: 0, scale: 1.08, duration: 1.6, ease: 'expo.out' });

  /* Enlaces a #servicios: llevar al punto donde las tarjetas ya están abiertas */
  document.querySelectorAll('a[href="#servicios"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var y = st.start + (st.end - st.start) * .85;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* Auto-giro suave hasta que el usuario interactúe */
  auto = setInterval(function () { if (spread > .95 && !panelOpen && !dragging) step(1); }, 4200);

  /* ---------- Arrastre ---------- */
  var lastX = 0, lastT = 0, downIdx = -1;
  ring.addEventListener('pointerdown', function (e) {
    if (spread < .9) return;
    stopAuto(); dragging = true; moved = 0; lastX = e.clientX; lastT = performance.now(); vel = 0;
    var t = e.target.closest && e.target.closest('.o-card'); downIdx = t ? cards.indexOf(t) : -1;
    ring.setPointerCapture(e.pointerId); ring.classList.add('dragging');
  });
  function trackMouse(e) {
    var r = stage.getBoundingClientRect();
    mx = (e.clientX / r.width - .5) * 2; my = ((e.clientY - r.top) / r.height - .5) * 2;
    var f = cards[active]; if (f) { var cr = f.getBoundingClientRect(); f.style.setProperty('--mx', (e.clientX - cr.left) + 'px'); f.style.setProperty('--my', (e.clientY - cr.top) + 'px'); }
  }
  ring.addEventListener('pointermove', function (e) {
    trackMouse(e);
    if (!dragging) return;
    var dx = e.clientX - lastX, now = performance.now(); moved += Math.abs(dx);
    var k = 180 / Math.max(stage.clientWidth * .5, 320);
    target += dx * k * 1.6; rot += dx * k * .6;
    vel = vel * .6 + (dx * k * 1.6) / Math.max(1, now - lastT) * 16 * .4;
    lastX = e.clientX; lastT = now;
  });
  function release() {
    if (!dragging) return; dragging = false; ring.classList.remove('dragging');
    if (moved < 6 && downIdx > -1) { vel = 0; target = Math.round(target / STEP) * STEP; if (downIdx === active) openPanel(downIdx, cards[downIdx]); else goTo(downIdx); return; }
    vel = Math.max(-30, Math.min(30, vel));
    if (Math.abs(vel) < 1.2) { target = Math.round(target / STEP) * STEP; vel = 0; }
  }
  ring.addEventListener('pointerup', release); ring.addEventListener('pointercancel', release);
  stage.addEventListener('pointermove', function (e) { if (!e.target.closest('.o-ring')) trackMouse(e); });
  window.addEventListener('keydown', function (e) {
    if (panelOpen || spread < .9 || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    var r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === 'ArrowRight') { stopAuto(); step(1); } else if (e.key === 'ArrowLeft') { stopAuto(); step(-1); }
  });
  document.getElementById('oPrev').addEventListener('click', function () { stopAuto(); step(-1); });
  document.getElementById('oNext').addEventListener('click', function () { stopAuto(); step(1); });
  cards.forEach(function (el, i) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopAuto(); if (i === active) openPanel(i, el); else goTo(i); }
    });
  });

  /* ---------- Polvo de luz ---------- */
  var cv = document.getElementById('oDust'), cx = cv.getContext('2d'), P = [];
  function sizeDust() { var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = stage.clientWidth * dpr; cv.height = stage.clientHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  sizeDust();
  window.addEventListener('resize', function () { G = geom(); sizeDust(); });
  for (var k = 0; k < 46; k++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .4, v: Math.random() * .00035 + .0001, a: Math.random() * .5 + .15, ph: Math.random() * 6.28 });
  gsap.ticker.add(function (time) {
    var r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
    var w = stage.clientWidth, h = stage.clientHeight; cx.clearRect(0, 0, w, h);
    cx.fillStyle = colors[Math.max(0, active)];
    for (var i = 0; i < P.length; i++) {
      var q = P[i]; q.y -= q.v; if (q.y < -.02) { q.y = 1.02; q.x = Math.random(); }
      cx.globalAlpha = q.a * (.6 + .4 * Math.sin(time * 1.5 + q.ph));
      cx.beginPath(); cx.arc(q.x * w + Math.sin(time * .5 + q.ph) * 12 + smx * 20 * q.r, q.y * h, q.r, 0, 6.28); cx.fill();
    }
    cx.globalAlpha = 1;
  });
});
